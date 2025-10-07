const SUPABASE_URL = 'https://jfeuobfjgqownybluvje.supabase.co';
const CORRECT_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmZXVvYmZqZ3Fvd255Ymx1dmplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTU1MjU4NSwiZXhwIjoyMDcxMTI4NTg1fQ.TYZBL4UNLEJN6ovM6HQS5wxm2zkbZHBYtmQYALHDkqQ';

async function qaAuditRun() {
  console.log('🔧 QA AUDIT - Week 5 Fee Processing');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('📋 STEP 1: Temporarily disable Discord webhook for QA audit...');
  
  try {
    // Store current webhook URL for restoration
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
    
    console.log(`✅ Current webhook saved for restoration: ${currentWebhook ? currentWebhook.substring(0, 50) + '...' : 'NULL'}\n`);

    // Temporarily set to empty string for QA run (NULL constraint prevents null value)
    const updateResponse = await fetch(`${SUPABASE_URL}/rest/v1/leagues?sleeper_league_id=eq.1249067741470539776`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${CORRECT_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'apikey': CORRECT_SERVICE_ROLE_KEY,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        discord_webhook_url: '' // Empty string to disable (NOT NULL constraint)
      })
    });

    if (!updateResponse.ok) {
      console.error('❌ Failed to disable webhook:', updateResponse.status, await updateResponse.text());
      return;
    }

    console.log('✅ Discord webhook temporarily disabled for QA audit\n');
    
    console.log('📊 STEP 2: Processing Week 5 fees...');
    console.log('Expected: This week\'s data + updated season totals\n');
    
    // Process Week 5
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
      
      // Restore webhook before exiting
      console.log('\n🔄 Restoring Discord webhook...');
      await fetch(`${SUPABASE_URL}/rest/v1/leagues?sleeper_league_id=eq.1249067741470539776`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${CORRECT_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
          'apikey': CORRECT_SERVICE_ROLE_KEY
        },
        body: JSON.stringify({
          discord_webhook_url: currentWebhook
        })
      });
      return;
    }

    const result = await testResponse.json();
    
    console.log('\n🎉 WEEK 5 PROCESSING RESULTS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('📈 SUMMARY:');
    console.log(`- Function Success: ${result.success ? '✅' : '❌'}`);
    console.log(`- Discord Sent: ${result.discord_sent ? '✅ YES' : '❌ NO (Expected for QA)'}`);
    console.log(`- Week 5 Total: $${result.week_total || 0}`);
    console.log(`- Season Grand Total: $${result.season_grand_total || 0}`);
    console.log(`- Previous Week 4 Total: $132 (for comparison)`);
    console.log(`- Week 5 Delta: $${(parseFloat(result.season_grand_total) - 132).toFixed(2)}\n`);
    
    if (result.week_fees && result.week_fees.length > 0) {
      console.log('💰 THIS WEEK\'S FEES (Week 5):');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━');
      result.week_fees.forEach(fee => {
        console.log(`• ${fee.owner_name || 'Unknown'}: $${fee.amount} (${fee.type}) - ${fee.description || ''}`);
      });
      console.log('');
    }
    
    if (result.season_summary && result.season_summary.length > 0) {
      console.log('📊 SEASON TOTALS (Through Week 5):');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      result.season_summary.forEach(team => {
        const transStr = team.transaction_fees > 0 ? `$${team.transaction_fees.toFixed(2)} transactions` : '';
        const lossesStr = team.losses_inactive_fees > 0 ? `$${team.losses_inactive_fees.toFixed(2)} losses/inactive` : '';
        const bonusStr = team.high_scorer_bonuses < 0 ? `${team.high_scorer_bonuses.toFixed(2)} bonus` : '';
        
        let details = [transStr, lossesStr, bonusStr].filter(s => s).join(', ');
        if (details) details = ` (${details})`;
        
        console.log(`• ${team.owner_name}: $${team.season_total.toFixed(2)} total${details}, ${team.free_remaining}/10 free remaining`);
      });
      console.log('');
    }
    
    console.log('✅ QA AUDIT VALIDATION:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`- Week 5 data populated: ${result.week_fees && result.week_fees.length > 0 ? '✅' : '❌'}`);
    console.log(`- Season totals incremented: ${result.season_grand_total > 132 ? '✅' : '⚠️  No change'}`);
    console.log(`- Discord disabled: ${!result.discord_sent ? '✅' : '❌'}`);
    console.log(`- Data integrity: ${result.success ? '✅' : '❌'}\n`);
    
    // Restore webhook
    console.log('🔄 STEP 3: Restoring Discord webhook...');
    const restoreResponse = await fetch(`${SUPABASE_URL}/rest/v1/leagues?sleeper_league_id=eq.1249067741470539776`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${CORRECT_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'apikey': CORRECT_SERVICE_ROLE_KEY
      },
      body: JSON.stringify({
        discord_webhook_url: currentWebhook
      })
    });

    if (restoreResponse.ok) {
      console.log('✅ Discord webhook restored successfully\n');
    } else {
      console.log('⚠️  Warning: Failed to restore webhook automatically');
      console.log(`Please manually restore: ${currentWebhook}\n`);
    }
    
    console.log('🎯 QA AUDIT COMPLETE!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
  } catch (error) {
    console.error('❌ Error during QA audit:', error.message);
    console.log('\n⚠️  Please manually verify Discord webhook restoration');
  }
}

qaAuditRun();
