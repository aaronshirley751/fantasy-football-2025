// Test the ultra-minimal process-weekly-fees function
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔐 Please paste your ANON_KEY from Supabase dashboard:');
rl.question('ANON_KEY: ', (anonKey) => {
  testProcessWeeklyFees(anonKey);
  rl.close();
});

async function testProcessWeeklyFees(anonKey) {
  const SUPABASE_URL = 'https://jfeuobfjgqownybluvje.supabase.co';
  
  try {
    console.log('🚀 Testing ultra-minimal process-weekly-fees function...');
    const startTime = Date.now();
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/process-weekly-fees`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ test: "ultra-minimal" })
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`⏰ Request completed in ${duration}ms`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ SUCCESS - Ultra-minimal process-weekly-fees works!');
      console.log(JSON.stringify(data, null, 2));
      console.log('');
      console.log('🎉 CONCLUSION: The issue was with the complex code, not the function itself!');
      console.log('💡 We can now restore the optimized version and it should work!');
    } else {
      console.log(`❌ ERROR: ${response.status} - ${response.statusText}`);
      const text = await response.text();
      console.log('Response body:', text);
    }
    
  } catch (error) {
    console.log('❌ FETCH ERROR:', error.message);
  }
}
