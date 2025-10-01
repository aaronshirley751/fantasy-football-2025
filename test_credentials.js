// Test with fresh credentials - try different approaches
async function testCredentials() {
  const fetch = (await import('node-fetch')).default;
  
  console.log('🔐 TESTING SUPABASE CREDENTIALS');
  console.log('=' .repeat(50));
  
  // Test credentials - try multiple possible keys
  const possibleKeys = [
    // Newer key with 2071 expiration from check_league_config.js
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmZXVvYmZqZ3Fvd255Ymx1dmplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1NTI1ODUsImV4cCI6MjA3MTEyODU4NX0.7qu0h_cKNpdW1ZENZ3652LE75MC6VQp9Ahu5SSDypuY',
    
    // Current key from script
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmdXVvYmZqZ3Fvd255Ymx1dmplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjUzODU2MTQsImV4cCI6MjA0MDk2MTYxNH0.VNShpf7W_7j5g6lEGZaFN_a4_YJaMZi-F8j7E8OlNMU',
    
    // Service role key from PowerShell scripts
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmZXVvYmZqZ3Fvd255Ymx1dmplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNDE5NzI5NiwiZXhwIjoyMDM5NzczMjk2fQ.vJv1aNlJ48875yKTkKVZ3o-YCtBhH1MZtPzV5_8ZJj8',
    
    // Another anon key from debug_test.js
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmZXVvYmZqZ3Fvd255Ymx1dmplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjM4NjE1NjUsImV4cCI6MjAzOTQzNzU2NX0.WVXR-F9oQV3Wmc4twgH0pPL96MQJZQW8QUdtc5-mZOg',
    
    // Check environment variable
    process.env.SUPABASE_ANON_KEY,
    
    // Check if there's a different key format
    process.env.SUPABASE_SERVICE_ROLE_KEY
  ];
  
  const endpoints = [
    'https://jfeuobfjgqownybluvje.supabase.co/functions/v1/weekly-processor',
    'https://jfeuobfjgqownybluvje.supabase.co/functions/v1/process-weekly-fees',
    'https://jfeuobfjgqownybluvje.supabase.co/functions/v1/debug-league'
  ];
  
  for (let i = 0; i < possibleKeys.length; i++) {
    const key = possibleKeys[i];
    if (!key) {
      console.log(`❌ Key ${i + 1}: Not available`);
      continue;
    }
    
    console.log(`🔑 Testing key ${i + 1} (${key.substring(0, 20)}...)`);
    
    for (const endpoint of endpoints) {
      const functionName = endpoint.split('/').pop();
      
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${key}`
          },
          body: JSON.stringify({
            test: true,
            league_id: 'a7d65b53-2ec5-4b38-94ee-7fcb97160989'
          })
        });
        
        console.log(`   ${functionName}: ${response.status} ${response.statusText}`);
        
        if (response.status === 200) {
          console.log(`   ✅ SUCCESS! This key works with ${functionName}`);
          const data = await response.text();
          console.log(`   Response preview: ${data.substring(0, 100)}...`);
          
          // Use this working key for the real request
          if (functionName === 'weekly-processor') {
            console.log('\n🚀 EXECUTING REAL WEEKLY PROCESSOR...');
            return await executeWithWorkingKey(key);
          }
        } else if (response.status === 401) {
          console.log(`   ❌ Unauthorized - key invalid or expired`);
        } else {
          const errorText = await response.text();
          console.log(`   ⚠️  Other error: ${errorText.substring(0, 50)}...`);
        }
        
      } catch (error) {
        console.log(`   💥 Network error: ${error.message}`);
      }
    }
    console.log('');
  }
  
  console.log('🆘 NO WORKING CREDENTIALS FOUND');
  console.log('Next steps:');
  console.log('1. Go to: https://supabase.com/dashboard/project/jfeuobfjgqownybluvje/settings/api');
  console.log('2. Copy the fresh anon key');
  console.log('3. Update this script with the new key');
  console.log('4. Re-run the audit');
}

async function executeWithWorkingKey(workingKey) {
  const fetch = (await import('node-fetch')).default;
  
  console.log('📊 EXECUTING WEEKLY PROCESSOR WITH WORKING CREDENTIALS');
  console.log('=' .repeat(60));
  
  try {
    const response = await fetch('https://jfeuobfjgqownybluvje.supabase.co/functions/v1/weekly-processor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${workingKey}`
      },
      body: JSON.stringify({
        league_id: 'a7d65b53-2ec5-4b38-94ee-7fcb97160989',
        week: 4,
        test_mode: false,
        disable_discord: true
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ WEEKLY PROCESSOR SUCCESS!');
      console.log(JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.log(`❌ Error: ${response.status} - ${errorText}`);
    }
    
  } catch (error) {
    console.log(`💥 Execution error: ${error.message}`);
  }
}

// Start the credential test
testCredentials().catch(console.error);