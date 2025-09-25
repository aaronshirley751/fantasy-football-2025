// Interactive Performance Test - Paste Fresh Credentials
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log("🚀 INTERACTIVE OPTIMIZED FUNCTION TEST");
console.log("=" * 50);
console.log("📋 Instructions:");
console.log("1. Go to: https://supabase.com/dashboard/project/jfeuobfjgqownybluvje/settings/api");
console.log("2. Copy either the 'anon' key or 'service_role' key");
console.log("3. Paste it below when prompted");
console.log("4. We'll test the optimized function performance!");
console.log("");

function askForCredentials() {
  rl.question('🔑 Paste your fresh Supabase token here: ', async (token) => {
    if (!token || token.trim().length < 10) {
      console.log("❌ Invalid token. Please paste a valid Supabase key.");
      askForCredentials();
      return;
    }
    
    token = token.trim();
    console.log(`✅ Token received (${token.length} chars)`);
    console.log("🧪 Testing optimized function performance...\n");
    
    await testOptimizedFunction(token);
    rl.close();
  });
}

async function testOptimizedFunction(token) {
  const startTime = Date.now();
  
  try {
    console.log("📡 Calling OPTIMIZED process-weekly-fees function...");
    console.log("🎯 Target: <30 seconds execution (was 90+ seconds before)");
    console.log("⏱️  Timer started...\n");
    
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
      console.log("🎉 FUNCTION EXECUTED SUCCESSFULLY!");
      console.log("=" * 50);
      
      console.log("⚡ PERFORMANCE RESULTS:");
      console.log(`   🕐 Client-side total: ${totalTime}ms (${(totalTime/1000).toFixed(1)}s)`);
      console.log(`   🎯 Function execution: ${result.execution_time_ms || 'N/A'}ms`);
      console.log(`   📊 Performance status: ${result.performance_status || 'N/A'}`);
      console.log("");
      
      // Performance analysis
      const execTime = result.execution_time_ms || totalTime;
      if (execTime < 30000) {
        console.log("🎉 EXCELLENT: Under 30 seconds!");
        console.log("✅ TIMEOUT ISSUE COMPLETELY RESOLVED! 🚀");
      } else if (execTime < 60000) {
        console.log("👍 GOOD: Under 60 seconds - Major improvement!");
        console.log("✅ Timeout issue resolved!");
      } else if (execTime < 90000) {
        console.log("⚠️  SLOW: Still under 90s but could be better");
      } else {
        console.log("❌ STILL SLOW: Over 90 seconds - needs investigation");
      }
      
      const oldTime = 90000;
      const improvement = ((oldTime - execTime) / oldTime * 100).toFixed(1);
      console.log(`📈 Performance improvement: ${improvement}% faster than before!`);
      console.log("");
      
      console.log("🔧 OPTIMIZATIONS CONFIRMED:");
      if (result.optimizations_applied) {
        Object.entries(result.optimizations_applied).forEach(([key, value]) => {
          console.log(`   ${value ? '✅' : '❌'} ${key}: ${value}`);
        });
      } else {
        console.log("   ⚠️  No optimization data in response");
      }
      console.log("");
      
      console.log("🎮 PROCESSING RESULTS:");
      console.log(`   📝 Fees processed: ${result.fees_processed || 0}`);
      console.log(`   💰 Total fees: $${result.total_fees || 0}`);
      console.log(`   🏆 High scorer: ${result.high_scorer?.owner_name || 'None'} (${result.high_scorer?.points || 0} pts)`);
      console.log("");
      
      console.log("✨ ENHANCED FEATURES:");
      if (result.enhancements_active) {
        Object.entries(result.enhancements_active).forEach(([key, value]) => {
          console.log(`   ${value ? '✅' : '❌'} ${key}: ${value}`);
        });
      }
      console.log("");
      
      if (execTime < 30000) {
        console.log("🎊 CONGRATULATIONS!");
        console.log("The performance optimizations have successfully resolved the timeout issue!");
        console.log("Your function is now production-ready! 🚀");
      }
      
    } else {
      console.log(`❌ FUNCTION CALL FAILED:`);
      console.log(`   Status: ${response.status} ${response.statusText}`);
      console.log(`   Error: ${result.message || result.error || 'Unknown error'}`);
      
      if (response.status === 401) {
        console.log("\n🔑 Authentication issue:");
        console.log("   - Make sure you copied the full token");
        console.log("   - Try the service_role key instead of anon key");
        console.log("   - Verify the token hasn't expired");
      }
    }
    
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.log("❌ ERROR during function test:");
    console.log(`   Time before error: ${totalTime}ms (${(totalTime/1000).toFixed(1)}s)`);
    console.log(`   Error: ${error.message}`);
    
    if (totalTime > 120000) {
      console.log("\n⚠️  Function timed out - this suggests either:");
      console.log("   1. Function is still slow despite optimizations");
      console.log("   2. Network/infrastructure issue");
      console.log("   3. Function crashed during execution");
    }
  }
}

console.log("Ready to test! 🧪\n");
askForCredentials();
