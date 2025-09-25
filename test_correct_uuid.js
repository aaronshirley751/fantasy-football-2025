// Test the incremental system with the correct database UUID
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function getUserInput(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer);
    });
  });
}

async function testWithCorrectUUID() {
  console.log('🔄 TESTING INCREMENTAL PROCESSING WITH CORRECT DATABASE UUID');
  console.log('📊 Database UUID: a7d65b53-2ec5-4b38-94ee-7fcb97160989');
  console.log('🌐 Sleeper League ID: 1249067741470539776');
  console.log('🎯 This should work with existing database structure\n');
  
  try {
    const anon_key = await getUserInput('🔐 ANON_KEY: ');
    rl.close();
    
    console.log('\n🚀 TESTING WITH CORRECT UUID...\n');
    
    const response = await fetch('https://jfeuobfjgqownybluvje.supabase.co/functions/v1/fee-processor-incremental', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${anon_key}`
      },
      body: JSON.stringify({
        league_id: 'a7d65b53-2ec5-4b38-94ee-7fcb97160989', // Correct database UUID
        week: 3
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      
      console.log('🎉 ========== INCREMENTAL PROCESSING WITH CORRECT UUID ==========\n');
      
      console.log('📊 PROCESSING SUMMARY:');
      console.log(`   Mode: ${data.processing_mode}`);
      console.log(`   Week: ${data.week_number}`);
      console.log(`   Execution Time: ${data.execution_time_ms}ms\n`);
      
      if (data.discord_notification) {
        console.log('💬 ========== DISCORD NOTIFICATION ==========');
        console.log(data.discord_notification);
        console.log('==========================================\n');
      }
      
      console.log('✅ SUCCESS! The incremental processing works with the correct UUID');
      console.log('\n📋 NEXT STEPS:');
      console.log('1. Update existing production functions to use incremental processing');
      console.log('2. Modify GitHub Actions workflow to use incremental approach');  
      console.log('3. Test cumulative data persistence across multiple weeks');
      
    } else {
      console.log(`❌ ERROR: ${response.status} - ${response.statusText}`);
      const text = await response.text();
      console.log('Error details:', text);
    }
    
  } catch (error) {
    console.log('❌ EXECUTION ERROR:', error.message);
  }
}

testWithCorrectUUID();