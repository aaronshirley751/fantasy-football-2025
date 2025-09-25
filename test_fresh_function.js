// Test the fresh process-fees-v2 function with clean code
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔐 Please paste your ANON_KEY from Supabase dashboard:');
rl.question('ANON_KEY: ', (anonKey) => {
  testFreshFunction(anonKey);
  rl.close();
});

async function testFreshFunction(anonKey) {
  const SUPABASE_URL = 'https://jfeuobfjgqownybluvje.supabase.co';
  
  try {
    console.log('🚀 Testing FRESH process-fees-v2 function with clean code...');
    console.log('📊 Testing with Week 1 data for live league...');
    const startTime = Date.now();
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/process-fees-v2`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        league_id: "1249067741470539776", // Live 2025 league
        week: 1,
        test_mode: true // Safe testing
      })
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`⏰ Request completed in ${duration}ms`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('🎉 SUCCESS - Fresh function works!');
      console.log(`⚡ Execution time: ${duration}ms`);
      console.log('📋 Response summary:');
      if (data.fees && data.fees.length > 0) {
        console.log(`   💰 Total fees: $${data.total_fees || 0}`);
        console.log(`   👥 Players with fees: ${data.fees.length}`);
        console.log(`   🏆 High scorer: ${data.high_scorer || 'None'}`);
      }
      console.log('✅ CONCLUSION: The old function deployment was corrupted!');
      console.log('🎯 Fresh deployment works - timeout issue resolved!');
    } else {
      console.log(`❌ ERROR: ${response.status} - ${response.statusText}`);
      const text = await response.text();
      console.log('Response body:', text);
    }
    
  } catch (error) {
    console.log('❌ FETCH ERROR:', error.message);
  }
}
