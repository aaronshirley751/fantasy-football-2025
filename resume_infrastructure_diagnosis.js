// Test the no-database function to complete our infrastructure diagnosis
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🎯 RESUMING INFRASTRUCTURE DIAGNOSIS...');
console.log('🔐 Please paste your ANON_KEY from Supabase dashboard:');
rl.question('ANON_KEY: ', (anonKey) => {
  testNoDatabaseFinal(anonKey);
  rl.close();
});

async function testNoDatabaseFinal(anonKey) {
  const SUPABASE_URL = 'https://jfeuobfjgqownybluvje.supabase.co';
  
  try {
    console.log('🚀 FINAL TEST: No-database function (should work if infrastructure is OK)');
    const startTime = Date.now();
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/process-fees-v2`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ diagnostic: "no-database-final-test" })
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`⏰ Request completed in ${duration}ms`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ SUCCESS - No-database function works!');
      console.log(`⚡ Execution time: ${duration}ms`);
      console.log('📊 Response:', JSON.stringify(data, null, 2));
      console.log('');
      console.log('🎯 DIAGNOSIS COMPLETE: Issue is database connection specific!');
      console.log('📋 NEXT STEPS: Check database health and restore working function');
    } else {
      console.log(`❌ ERROR: ${response.status} - ${response.statusText}`);
      const text = await response.text();
      console.log('Response body:', text);
      
      if (duration > 120000) {
        console.log('🚨 DIAGNOSIS: Infrastructure-level timeout issue!');
        console.log('🔧 ACTION REQUIRED: Check Supabase project health/billing');
      }
    }
    
  } catch (error) {
    console.log('❌ FETCH ERROR:', error.message);
    console.log('🚨 DIAGNOSIS: Deep infrastructure or network connectivity issue');
  }
}