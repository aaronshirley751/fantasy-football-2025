const SUPABASE_URL = 'https://jfeuobfjgqownybluvje.supabase.co';
const CORRECT_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmZXVvYmZqZ3Fvd255Ymx1dmplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTU1MjU4NSwiZXhwIjoyMDcxMTI4NTg1fQ.TYZBL4UNLEJN6ovM6HQS5wxm2zkbZHBYtmQYALHDkqQ';

async function testDiscordFeature() {
  console.log('🧪 Testing production function with Discord capability...\n');
  
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/process-weekly-fees`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CORRECT_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        week_number: 4,
        league_id: '1249067741470539776'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`❌ Function failed: ${response.status} ${response.statusText}, ${errorText}`);
      return;
    }

    const result = await response.json();
    console.log('✅ Function executed successfully!\n');
    
    console.log('📊 Discord Integration Status:');
    console.log(`- Discord Sent: ${result.discord_sent ? '✅ Yes' : '❌ No (webhook not configured)'}`);
    console.log(`- Week Processed: ${result.week_number}`);
    console.log(`- Week Total: $${result.week_total}`);
    console.log(`- Season Total: $${result.season_grand_total}`);
    console.log(`- Success: ${result.success ? '✅' : '❌'}`);
    
    console.log('\n🔍 Full Response Keys:');
    console.log(Object.keys(result).join(', '));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testDiscordFeature();