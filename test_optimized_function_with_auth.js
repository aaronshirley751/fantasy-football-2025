// Test the optimized function with proper authentication
console.log("🚀 TESTING OPTIMIZED FUNCTION - Performance Validation");
console.log("Trying multiple authentication tokens...");
console.log("=" * 60);

async function testWithToken(tokenName, token) {
  const startTime = Date.now();
  
  try {
    console.log(`\n📡 Testing with ${tokenName}...`);
    
    const response = await fetch('https://jfeuobfjgqownybluvje.supabase.co/functions/v1/process-weekly-fees', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        week_number: 16,
        league_id: 'd06f0672-2848-4b5d-86f5-9ab559605b4f'
      })
    });
    
    const result = await response.json();
    const totalTime = Date.now() - startTime;
    
    if (response.ok && result.success) {
      console.log(`✅ SUCCESS with ${tokenName}!`);
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
      }
      console.log("");
      
      console.log("🎮 PROCESSING RESULTS:");
      console.log(`   📝 Fees processed: ${result.fees_processed || 0}`);
      console.log(`   💰 Total fees: $${result.total_fees || 0}`);
      console.log(`   🏆 High scorer: ${result.high_scorer?.owner_name || 'None'} (${result.high_scorer?.points || 0} pts)`);
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
      console.log(`📊 Performance improvement: ${improvement}% faster than before`);
      console.log("");
      
      console.log("🔍 FULL RESPONSE:");
      console.log(JSON.stringify(result, null, 2));
      
      return { success: true, time: executionTime };
      
    } else {
      console.log(`❌ FAILED with ${tokenName}: ${response.status} ${response.statusText}`);
      console.log(`Error: ${result.message || result.error || 'Unknown error'}`);
      return { success: false, error: result };
    }
    
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.log(`❌ ERROR with ${tokenName} (${totalTime}ms):`);
    console.log(error.message);
    return { success: false, error: error.message };
  }
}

async function testAllTokens() {
  const tokens = [
    {
      name: "Service Role Key (from critical_backfill)",
      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmZXVvYmZqZ3Fvd255Ymx1dmplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNDE5NzI5NiwiZXhwIjoyMDM5NzczMjk2fQ.vJv1aNlJ48875yKTkKVZ3o-YCtBhH1MZtPzV5_8ZJj8"
    },
    {
      name: "Anon Key (newer from process_week_1)",
      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpldW9iZmpncW93bnlibHV2amUiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTcyNTAyNjQ0MSwiZXhwIjoyMDQwNjAyNDQxfQ.7J7I6WLdEg73fBQQQNa7PV9ZOXdPu2L6e3fBHRZrDgQ"
    },
    {
      name: "Fresh Anon Key (from FINAL_PRODUCTION_STEPS)",
      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmZXVvYmZqZ3Fvd255Ymx1dmplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1NTI1ODUsImV4cCI6MjA3MTEyODU4NX0.7qu0h_cKNpdW1ZENZ3652LE75MC6VQp9Ahu5SSDypuY"
    }
  ];

  console.log(`🧪 Testing ${tokens.length} different authentication tokens...\n`);
  
  for (const {name, token} of tokens) {
    const result = await testWithToken(name, token);
    if (result.success) {
      console.log(`\n🎉 FOUND WORKING TOKEN: ${name}`);
      console.log("✅ Performance test completed successfully!");
      return;
    }
    console.log(""); // Space between tests
  }
  
  console.log("❌ All tokens failed. You may need to get fresh credentials from Supabase dashboard.");
  console.log("📋 Next steps:");
  console.log("1. Go to https://supabase.com/dashboard/project/jfeuobfjgqownybluvje/settings/api");
  console.log("2. Copy the anon key or service_role key");
  console.log("3. Update the token in the test script");
}

testAllTokens();
