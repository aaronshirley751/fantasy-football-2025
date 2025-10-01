const SUPABASE_URL = 'https://jfeuobfjgqownybluvje.supabase.co';
const CORRECT_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmZXVvYmZqZ3Fvd255Ymx1dmplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTU1MjU4NSwiZXhwIjoyMDcxMTI4NTg1fQ.TYZBL4UNLEJN6ovM6HQS5wxm2zkbZHBYtmQYALHDkqQ';

async function configureDiscordWebhook() {
  console.log('🔧 Discord Webhook Configuration Tool\n');
  console.log('This script will configure the Discord webhook URL for your production league.');
  console.log('You need to provide your Discord webhook URL to enable automated messaging.\n');
  
  // For now, we'll just show how to configure it
  console.log('📋 SETUP INSTRUCTIONS:');
  console.log('1. In Discord, go to your channel settings');
  console.log('2. Click "Integrations" → "Webhooks"'); 
  console.log('3. Create a new webhook or copy an existing one');
  console.log('4. Copy the webhook URL (starts with https://discord.com/api/webhooks/...)');
  console.log('5. Use the URL in the configuration below\n');
  
  // Example webhook URL (replace with your actual webhook)
  const exampleWebhookUrl = 'https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN';
  
  console.log(`💡 Example webhook URL format:`);
  console.log(`${exampleWebhookUrl}\n`);
  
  console.log('🚫 SAFETY: This script will NOT automatically configure a webhook.');
  console.log('🚫 SAFETY: No Discord messages will be sent without explicit configuration.');
  console.log('🚫 SAFETY: The production function will work without Discord (webhook is optional).\n');
  
  // Check current league configuration
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/leagues?sleeper_league_id=eq.1249067741470539776`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CORRECT_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'apikey': CORRECT_SERVICE_ROLE_KEY
      }
    });

    if (response.ok) {
      const leagues = await response.json();
      if (leagues && leagues.length > 0) {
        const league = leagues[0];
        console.log('📊 Current League Configuration:');
        console.log(`- League ID: ${league.id}`);
        console.log(`- Name: ${league.name}`);
        console.log(`- Sleeper League ID: ${league.sleeper_league_id}`);
        console.log(`- Discord Webhook: ${league.discord_webhook_url ? 'CONFIGURED ✅' : 'NOT CONFIGURED ❌'}`);
        
        if (league.discord_webhook_url) {
          console.log(`- Webhook URL: ${league.discord_webhook_url.substring(0, 50)}...`);
        }
      }
    }
  } catch (error) {
    console.error('❌ Error checking league configuration:', error.message);
  }
  
  console.log('\n🔧 TO CONFIGURE DISCORD WEBHOOK:');
  console.log('Run this SQL in your Supabase dashboard (replace YOUR_WEBHOOK_URL):');
  console.log('');
  console.log('UPDATE leagues SET discord_webhook_url = \'YOUR_WEBHOOK_URL\'');
  console.log('WHERE sleeper_league_id = \'1249067741470539776\';');
  console.log('');
  console.log('🎯 Once configured, the production function will automatically send');
  console.log('   the approved Discord format to your channel!');
}

configureDiscordWebhook();