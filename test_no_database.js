// Test function WITHOUT database connection
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔐 Please paste your ANON_KEY from Supabase dashboard:');
rl.question('ANON_KEY: ', (anonKey) => {
  testNoDatabaseFunction(anonKey);
  rl.close();
});

async function testNoDatabaseFunction(anonKey) {
  const SUPABASE_URL = 'https://jfeuobfjgqownybluvje.supabase.co';
  
  try {
    console.log('🚀 Testing function WITHOUT any database connection...');
    const startTime = Date.now();
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/process-fees-v2`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ test: "no-database" })
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`⏰ Request completed in ${duration}ms`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ SUCCESS - Function works WITHOUT database!');
      console.log(`⚡ Execution time: ${duration}ms`);
      console.log('📊 Response:', JSON.stringify(data, null, 2));
      console.log('');
      console.log('🎯 CRITICAL CONCLUSION: DATABASE CONNECTION IS THE PROBLEM!');
      console.log('💡 Next step: Check database health in Supabase dashboard');
    } else {
      console.log(`❌ ERROR: ${response.status} - ${response.statusText}`);
      const text = await response.text();
      console.log('Response body:', text);
    }
    
  } catch (error) {
    console.log('❌ FETCH ERROR:', error.message);
  }
}
