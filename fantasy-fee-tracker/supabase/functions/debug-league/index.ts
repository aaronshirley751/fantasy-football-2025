import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { league_id, action, new_sleeper_league_id, free_transactions } = await req.json()
    
    // Handle update action for 2025 transition
    if (action === 'update_sleeper_league_id' && new_sleeper_league_id) {
      const { data: updatedLeague, error: updateError } = await supabase
        .from('leagues')
        .update({ sleeper_league_id: new_sleeper_league_id })
        .eq('id', 'd06f0672-2848-4b5d-86f5-9ab559605b4f')
        .select()
        .single()
      
      if (updateError) {
        return new Response(
          JSON.stringify({ error: updateError.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Sleeper league ID updated successfully for 2025 season',
          updatedLeague: updatedLeague 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Handle free transactions configuration update
    if (action === 'update_free_transactions' && free_transactions !== undefined) {
      const { data: updatedLeague, error: updateError } = await supabase
        .from('leagues')
        .update({ free_transactions_per_season: free_transactions })
        .eq('id', 'd06f0672-2848-4b5d-86f5-9ab559605b4f')
        .select()
        .single()
      
      if (updateError) {
        return new Response(
          JSON.stringify({ error: updateError.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Free transactions per season updated to: ${free_transactions}`,
          updatedLeague: updatedLeague 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // First, check all leagues in the database
    const { data: allLeagues, error: allLeaguesError } = await supabase
      .from('leagues')
      .select('*')

    let leagueDebugInfo: any = {
      allLeaguesError,
      totalLeagues: allLeagues?.length || 0,
      allLeagues: allLeagues || []
    }
    
    // Get specific league configuration if league_id provided
    let specificLeague: any = null
    if (league_id) {
      const { data: league, error } = await supabase
        .from('leagues')
        .select('*')
        .eq('id', league_id)
        .single()

      if (error) {
        console.error('Database error:', error)
        leagueDebugInfo = { ...leagueDebugInfo, specificLeagueError: error }
      } else {
        specificLeague = league
      }
    }

    // Test Sleeper API with the stored league ID
    let sleeperResponse: any = null
    if (specificLeague?.sleeper_league_id) {
      try {
        const response = await fetch(`https://api.sleeper.app/v1/league/${specificLeague.sleeper_league_id}/users`)
        sleeperResponse = {
          status: response.status,
          ok: response.ok,
          data: response.ok ? await response.json() : await response.text()
        }
      } catch (error: any) {
        sleeperResponse = { error: error.message }
      }
    }

    let feeSummaries: any[] = []
    let feeSummariesError: any = null
    let transactionStats: any[] = []
    let recentFees: any[] = []

    if (league_id) {
      const { data: summaries, error: summariesError } = await supabase
        .from('fee_summaries')
        .select('*')
        .eq('league_id', league_id)
        .order('total_owed', { ascending: false })

      if (summariesError) {
        feeSummariesError = summariesError
      } else if (summaries) {
        feeSummaries = summaries
      }

      const { data: transactionSummary } = await supabase
        .from('transactions')
        .select('roster_id, fee_amount, type')
        .eq('league_id', league_id)

      const ownerNameMap = new Map<number, string>()
      feeSummaries.forEach((summary: any) => {
        ownerNameMap.set(Number(summary.roster_id), summary.owner_name)
      })

      if (transactionSummary) {
        const statsMap = new Map<number, { transactions_used: number; paid_transactions: number; free_transactions_remaining: number }>()
        transactionSummary.forEach((record: any) => {
          const rosterId = Number(record.roster_id)
          const entry = statsMap.get(rosterId) || { transactions_used: 0, paid_transactions: 0, free_transactions_remaining: 10 }
          if (['waiver', 'free_agent'].includes(record.type)) {
            entry.transactions_used += 1
            entry.free_transactions_remaining = Math.max(0, entry.free_transactions_remaining - 1)
          }
          if (Number(record.fee_amount || 0) > 0) {
            entry.paid_transactions += 1
          }
          statsMap.set(rosterId, entry)
        })
        transactionStats = Array.from(statsMap.entries()).map(([rosterId, value]) => ({
          roster_id: rosterId,
          owner_name: ownerNameMap.get(rosterId) || `Roster ${rosterId}`,
          ...value
        }))
      }

      const { data: feeEvents } = await supabase
        .from('inactive_penalties')
        .select('*')
        .eq('league_id', league_id)
        .order('created_at', { ascending: false })
        .limit(10)

      recentFees = feeEvents || []
    }

    return Response.json({
      database_info: leagueDebugInfo,
      specific_league: specificLeague,
      sleeper_api_test: sleeperResponse,
      fee_summaries: feeSummaries,
      fee_summaries_error: feeSummariesError,
      transaction_stats: transactionStats,
      recent_fees: recentFees
    }, { headers: corsHeaders })

  } catch (error) {
    console.error('Error:', error)
    const message = error instanceof Error ? error.message : String(error)
    return Response.json({ error: message }, { status: 500, headers: corsHeaders })
  }
})
