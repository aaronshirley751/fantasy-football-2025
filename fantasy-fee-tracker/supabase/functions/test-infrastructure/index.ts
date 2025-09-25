// Ultra-minimal test function to diagnose infrastructure
console.log("🚀 Test function starting...")

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  console.log("📥 Request received")
  
  try {
    console.log("✅ About to return response")
    
    return new Response(
      JSON.stringify({ 
        status: "success",
        message: "Infrastructure test passed",
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 200 
      }
    )
  } catch (error) {
    console.error("❌ Error:", error)
    return new Response(
      JSON.stringify({ status: "error", message: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    )
  }
})
