const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔐 Please paste your ANON_KEY from Supabase dashboard:');
rl.question('ANON_KEY: ', (anonKey) => {
  testFunction(anonKey);
  rl.close();
});

async function testFunction(anonKey) {
  const SUPABASE_URL = 'https://jfeuobfjgqownybluvje.supabase.co';
  
  try {
    console.log('🚀 Testing infrastructure function...');
    const startTime = Date.now();
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/test-infrastructure`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ test: true })
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`⏰ Request completed in ${duration}ms`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ SUCCESS - New function works!');
      console.log(JSON.stringify(data, null, 2));
      console.log('');
      console.log('🎉 CONCLUSION: Infrastructure is OK - Issue is specific to process-weekly-fees function!');
    } else {
      console.log(`❌ ERROR: ${response.status} - ${response.statusText}`);
      const text = await response.text();
      console.log('Response body:', text);
    }
    
  } catch (error) {
    console.log('❌ FETCH ERROR:', error.message);
  }
}
