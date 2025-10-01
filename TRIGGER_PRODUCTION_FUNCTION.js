const SUPABASE_URL = 'https://jfeuobfjgqownybluvje.supabase.co';
const CORRECT_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmZXVvYmZqZ3Fvd255Ymx1dmplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTU1MjU4NSwiZXhwIjoyMDcxMTI4NTg1fQ.TYZBL4UNLEJN6ovM6HQS5wxm2zkbZHBYtmQYALHDkqQ';

async function triggerProductionFunction() {
  console.log('🚀 Triggering production function with current Discord configuration...\n');
  
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
      console.log(`❌ Function failed: ${response.status} ${response.statusText}`);
      console.log('Error details:', errorText);
      return;
    }

    const result = await response.json();
    console.log('✅ Production function executed successfully!\n');
    
    console.log('📊 RESULTS:');
    console.log(`- Week: ${result.week_number}`);
    console.log(`- League: ${result.league_id}`);
    console.log(`- Week Total: $${result.week_total}`);
    console.log(`- Season Total: $${result.season_grand_total}`);
    console.log(`- Discord Sent: ${result.discord_sent ? '✅ YES' : '❌ NO'}`);
    console.log(`- Function Success: ${result.success ? '✅' : '❌'}`);
    
    if (!result.discord_sent) {
      console.log('\n🔧 DISCORD STATUS:');
      console.log('Discord message was NOT sent because webhook URL is not configured.');
      console.log('The function detected that discord_webhook_url is NULL in the database.');
      console.log('\nTo enable Discord messages:');
      console.log('1. Get your Discord webhook URL from your channel settings');
      console.log('2. Run the SQL update command in Supabase dashboard');
      console.log('3. Test again');
    } else {
      console.log('\n✅ DISCORD MESSAGE SENT!');
      console.log('Check your Discord channel for the fee summary message.');
    }
    
    console.log('\n📋 FUNCTION SUMMARY:');
    console.log(result.summary);
    
  } catch (error) {
    console.error('❌ Error triggering function:', error.message);
  }
}

triggerProductionFunction();