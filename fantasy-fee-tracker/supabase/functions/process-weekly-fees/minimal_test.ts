// Ultra-minimal test function to verify runtime works
export default async function handler(req: Request): Promise<Response> {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  }
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  
  console.log('ULTRA-MINIMAL TEST: Function started successfully')
  
  try {
    const startTime = Date.now()
    
    // Just return success immediately
    const result = {
      success: true,
      message: 'Ultra-minimal test function working!',
      timestamp: new Date().toISOString(),
      execution_time_ms: Date.now() - startTime
    }
    
    console.log('ULTRA-MINIMAL TEST: Returning success response')
    
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    console.error('ULTRA-MINIMAL TEST ERROR:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Ultra-minimal test failed', 
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}
