// FULL WEEK 4 REPORT - Mimic process-weekly-fees function
// Generate complete formatted report matching approved Discord format

async function generateFullWeek4Report() {
  const fetch = (await import('node-fetch')).default;
  
  console.log('📊 GENERATING FULL WEEK 4 FANTASY FOOTBALL FEES REPORT');
  console.log('🎯 Matching approved Discord format with all sections');
  console.log('=' .repeat(80));
  console.log('');
  
  const workingKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmZXVvYmZqZ3Fvd255Ymx1dmplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1NTI1ODUsImV4cCI6MjA3MTEyODU4NX0.7qu0h_cKNpdW1ZENZ3652LE75MC6VQp9Ahu5SSDypuY';
  const LEAGUE_ID = 'a7d65b53-2ec5-4b38-94ee-7fcb97160989';
  const TARGET_WEEK = 4;
  
  try {
    // Get all required data
    const [matchupsRes, transactionsRes, allMatchupsRes, allTransactionsRes] = await Promise.all([
      // Week 4 specific data
      fetch(`https://jfeuobfjgqownybluvje.supabase.co/rest/v1/matchups?league_id=eq.${LEAGUE_ID}&week_number=eq.${TARGET_WEEK}&select=*`, {
        headers: { 'apikey': workingKey, 'Authorization': `Bearer ${workingKey}` }
      }),
      fetch(`https://jfeuobfjgqownybluvje.supabase.co/rest/v1/transactions?league_id=eq.${LEAGUE_ID}&week_number=eq.${TARGET_WEEK}&select=*`, {
        headers: { 'apikey': workingKey, 'Authorization': `Bearer ${workingKey}` }
      }),
      // All season data
      fetch(`https://jfeuobfjgqownybluvje.supabase.co/rest/v1/matchups?league_id=eq.${LEAGUE_ID}&select=*`, {
        headers: { 'apikey': workingKey, 'Authorization': `Bearer ${workingKey}` }
      }),
      fetch(`https://jfeuobfjgqownybluvje.supabase.co/rest/v1/transactions?league_id=eq.${LEAGUE_ID}&select=*`, {
        headers: { 'apikey': workingKey, 'Authorization': `Bearer ${workingKey}` }
      })
    ]);
    
    const week4Matchups = await matchupsRes.json();
    const week4Transactions = await transactionsRes.json();
    const allMatchups = await allMatchupsRes.json();
    const allTransactions = await allTransactionsRes.json();
    
    // Get owner names from Sleeper API
    const sleeperUsersRes = await fetch('https://api.sleeper.app/v1/league/1249067741470539776/users');
    const sleeperRostersRes = await fetch('https://api.sleeper.app/v1/league/1249067741470539776/rosters');
    const sleeperUsers = await sleeperUsersRes.json();
    const sleeperRosters = await sleeperRostersRes.json();
    
    // Create roster ID to name mapping
    const rosterNames = {};
    sleeperRosters.forEach(roster => {
      const user = sleeperUsers.find(u => u.user_id === roster.owner_id);
      if (user) {
        rosterNames[roster.roster_id] = user.display_name || user.username || `Team ${roster.roster_id}`;
      }
    });
    
    // Fee configuration  
    const LOSS_FEE = 5;
    const TRANSACTION_FEE = 2;
    const HIGH_SCORE_BONUS = 5;
    const FREE_TRANSACTIONS = 10;
    
    // Calculate Week 4 fees
    const week4Fees = {};
    
    // 1. Week 4 loss fees and high scorer
    week4Matchups.forEach(matchup => {
      const rosterId = matchup.roster_id;
      const ownerName = rosterNames[rosterId] || `Team ${rosterId}`;
      
      if (!week4Fees[rosterId]) {
        week4Fees[rosterId] = { 
          name: ownerName, 
          losses: 0, 
          transactions: 0, 
          highScoreBonus: 0, 
          total: 0 
        };
      }
      
      // Loss fees
      if (matchup.loss_fee_applied) {
        week4Fees[rosterId].losses += LOSS_FEE;
      }
      
      // High scorer bonus
      if (matchup.is_high_scorer) {
        week4Fees[rosterId].highScoreBonus = -HIGH_SCORE_BONUS;
      }
    });
    
    // 2. Week 4 transaction fees
    week4Transactions.forEach(transaction => {
      const rosterId = transaction.roster_id;
      const ownerName = rosterNames[rosterId] || `Team ${rosterId}`;
      
      if (!week4Fees[rosterId]) {
        week4Fees[rosterId] = { 
          name: ownerName, 
          losses: 0, 
          transactions: 0, 
          highScoreBonus: 0, 
          total: 0 
        };
      }
      
      if (transaction.fee_amount > 0) {
        week4Fees[rosterId].transactions += transaction.fee_amount;
      }
    });
    
    // Calculate totals for Week 4
    let week4Total = 0;
    Object.keys(week4Fees).forEach(rosterId => {
      const fees = week4Fees[rosterId];
      fees.total = fees.losses + fees.transactions + fees.highScoreBonus;
      week4Total += fees.total;
    });
    
    // Calculate season totals
    const seasonTotals = {};
    
    // Season loss fees
    allMatchups.forEach(matchup => {
      const rosterId = matchup.roster_id;
      const ownerName = rosterNames[rosterId] || `Team ${rosterId}`;
      
      if (!seasonTotals[rosterId]) {
        seasonTotals[rosterId] = { 
          name: ownerName, 
          losses: 0, 
          transactions: 0, 
          highScoreBonus: 0,
          transactionCount: 0,
          total: 0 
        };
      }
      
      if (matchup.loss_fee_applied) {
        seasonTotals[rosterId].losses += LOSS_FEE;
      }
      
      if (matchup.is_high_scorer) {
        seasonTotals[rosterId].highScoreBonus -= HIGH_SCORE_BONUS;
      }
    });
    
    // Season transaction fees and counts
    const transactionCounts = {};
    allTransactions.forEach(transaction => {
      const rosterId = transaction.roster_id;
      
      if (!transactionCounts[rosterId]) {
        transactionCounts[rosterId] = 0;
      }
      
      // Count paid transactions only for display
      if (['waiver', 'free_agent'].includes(transaction.type)) {
        transactionCounts[rosterId]++;
      }
      
      if (!seasonTotals[rosterId]) {
        const ownerName = rosterNames[rosterId] || `Team ${rosterId}`;
        seasonTotals[rosterId] = { 
          name: ownerName, 
          losses: 0, 
          transactions: 0, 
          highScoreBonus: 0,
          transactionCount: 0,
          total: 0 
        };
      }
      
      if (transaction.fee_amount > 0) {
        seasonTotals[rosterId].transactions += transaction.fee_amount;
      }
    });
    
    // Add transaction counts and calculate totals
    Object.keys(seasonTotals).forEach(rosterId => {
      const season = seasonTotals[rosterId];
      season.transactionCount = transactionCounts[rosterId] || 0;
      season.total = season.losses + season.transactions + season.highScoreBonus;
    });
    
    let seasonGrandTotal = 0;
    Object.values(seasonTotals).forEach(season => {
      seasonGrandTotal += season.total;
    });
    
    // Find highest scorer for Week 4
    const highScorerMatchup = week4Matchups.find(m => m.is_high_scorer);
    const highScorerName = highScorerMatchup ? rosterNames[highScorerMatchup.roster_id] : 'Unknown';
    const highScore = highScorerMatchup ? highScorerMatchup.points : 0;
    
    // Generate the Discord-format report
    console.log('📊 Week 4 Fantasy Football Fees');
    console.log('🏆 Highest Scorer');
    console.log(`${highScorerName}: ${highScore} pts (-$${HIGH_SCORE_BONUS} bonus)`);
    console.log('🆕 THIS WEEK\'S ACTIVITY');
    console.log('━'.repeat(24));
    
    // Sort by total fees descending
    const sortedWeek4 = Object.values(week4Fees).sort((a, b) => b.total - a.total);
    
    sortedWeek4.forEach(fees => {
      const parts = [];
      if (fees.losses > 0) parts.push(`Loss ($${fees.losses})`);
      if (fees.transactions > 0) {
        // Break out multiple transactions
        const transactionCount = Math.round(fees.transactions / TRANSACTION_FEE);
        for (let i = 0; i < transactionCount; i++) {
          parts.push(`Transaction ($${TRANSACTION_FEE})`);
        }
      }
      if (fees.highScoreBonus < 0) parts.push(`Bonus ($${fees.highScoreBonus})`);
      
      if (parts.length > 0) {
        console.log(`• ${fees.name}: ${parts.join(', ')} = $${fees.total.toFixed(2)}`);
      } else {
        console.log(`• ${fees.name}: No fees = $${fees.total.toFixed(2)}`);
      }
    });
    
    console.log('💰 Week Total');
    console.log(`$${week4Total.toFixed(2)}`);
    console.log('📈 SEASON TOTALS (All Teams)');
    console.log('━'.repeat(24));
    
    // Sort season totals by total fees descending
    const sortedSeason = Object.values(seasonTotals).sort((a, b) => b.total - a.total);
    
    sortedSeason.forEach(season => {
      const freeRemaining = Math.max(0, FREE_TRANSACTIONS - season.transactionCount);
      const used = Math.min(season.transactionCount, FREE_TRANSACTIONS);
      const paidTransactions = Math.max(0, season.transactionCount - FREE_TRANSACTIONS);
      
      const totalOther = season.total - season.transactions;
      
      if (season.transactions > 0) {
        console.log(`• ${season.name}:`);
        console.log(`  └ $${season.total.toFixed(2)} total`);
        console.log(`  └ $${season.transactions.toFixed(2)} transactions`);
        console.log(`  └ $${totalOther.toFixed(2)} other (losses/inactive)`);
        console.log(`  └ ${freeRemaining}/10 free remaining (${paidTransactions} paid transactions)`);
      } else {
        console.log(`• ${season.name}:`);
        console.log(`  └ $${season.total.toFixed(2)} total (losses/inactive)`);
        console.log(`  └ ${freeRemaining}/10 free remaining`);
      }
    });
    
    console.log('🏦 Season Grand Total');
    console.log(`$${seasonGrandTotal.toFixed(2)} across all teams`);
    console.log('ℹ️ Transaction Rules');
    console.log('First 10 waiver/free agent claims per season are free ($2 each after)');
    console.log('');
    console.log(`Fantasy Fee Tracker | Powered by Sleeper API•${new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })} ${new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`);
    
  } catch (error) {
    console.error('❌ Error generating full Week 4 report:', error);
  }
}

generateFullWeek4Report();