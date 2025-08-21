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

    const { league_id } = await req.json()
    
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

    return Response.json({
      database_info: leagueDebugInfo,
      specific_league: specificLeague,
      sleeper_api_test: sleeperResponse
    }, { headers: corsHeaders })

  } catch (error) {
    console.error('Error:', error)
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders })
  }
})
