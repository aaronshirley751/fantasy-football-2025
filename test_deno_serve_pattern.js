// Test the Deno.serve() pattern theory - this could be THE solution!
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🎯 TESTING CRITICAL THEORY: Deno.serve() vs export default pattern');
console.log('🔐 Please paste your ANON_KEY from Supabase dashboard:');
rl.question('ANON_KEY: ', (anonKey) => {
  testDenoServePattern(anonKey);
  rl.close();
});

async function testDenoServePattern(anonKey) {
  const SUPABASE_URL = 'https://jfeuobfjgqownybluvje.supabase.co';
  
  try {
    console.log('🚀 BREAKTHROUGH TEST: Deno.serve() pattern');
    console.log('💡 THEORY: export default timeouts, Deno.serve() works');
    console.log('⚡ This could be THE solution to our 150s timeout issue!');
    console.log('');
    
    const startTime = Date.now();
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/fee-processor-fresh`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ test: "deno-serve-pattern-test" })
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`⏰ Request completed in ${duration}ms`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('🎉 SUCCESS - Deno.serve() pattern works!');
      console.log(`⚡ Execution time: ${duration}ms`);
      console.log('📊 Response:', JSON.stringify(data, null, 2));
      console.log('');
      
      if (duration < 10000) {
        console.log('✅ BREAKTHROUGH CONFIRMED: Deno.serve() pattern is the solution!');
        console.log('🎯 ACTION: Convert optimized fee processing code to Deno.serve() pattern');
        console.log('📋 NEXT: Deploy working fee processor with Deno.serve() pattern');
        console.log('🚀 TIMELINE: System can be production ready within minutes!');
      } else {
        console.log('⚠️ Works but slower - may still have some issues to resolve');
      }
    } else {
      console.log(`❌ ERROR: ${response.status} - ${response.statusText}`);
      const text = await response.text();
      console.log('Response body:', text);
      
      if (duration > 120000) {
        console.log('🚨 Still timing out - theory incorrect, deeper issue remains');
      }
    }
    
  } catch (error) {
    console.log('❌ FETCH ERROR:', error.message);
    console.log('❌ Theory incorrect - still infrastructure issue');
  }
}