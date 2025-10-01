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

    const { action, league_id_2025 } = await req.json()
    
     if (action === 'update_current_league') {
       // Update the current league (a7d65b53-2ec5-4b38-94ee-7fcb97160989) with 2025 Sleeper league ID
       if (!league_id_2025) {
         return new Response(
           JSON.stringify({ 
             error: 'league_id_2025 parameter required',
             message: 'Please provide the 2025 Sleeper league ID'
           }),
           { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
         )
       }

       const { data: league, error: leagueError } = await supabase
         .from('leagues')
         .update({
           sleeper_league_id: league_id_2025,
           league_name: 'Fantasy Football 2025 - Live Season'
         })
         .eq('id', 'a7d65b53-2ec5-4b38-94ee-7fcb97160989')
         .select()
         .single()

       if (leagueError) {
         throw new Error(`Failed to update current league: ${leagueError.message}`)
       }

       return new Response(
         JSON.stringify({ 
           success: true, 
           message: `Current league updated successfully for 2025 season with league ID: ${league_id_2025}`,
           league: league
         }),
         { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
       )
     }
   
    if (action === 'setup_2025_league') {
      // Clear all test data first
      console.log('🧹 Clearing test data...')
      
      // Clear transactions
      await supabase.from('transactions').delete().eq('league_id', 'd06f0672-2848-4b5d-86f5-9ab559605b4f')
      
      // Clear matchups
      await supabase.from('matchups').delete().eq('league_id', 'd06f0672-2848-4b5d-86f5-9ab559605b4f')
      
      // Clear inactive penalties
      await supabase.from('inactive_penalties').delete().eq('league_id', 'd06f0672-2848-4b5d-86f5-9ab559605b4f')
      
  // Clear fee summaries
  await supabase.from('fee_summaries').delete().eq('league_id', 'd06f0672-2848-4b5d-86f5-9ab559605b4f')
      
      // Clear users (will be repopulated from 2025 league)
      await supabase.from('users').delete().eq('league_id', 'd06f0672-2848-4b5d-86f5-9ab559605b4f')
      
      console.log('✅ Test data cleared')
      
      // Update league to 2025 configuration
      if (!league_id_2025) {
        return new Response(
          JSON.stringify({ 
            error: 'league_id_2025 parameter required',
            message: 'Please provide the 2025 Sleeper league ID'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }
      
      const { data: league, error: leagueError } = await supabase
        .from('leagues')
        .update({
          sleeper_league_id: league_id_2025,
          league_name: 'Fantasy Football 2025 - Live Season',
          free_transactions_per_season: 10
        })
        .eq('id', 'd06f0672-2848-4b5d-86f5-9ab559605b4f')
        .select()
        .single()

      if (leagueError) {
        throw new Error(`Failed to update league: ${leagueError.message}`)
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `League updated successfully for 2025 season with league ID: ${league_id_2025}`,
          league: league,
          cleared_tables: ['transactions', 'matchups', 'inactive_penalties', 'fee_summaries', 'users']
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    if (action === 'setup_league') {
      // Update the existing league record with the 2024 league ID that has actual historical data
      const { data: league, error: leagueError } = await supabase
        .from('leagues')
        .update({
          sleeper_league_id: '1124838170135900160', // 2024 completed league with real data
          league_name: 'Fantasy Football 2024 - Historical Testing'
        })
        .eq('id', 'd06f0672-2848-4b5d-86f5-9ab559605b4f')
        .select()
        .single()

      if (leagueError) {
        throw new Error(`Failed to update league: ${leagueError.message}`)
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'League updated successfully with 2024 historical data league ID',
          league: league
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'update_free_transactions') {
      // Update the league to set free_transactions_per_season to 10
      const { data: league, error: leagueError } = await supabase
        .from('leagues')
        .update({
          free_transactions_per_season: 10
        })
        .eq('id', 'd06f0672-2848-4b5d-86f5-9ab559605b4f')
        .select()
        .single()

      if (leagueError) {
        throw new Error(`Failed to update free transactions: ${leagueError.message}`)
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Free transactions per season updated to 10',
          league: league
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Default: Check database state
    const { data: allLeagues, error: allLeaguesError } = await supabase
      .from('leagues')
      .select('*')

    const { data: allMatchups, error: matchupsError } = await supabase
      .from('matchups')
      .select('*')
      .limit(5)

    const { data: allTransactions, error: transactionsError } = await supabase
      .from('transactions')
      .select('*')
      .limit(5)

    return new Response(
      JSON.stringify({
        success: true,
        database_info: {
          leagues: {
            count: allLeagues?.length || 0,
            data: allLeagues || [],
            error: allLeaguesError
          },
          matchups: {
            count: allMatchups?.length || 0,
            recent: allMatchups || [],
            error: matchupsError
          },
          transactions: {
            count: allTransactions?.length || 0,
            recent: allTransactions || [],
            error: transactionsError
          }
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
