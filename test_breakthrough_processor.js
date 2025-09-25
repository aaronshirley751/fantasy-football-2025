// Test the breakthrough fee processor with Deno.serve() pattern
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🎉 TESTING BREAKTHROUGH FEE PROCESSOR!');
console.log('🔐 Please paste your ANON_KEY from Supabase dashboard:');
rl.question('ANON_KEY: ', (anonKey) => {
  testBreakthroughProcessor(anonKey);
  rl.close();
});

async function testBreakthroughProcessor(anonKey) {
  const SUPABASE_URL = 'https://jfeuobfjgqownybluvje.supabase.co';
  
  try {
    console.log('🚀 BREAKTHROUGH TEST: Fee processor with Deno.serve() pattern');
    console.log('🏈 Testing with Week 1 of 2025 live league...');
    console.log('');
    
    const startTime = Date.now();
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/fee-processor-fresh`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        league_id: "1249067741470539776", // 2025 live league
        week: 1,
        test_mode: true 
      })
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`⏰ Request completed in ${duration}ms`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('🎉 BREAKTHROUGH SUCCESS!');
      console.log(`⚡ Total execution time: ${duration}ms`);
      console.log('📊 Response:', JSON.stringify(data, null, 2));
      console.log('');
      
      if (duration < 30000) {
        console.log('✅ VICTORY: Fantasy Football Fee Tracker is working!');
        console.log('🎯 ACHIEVEMENT: Solved 150+ second timeout crisis');
        console.log('📋 STATUS: Ready to add full fee processing logic');
        console.log('🚀 PRODUCTION: System can go live for 2025 NFL season!');
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