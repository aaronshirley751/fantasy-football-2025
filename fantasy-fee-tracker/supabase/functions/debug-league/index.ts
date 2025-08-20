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
    
    // Get league configuration
    const { data: league, error } = await supabase
      .from('leagues')
      .select('*')
      .eq('id', league_id)
      .single()

    if (error) {
      console.error('Database error:', error)
      return Response.json({ error: 'Database error', details: error }, { status: 500, headers: corsHeaders })
    }

    if (!league) {
      return Response.json({ error: 'League not found' }, { status: 404, headers: corsHeaders })
    }

    // Test Sleeper API with the stored league ID
    let sleeperResponse = null
    if (league.sleeper_league_id) {
      try {
        const response = await fetch(`https://api.sleeper.app/v1/league/${league.sleeper_league_id}/users`)
        sleeperResponse = {
          status: response.status,
          ok: response.ok,
          data: response.ok ? await response.json() : await response.text()
        }
      } catch (error) {
        sleeperResponse = { error: error.message }
      }
    }

    return Response.json({
      league_config: league,
      sleeper_api_test: sleeperResponse
    }, { headers: corsHeaders })

  } catch (error) {
    console.error('Error:', error)
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders })
  }
})
