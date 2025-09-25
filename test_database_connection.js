// Test database connection only
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔐 Please paste your ANON_KEY from Supabase dashboard:');
rl.question('ANON_KEY: ', (anonKey) => {
  testDatabaseConnection(anonKey);
  rl.close();
});

async function testDatabaseConnection(anonKey) {
  const SUPABASE_URL = 'https://jfeuobfjgqownybluvje.supabase.co';
  
  try {
    console.log('🚀 Testing DATABASE CONNECTION only...');
    const startTime = Date.now();
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/process-fees-v2`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ test: "database-connection" })
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`⏰ Request completed in ${duration}ms`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ SUCCESS - Database connection works!');
      console.log(`⚡ Execution time: ${duration}ms`);
      console.log('📊 Response:', JSON.stringify(data, null, 2));
      
      if (duration < 5000) {
        console.log('🎉 CONCLUSION: Database connection is fast - issue is in complex processing logic!');
      } else {
        console.log('⚠️  CONCLUSION: Database connection is slow - potential database issue!');
      }
    } else {
      console.log(`❌ ERROR: ${response.status} - ${response.statusText}`);
      const text = await response.text();
      console.log('Response body:', text);
    }
    
  } catch (error) {
    console.log('❌ FETCH ERROR:', error.message);
  }
}
