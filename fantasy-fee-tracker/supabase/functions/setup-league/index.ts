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

    const { action } = await req.json()
    
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
