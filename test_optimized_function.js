// Test the optimized function with performance monitoring
console.log("🚀 TESTING OPTIMIZED FUNCTION - Performance Validation");
console.log("=" * 60);

async function testOptimizedFunction() {
  const startTime = Date.now();
  
  try {
    console.log("📡 Calling optimized Supabase function...");
    console.log("🎯 Target: <30 seconds execution (was 90+ seconds before)");
    console.log("");
    
    const response = await fetch('https://jfeuobfjgqownybluvje.supabase.co/functions/v1/process-weekly-fees', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmdWVvYmZqZ3Fvd255Ymx1dmplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQzODk0MjcsImV4cCI6MjAzOTk2NTQyN30.4wpfJzJhARmJeVvRjLlPgKaE1P8FkPWfhzX0QAvhUK0',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        week_number: 16,
        league_id: 'd06f0672-2848-4b5d-86f5-9ab559605b4f'
      })
    });
    
    const result = await response.json();
    const totalTime = Date.now() - startTime;
    
    console.log("📊 PERFORMANCE TEST RESULTS:");
    console.log("=" * 40);
    console.log(`⏱️  Client-side total time: ${totalTime}ms`);
    console.log(`🎯 Function execution time: ${result.execution_time_ms || 'N/A'}ms`);
    console.log(`📈 Performance status: ${result.performance_status || 'N/A'}`);
    console.log("");
    
    console.log("🔧 OPTIMIZATIONS APPLIED:");
    if (result.optimizations_applied) {
      Object.entries(result.optimizations_applied).forEach(([key, value]) => {
        console.log(`   ${value ? '✅' : '❌'} ${key}: ${value}`);
      });
    } else {
      console.log("   ⚠️  No optimization data returned");
    }
    console.log("");
    
    console.log("🎮 PROCESSING RESULTS:");
    console.log(`   📝 Fees processed: ${result.fees_processed || 0}`);
    console.log(`   💰 Total fees: $${result.total_fees || 0}`);
    console.log(`   🏆 High scorer: ${result.high_scorer?.owner_name || 'None'} (${result.high_scorer?.points || 0} pts)`);
    console.log("");
    
    console.log("✨ ENHANCED FEATURES STATUS:");
    if (result.enhancements_active) {
      Object.entries(result.enhancements_active).forEach(([key, value]) => {
        console.log(`   ${value ? '✅' : '❌'} ${key}: ${value}`);
      });
    } else {
      console.log("   ⚠️  No enhancement data returned");
    }
    console.log("");
    
    // Performance Analysis
    const executionTime = result.execution_time_ms || totalTime;
    console.log("📈 PERFORMANCE ANALYSIS:");
    console.log("=" * 30);
    if (executionTime < 30000) {
      console.log("🎉 SUCCESS: Under 30 seconds - EXCELLENT performance!");
      console.log("✅ Timeout issue RESOLVED");
    } else if (executionTime < 60000) {
      console.log("👍 GOOD: Under 60 seconds - Significant improvement");
      console.log("✅ Timeout issue RESOLVED");
    } else if (executionTime < 90000) {
      console.log("⚠️  SLOW: Still under 90s but needs more optimization");
    } else {
      console.log("❌ TIMEOUT RISK: Still over 90 seconds");
    }
    
    const oldTime = 90000; // Previous timeout time
    const improvement = ((oldTime - executionTime) / oldTime * 100).toFixed(1);
    console.log(`📊 Improvement: ${improvement}% faster than before`);
    console.log("");
    
    console.log("🔍 FULL RESPONSE:");
    console.log(JSON.stringify(result, null, 2));
    
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error("❌ ERROR testing optimized function:");
    console.error(`⏱️  Time before error: ${totalTime}ms`);
    console.error(error.message);
    console.error("");
    console.error("🔍 Full error:");
    console.error(error);
  }
}

testOptimizedFunction();
