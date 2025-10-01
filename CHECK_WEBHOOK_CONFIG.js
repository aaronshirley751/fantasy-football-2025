const SUPABASE_URL = 'https://jfeuobfjgqownybluvje.supabase.co';
const CORRECT_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmZXVvYmZqZ3Fvd255Ymx1dmplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTU1MjU4NSwiZXhwIjoyMDcxMTI4NTg1fQ.TYZBL4UNLEJN6ovM6HQS5wxm2zkbZHBYtmQYALHDkqQ';

async function checkDiscordWebhookConfig() {
  console.log('🔍 Checking Discord webhook configuration in database...\n');
  
  try {
    // Check current league configuration
    const response = await fetch(`${SUPABASE_URL}/rest/v1/leagues?sleeper_league_id=eq.1249067741470539776&select=*`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CORRECT_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'apikey': CORRECT_SERVICE_ROLE_KEY
      }
    });

    if (!response.ok) {
      console.error('❌ Database query failed:', response.status, await response.text());
      return;
    }

    const leagues = await response.json();
    console.log('📊 Database Response:');
    console.log('Number of leagues found:', leagues.length);
    
    if (leagues && leagues.length > 0) {
      const league = leagues[0];
      console.log('\n🏈 League Configuration:');
      console.log('- League ID:', league.id);
      console.log('- Name:', league.name);
      console.log('- Sleeper League ID:', league.sleeper_league_id);
      
      // Check all possible webhook field names
      console.log('\n🔗 Webhook Fields:');
      console.log('- discord_webhook_url:', league.discord_webhook_url ? `CONFIGURED (${league.discord_webhook_url.substring(0, 50)}...)` : 'NOT SET');
      console.log('- webhook_url:', league.webhook_url ? `CONFIGURED (${league.webhook_url.substring(0, 50)}...)` : 'NOT SET');
      console.log('- discord_webhook:', league.discord_webhook ? `CONFIGURED (${league.discord_webhook.substring(0, 50)}...)` : 'NOT SET');
      
      console.log('\n📋 All Fields in League Record:');
      Object.keys(league).forEach(key => {
        if (key.toLowerCase().includes('webhook') || key.toLowerCase().includes('discord')) {
          console.log(`- ${key}: ${league[key] || 'NULL'}`);
        }
      });
      
      // Test a direct update to make sure the field exists
      console.log('\n🧪 Testing database schema...');
      console.log('Next, we can test if the discord_webhook_url field accepts updates.');
      
    } else {
      console.log('❌ No leagues found with Sleeper League ID: 1249067741470539776');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkDiscordWebhookConfig();