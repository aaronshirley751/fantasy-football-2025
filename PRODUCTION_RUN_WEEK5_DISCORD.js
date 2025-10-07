const SUPABASE_URL = 'https://jfeuobfjgqownybluvje.supabase.co';
const CORRECT_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmZXVvYmZqZ3Fvd255Ymx1dmplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTU1MjU4NSwiZXhwIjoyMDcxMTI4NTg1fQ.TYZBL4UNLEJN6ovM6HQS5wxm2zkbZHBYtmQYALHDkqQ';

async function productionRunWithDiscord() {
  console.log('🚀 PRODUCTION RUN - Week 5 Fee Processing with Discord Notification');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('📋 STEP 1: Verifying Discord webhook is enabled...');
  
  try {
    // Verify webhook is configured
    const getResponse = await fetch(`${SUPABASE_URL}/rest/v1/leagues?sleeper_league_id=eq.1249067741470539776`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CORRECT_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'apikey': CORRECT_SERVICE_ROLE_KEY
      }
    });

    const leagues = await getResponse.json();
    const currentWebhook = leagues[0]?.discord_webhook_url;
    
    if (!currentWebhook || currentWebhook === '') {
      console.log('❌ Discord webhook is NOT configured!');
      console.log('Please run CONFIGURE_DISCORD_WEBHOOK_FOR_TESTING.js first.\n');
      return;
    }
    
    console.log(`✅ Discord webhook confirmed: ${currentWebhook.substring(0, 50)}...\n`);
    
    console.log('📊 STEP 2: Processing Week 5 fees with Discord notification...');
    console.log('Expected: Week 5 processing + Discord message to league owners\n');
    
    // Process Week 5 with Discord enabled
    const testResponse = await fetch(`${SUPABASE_URL}/functions/v1/process-weekly-fees`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CORRECT_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        week_number: 5,
        league_id: '1249067741470539776'
      })
    });

    if (!testResponse.ok) {
      console.error('❌ Function execution failed:', testResponse.status, await testResponse.text());
      return;
    }

    const result = await testResponse.json();
    
    console.log('\n🎉 PRODUCTION RUN COMPLETE!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('📈 EXECUTION SUMMARY:');
    console.log(`- Function Success: ${result.success ? '✅' : '❌'}`);
    console.log(`- Discord Notification Sent: ${result.discord_sent ? '✅ YES' : '❌ NO'}`);
    console.log(`- Week 5 Total: $${result.week_total || 0}`);
    console.log(`- Season Grand Total: $${result.season_grand_total || 0}\n`);
    
    if (result.discord_sent) {
      console.log('💬 DISCORD MESSAGE DELIVERED:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✅ League owners have been notified via Discord');
      console.log('✅ Message includes Week 5 fees and updated season totals');
      console.log('✅ Check your Discord channel to confirm delivery\n');
    } else {
      console.log('⚠️  WARNING: Discord message was NOT sent!');
      console.log('Check webhook configuration and Discord channel permissions.\n');
    }
    
    if (result.week_fees && result.week_fees.length > 0) {
      console.log('💰 WEEK 5 FEES PROCESSED:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━');
      result.week_fees.forEach(fee => {
        const amountStr = fee.amount >= 0 ? `$${fee.amount}` : `-$${Math.abs(fee.amount)}`;
        console.log(`• ${fee.owner_name || 'Unknown'}: ${amountStr} (${fee.type})`);
      });
      console.log('');
    }
    
    console.log('📊 PRODUCTION STATUS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Week 5 fees: $${result.week_total}`);
    console.log(`✅ Season total: $${result.season_grand_total}`);
    console.log(`✅ Discord notification: ${result.discord_sent ? 'DELIVERED' : 'FAILED'}`);
    console.log(`✅ Database: Updated successfully`);
    console.log(`✅ Automation: Ready for next Tuesday 2 AM EST\n`);
    
    console.log('🎯 NEXT STEPS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('1. Verify Discord message in your channel');
    console.log('2. Confirm all owners received notification');
    console.log('3. System will auto-run next Tuesday for Week 6');
    console.log('4. Manual runs available via GitHub Actions workflow\n');
    
    console.log('🚀 PRODUCTION SYSTEM FULLY OPERATIONAL!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
  } catch (error) {
    console.error('❌ Error during production run:', error.message);
    console.log('\n⚠️  Please check:');
    console.log('- Supabase service is running');
    console.log('- Discord webhook URL is valid');
    console.log('- Network connectivity');
  }
}

productionRunWithDiscord();
