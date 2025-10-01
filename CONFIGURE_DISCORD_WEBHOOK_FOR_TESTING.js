const SUPABASE_URL = 'https://jfeuobfjgqownybluvje.supabase.co';
const CORRECT_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmZXVvYmZqZ3Fvd255Ymx1dmplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTU1MjU4NSwiZXhwIjoyMDcxMTI4NTg1fQ.TYZBL4UNLEJN6ovM6HQS5wxm2zkbZHBYtmQYALHDkqQ';

async function configureDiscordWebhook() {
  console.log('🔧 Discord Webhook Configuration\n');
  
  console.log('📋 STEP 1: Get Your Discord Webhook URL');
  console.log('1. Go to your Discord server');
  console.log('2. Right-click on the channel where you want notifications');
  console.log('3. Click "Edit Channel"');
  console.log('4. Go to "Integrations" → "Webhooks"');
  console.log('5. Click "New Webhook" or use an existing one');
  console.log('6. Copy the webhook URL (starts with https://discord.com/api/webhooks/...)');
  console.log('7. Paste it below\n');
  
  console.log('🚨 IMPORTANT: Replace YOUR_WEBHOOK_URL_HERE with your actual Discord webhook URL');
  console.log('Example format: https://discord.com/api/webhooks/1234567890/abcdefghijklmnopqrstuvwxyz\n');
  
  // ✅ YOUR DISCORD WEBHOOK URL IS CONFIGURED ✅
  const DISCORD_WEBHOOK_URL = 'https://discordapp.com/api/webhooks/1407118249283420292/EzZsNlsvT-BmDpUsRbED8OadDjQwmA8Kg5lbL9IzTgVSffiVN-Qrhoz1HyF68Mc6eUrZ';
  
  if (DISCORD_WEBHOOK_URL === 'YOUR_WEBHOOK_URL_HERE' || !DISCORD_WEBHOOK_URL.startsWith('https://discord')) {
    console.log('❌ CONFIGURATION NEEDED:');
    console.log('Please edit this script and replace YOUR_WEBHOOK_URL_HERE with your actual Discord webhook URL');
    console.log('Then run the script again to configure Discord messaging.\n');
    
    console.log('📝 EDIT THIS FILE:');
    console.log('File: CONFIGURE_DISCORD_WEBHOOK_FOR_TESTING.js');
    console.log('Line: const DISCORD_WEBHOOK_URL = \'https://discordapp.com/api/webhooks/1407118249283420292/EzZsNlsvT-BmDpUsRbED8OadDjQwmA8Kg5lbL9IzTgVSffiVN-Qrhoz1HyF68Mc6eUrZ\';');
    console.log('Change to: const DISCORD_WEBHOOK_URL = \'https://discordapp.com/api/webhooks/1407118249283420292/EzZsNlsvT-BmDpUsRbED8OadDjQwmA8Kg5lbL9IzTgVSffiVN-Qrhoz1HyF68Mc6eUrZ\';');
    return;
  }
  
  console.log('📊 STEP 2: Updating Database...');
  
  try {
    // Update the league record with the Discord webhook URL
    const updateResponse = await fetch(`${SUPABASE_URL}/rest/v1/leagues?sleeper_league_id=eq.1249067741470539776`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${CORRECT_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'apikey': CORRECT_SERVICE_ROLE_KEY,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        discord_webhook_url: DISCORD_WEBHOOK_URL
      })
    });

    if (!updateResponse.ok) {
      console.error('❌ Database update failed:', updateResponse.status, await updateResponse.text());
      return;
    }

    const updatedLeague = await updateResponse.json();
    console.log('✅ Database updated successfully!');
    console.log(`- Webhook URL configured: ${DISCORD_WEBHOOK_URL.substring(0, 50)}...`);
    
    console.log('\n🧪 STEP 3: Testing Discord Integration...');
    
    // Test the production function with Discord enabled
    const testResponse = await fetch(`${SUPABASE_URL}/functions/v1/process-weekly-fees`, {
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

    if (!testResponse.ok) {
      console.error('❌ Function test failed:', testResponse.status, await testResponse.text());
      return;
    }

    const result = await testResponse.json();
    
    console.log('🎉 TEST COMPLETE!');
    console.log(`- Function Success: ${result.success ? '✅' : '❌'}`);
    console.log(`- Discord Sent: ${result.discord_sent ? '✅ YES' : '❌ NO'}`);
    console.log(`- Week Total: $${result.week_total}`);
    console.log(`- Season Total: $${result.season_grand_total}`);
    
    if (result.discord_sent) {
      console.log('\n🚀 SUCCESS! Check your Discord channel now!');
      console.log('You should see the complete fee summary with the approved format.');
    } else {
      console.log('\n❌ Discord message was not sent. Check webhook URL and try again.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

configureDiscordWebhook();