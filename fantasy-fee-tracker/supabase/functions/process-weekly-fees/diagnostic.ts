// Create a minimal diagnostic version to isolate the issue
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Ensure Deno types are available
declare const Deno: {
  env: {
    get: (key: string) => string | undefined
  }
}

export default async function handler(req: Request): Promise<Response> {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  }
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  
  const startTime = Date.now()
  
  try {
    console.log(`[0ms] DIAGNOSTIC: Function started`)
    
    const { week_number, league_id } = await req.json()
    console.log(`[${Date.now() - startTime}ms] DIAGNOSTIC: JSON parsed`)
    
    if (!week_number || !league_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: week_number and league_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    console.log(`[${Date.now() - startTime}ms] DIAGNOSTIC: Parameters validated`)
    
    // Initialize Supabase client
    console.log(`[${Date.now() - startTime}ms] DIAGNOSTIC: About to create Supabase client`)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    console.log(`[${Date.now() - startTime}ms] DIAGNOSTIC: Supabase client created`)
    
    // Get league configuration
    console.log(`[${Date.now() - startTime}ms] DIAGNOSTIC: About to fetch league config`)
    const { data: league, error: leagueError } = await supabase
      .from('leagues')
      .select('*')
      .eq('id', league_id)
      .single()
    
    console.log(`[${Date.now() - startTime}ms] DIAGNOSTIC: League query completed`)
    
    if (leagueError || !league) {
      console.log(`[${Date.now() - startTime}ms] DIAGNOSTIC: League not found`)
      return new Response(
        JSON.stringify({ error: 'League not found', details: leagueError }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    console.log(`[${Date.now() - startTime}ms] DIAGNOSTIC: League found: ${league.name || 'Unknown'}`)
    
    // Test simple Sleeper API call
    console.log(`[${Date.now() - startTime}ms] DIAGNOSTIC: About to call Sleeper API`)
    const response = await fetch(`https://api.sleeper.app/v1/league/${league.sleeper_league_id}/matchups/${week_number}`)
    const matchups = await response.json()
    
    console.log(`[${Date.now() - startTime}ms] DIAGNOSTIC: Sleeper API responded with ${matchups?.length || 0} matchups`)
    
    const executionTime = Date.now() - startTime
    console.log(`[${executionTime}ms] DIAGNOSTIC: Function completed successfully`)
    
    const result = {
      success: true,
      diagnostic: true,
      execution_time_ms: executionTime,
      league_id,
      week_number,
      league_name: league.name || 'Unknown',
      matchups_found: matchups?.length || 0,
      steps_completed: [
        'JSON parsing',
        'Parameter validation', 
        'Supabase client creation',
        'League config fetch',
        'Sleeper API call',
        'Function completion'
      ]
    }
    
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    const executionTime = Date.now() - startTime
    console.error(`[${executionTime}ms] DIAGNOSTIC ERROR:`, error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Diagnostic function failed', 
        details: error.message,
        execution_time_ms: executionTime,
        stack: error.stack
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}
