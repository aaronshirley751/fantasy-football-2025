// Test completely fresh function deployment to check corruption theory
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🎯 TESTING CORRUPTION THEORY...');
console.log('🔐 Please paste your ANON_KEY from Supabase dashboard:');
rl.question('ANON_KEY: ', (anonKey) => {
  testFreshFunction(anonKey);
  rl.close();
});

async function testFreshFunction(anonKey) {
  const SUPABASE_URL = 'https://jfeuobfjgqownybluvje.supabase.co';
  
  try {
    console.log('🚀 CRITICAL TEST: Fresh function deployment (fee-processor-fresh)');
    console.log('⏰ If this works quickly → Function corruption was the issue');
    console.log('⏰ If this times out → Deeper infrastructure problem');
    console.log('');
    
    const startTime = Date.now();
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/fee-processor-fresh`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ test: "fresh-deployment-corruption-test" })
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`⏰ Request completed in ${duration}ms`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('🎉 SUCCESS - Fresh function works!');
      console.log(`⚡ Execution time: ${duration}ms`);
      console.log('📊 Response:', JSON.stringify(data, null, 2));
      console.log('');
      
      if (duration < 10000) {
        console.log('✅ BREAKTHROUGH: Function corruption was the issue!');
        console.log('🎯 SOLUTION: Deploy working code with fresh function name');
        console.log('📋 NEXT: Deploy optimized fee processing code to fee-processor-fresh');
      } else {
        console.log('⚠️ Slower than expected but working - may still have issues');
      }
    } else {
      console.log(`❌ ERROR: ${response.status} - ${response.statusText}`);
      const text = await response.text();
      console.log('Response body:', text);
      
      if (duration > 120000) {
        console.log('🚨 CONCLUSION: Deep infrastructure issue - not function corruption');
        console.log('📋 ACTION: Check Supabase dashboard/billing/support');
      }
    }
    
  } catch (error) {
    console.log('❌ FETCH ERROR:', error.message);
  }
}