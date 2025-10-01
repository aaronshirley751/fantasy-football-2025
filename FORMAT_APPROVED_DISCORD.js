const SUPABASE_URL = 'https://jfeuobfjgqownybluvje.supabase.co';
const CORRECT_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmZXVvYmZqZ3Fvd255Ymx1dmplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTU1MjU4NSwiZXhwIjoyMDcxMTI4NTg1fQ.TYZBL4UNLEJN6ovM6HQS5wxm2zkbZHBYtmQYALHDkqQ';

async function formatApprovedDiscordMessage() {
  console.log('🔍 Getting data from production function and formatting in approved format...\n');
  
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
      console.log(`❌ Production function failed: ${response.status} ${response.statusText}, ${errorText}`);
      return;
    }

    const result = await response.json();
    console.log('✅ Got production data, formatting in approved Discord format:\n');
    
    // EXACT approved format with corrected data
    const weekFees = result.week_fees || [];
    const seasonSummary = result.season_summary || [];
    const highScorer = result.high_scorer || {};
    const weekTotal = result.week_total || 0;
    
    let message = `📊 Week ${result.week_number} Fantasy Football Fees\n`;
    
    // High scorer section
    message += `🏆 Highest Scorer\n`;
    message += `${highScorer.owner_name}: ${highScorer.points} pts (-$5 bonus)\n`;
    
    // This week's activity
    message += `🆕 THIS WEEK'S ACTIVITY\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    
    weekFees.forEach(fee => {
      if (fee.type === 'loss_fee') {
        message += `• ${fee.owner_name}: Loss ($${fee.amount}) = $${fee.amount.toFixed(2)}\n`;
      } else if (fee.type === 'high_score_bonus') {
        message += `• ${fee.owner_name}: Bonus (-$${Math.abs(fee.amount)}) = -$${Math.abs(fee.amount).toFixed(2)}\n`;
      }
    });
    
    message += `💰 Week Total\n`;
    message += `$${weekTotal.toFixed(2)}\n`;
    
    // Season totals using REAL-TIME production data
    message += `📈 SEASON TOTALS (All Teams)\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    
    seasonSummary.forEach(team => {
      const total = team.season_total;
      const totalStr = total >= 0 ? `$${total.toFixed(2)}` : `-$${Math.abs(total).toFixed(2)}`;
      
      let details = [];
      if (team.transaction_fees > 0) {
        details.push(`$${team.transaction_fees.toFixed(2)} transactions`);
      }
      if (team.losses_inactive_fees > 0) {
        details.push(`$${team.losses_inactive_fees.toFixed(2)} losses/inactive`);
      }
      if (team.high_scorer_bonuses < 0) {
        details.push(`$${team.high_scorer_bonuses.toFixed(2)} high scorer bonus`);
      }
      
      const detailsStr = details.length > 0 ? ` (${details.join(', ')})` : '';
      const paidTransactions = Math.max(0, team.transactions_used - 10);
      const freeRemaining = Math.max(0, 10 - team.transactions_used);
      
      message += `• ${team.owner_name}: ${totalStr} total${detailsStr}, ${freeRemaining}/10 free remaining`;
      if (paidTransactions > 0) {
        message += ` (${paidTransactions} paid)`;
      }
      message += `\n`;
    });
    
    message += `🏦 Season Grand Total\n`;
    message += `$${result.season_grand_total.toFixed(2)} across all teams`;
    
    console.log('=== APPROVED DISCORD FORMAT ===');
    // Split by newlines and print each line separately for proper formatting
    const lines = message.split('\n');
    lines.forEach(line => console.log(line));
    console.log('\n=== RAW DATA FOR DEBUGGING ===');
    console.log('Season Summary:', JSON.stringify(seasonSummary, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

formatApprovedDiscordMessage();