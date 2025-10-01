// WEEK 4 SPECIFIC FEE REPORT
// Generate the exact Week 4 report format to validate data

async function generateWeek4Report() {
  const fetch = (await import('node-fetch')).default;
  
  console.log('📊 Week 4 Fantasy Football Fees - Data Validation');
  console.log('🎯 Generating WEEK 4 ONLY report (not season totals)');
  console.log('=' .repeat(80));
  console.log('');
  
  const workingKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmZXVvYmZqZ3Fvd255Ymx1dmplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1NTI1ODUsImV4cCI6MjA3MTEyODU4NX0.7qu0h_cKNpdW1ZENZ3652LE75MC6VQp9Ahu5SSDypuY';
  const TARGET_WEEK = 4;
  
  try {
    // Get Week 4 matchups only
    const matchupsResponse = await fetch(`https://jfeuobfjgqownybluvje.supabase.co/rest/v1/matchups?league_id=eq.a7d65b53-2ec5-4b38-94ee-7fcb97160989&week_number=eq.${TARGET_WEEK}&select=*`, {
      headers: {
        'apikey': workingKey,
        'Authorization': `Bearer ${workingKey}`
      }
    });
    const week4Matchups = await matchupsResponse.json();
    
    // Get Week 4 transactions only
    const transactionsResponse = await fetch(`https://jfeuobfjgqownybluvje.supabase.co/rest/v1/transactions?league_id=eq.a7d65b53-2ec5-4b38-94ee-7fcb97160989&week_number=eq.${TARGET_WEEK}&select=*`, {
      headers: {
        'apikey': workingKey,
        'Authorization': `Bearer ${workingKey}`
      }
    });
    const week4Transactions = await transactionsResponse.json();
    
    // Get owner names from Sleeper API (not database)
    const sleeperUsersResponse = await fetch('https://api.sleeper.app/v1/league/1249067741470539776/users');
    const sleeperRostersResponse = await fetch('https://api.sleeper.app/v1/league/1249067741470539776/rosters');
    const sleeperUsers = await sleeperUsersResponse.json();
    const sleeperRosters = await sleeperRostersResponse.json();
    
    // Create roster ID to name mapping from Sleeper data
    const rosterNames = {};
    sleeperRosters.forEach(roster => {
      const user = sleeperUsers.find(u => u.user_id === roster.owner_id);
      if (user) {
        rosterNames[roster.roster_id] = user.display_name || user.username || `Team ${roster.roster_id}`;
      }
    });
    
    // Get league config for fees
    const leagueResponse = await fetch('https://jfeuobfjgqownybluvje.supabase.co/rest/v1/leagues?id=eq.a7d65b53-2ec5-4b38-94ee-7fcb97160989&select=*', {
      headers: {
        'apikey': workingKey,
        'Authorization': `Bearer ${workingKey}`
      }
    });
    const leagues = await leagueResponse.json();
    const league = leagues[0];
    
    const LOSS_FEE = league.loss_fee; // $5
    const TRANSACTION_FEE = league.transaction_fee; // $2
    const HIGH_SCORE_BONUS = league.high_score_bonus || 5; // -$5
    
    console.log('⚙️ LEAGUE CONFIGURATION:');
    console.log(`   Loss Fee: $${LOSS_FEE} per loss`);
    console.log(`   High Score Bonus: -$${HIGH_SCORE_BONUS}`);
    console.log(`   Transaction Fee: $${TRANSACTION_FEE} each`);
    console.log('');
    console.log('👥 OWNER NAMES MAPPED:');
    console.log('-' .repeat(50));
    Object.entries(rosterNames).forEach(([rosterId, name]) => {
      console.log(`   Roster ${rosterId}: ${name}`);
    });
    console.log('');
    
    // Initialize Week 4 fee tracking
    const week4Fees = {};
    
    // 1. CALCULATE WEEK 4 LOSS FEES
    console.log('🏆 WEEK 4 LOSS FEES:');
    console.log('-' .repeat(50));
    
    let highScorer = null;
    let highScore = 0;
    
    week4Matchups.forEach(matchup => {
      const ownerName = rosterNames[matchup.roster_id] || `Team ${matchup.roster_id}`;
      
      if (!week4Fees[matchup.roster_id]) {
        week4Fees[matchup.roster_id] = { 
          name: ownerName, 
          losses: 0, 
          transactions: 0, 
          highScoreBonus: 0, 
          total: 0 
        };
      }
      
      // Track highest scorer
      if (matchup.points > highScore) {
        highScore = matchup.points;
        highScorer = matchup.roster_id;
      }
      
      // Loss fees
      if (matchup.loss_fee_applied) {
        week4Fees[matchup.roster_id].losses += LOSS_FEE;
        console.log(`   ${ownerName}: Lost with ${matchup.points} pts (+$${LOSS_FEE})`);
      } else {
        console.log(`   ${ownerName}: Won with ${matchup.points} pts`);
      }
    });
    
    // 2. APPLY HIGH SCORE BONUS (check is_high_scorer flag instead of calculating)
    console.log('');
    console.log('🏆 HIGHEST SCORER:');
    console.log('-' .repeat(50));
    
    const highScorerMatchup = week4Matchups.find(m => m.is_high_scorer);
    if (highScorerMatchup) {
      const highScorerName = rosterNames[highScorerMatchup.roster_id] || `Team ${highScorerMatchup.roster_id}`;
      if (!week4Fees[highScorerMatchup.roster_id]) {
        week4Fees[highScorerMatchup.roster_id] = { 
          name: highScorerName, 
          losses: 0, 
          transactions: 0, 
          highScoreBonus: 0, 
          total: 0 
        };
      }
      week4Fees[highScorerMatchup.roster_id].highScoreBonus = -HIGH_SCORE_BONUS;
      console.log(`   ${highScorerName}: ${highScorerMatchup.points} pts (-$${HIGH_SCORE_BONUS} bonus)`);
    }
    
    // 3. CALCULATE WEEK 4 TRANSACTION FEES
    console.log('');
    console.log('📱 WEEK 4 TRANSACTION FEES:');
    console.log('-' .repeat(50));
    
    week4Transactions.forEach(transaction => {
      const ownerName = rosterNames[transaction.roster_id] || `Team ${transaction.roster_id}`;
      
      if (!week4Fees[transaction.roster_id]) {
        week4Fees[transaction.roster_id] = { 
          name: ownerName, 
          losses: 0, 
          transactions: 0, 
          highScoreBonus: 0, 
          total: 0 
        };
      }
      
      if (transaction.fee_amount > 0) {
        week4Fees[transaction.roster_id].transactions += transaction.fee_amount;
        console.log(`   ${ownerName}: ${transaction.type} transaction (+$${transaction.fee_amount})`);
      } else {
        console.log(`   ${ownerName}: ${transaction.type} transaction (FREE)`);
      }
    });
    
    // 4. CALCULATE TOTALS
    console.log('');
    console.log('🆕 THIS WEEK\'S ACTIVITY (Week 4)');
    console.log('━'.repeat(40));
    
    let weekTotal = 0;
    const sortedRosters = Object.keys(week4Fees).sort((a, b) => {
      const totalA = week4Fees[a].losses + week4Fees[a].transactions + week4Fees[a].highScoreBonus;
      const totalB = week4Fees[b].losses + week4Fees[b].transactions + week4Fees[b].highScoreBonus;
      return totalB - totalA; // Sort by highest fees first
    });
    
    sortedRosters.forEach(rosterId => {
      const fees = week4Fees[rosterId];
      const total = fees.losses + fees.transactions + fees.highScoreBonus;
      fees.total = total;
      weekTotal += total;
      
      const parts = [];
      if (fees.losses > 0) parts.push(`Loss ($${fees.losses})`);
      if (fees.transactions > 0) parts.push(`Transaction ($${fees.transactions})`);
      if (fees.highScoreBonus < 0) parts.push(`Bonus ($${fees.highScoreBonus})`);
      
      const description = parts.length > 0 ? parts.join(', ') : 'No fees';
      console.log(`• ${fees.name}: ${description} = $${total.toFixed(2)}`);
    });
    
    console.log('');
    console.log('💰 Week 4 Total');
    console.log(`$${weekTotal.toFixed(2)}`);
    console.log('');
    
    // 5. DETAILED BREAKDOWN FOR VALIDATION
    console.log('🔍 DETAILED VALIDATION DATA:');
    console.log('========================================');
    console.log('Week 4 Matchups Found:', week4Matchups.length);
    console.log('Week 4 Transactions Found:', week4Transactions.length);
    console.log('');
    
    console.log('Raw Week 4 Matchup Data:');
    week4Matchups.forEach(m => {
      console.log(`  Roster ${m.roster_id}: ${m.points} pts, Winner: ${m.is_winner}, Loss Fee: ${m.loss_fee_applied}, High Scorer: ${m.is_high_scorer}`);
    });
    
    console.log('');
    console.log('Raw Week 4 Transaction Data:');
    week4Transactions.forEach(t => {
      console.log(`  Roster ${t.roster_id}: ${t.type}, Fee: $${t.fee_amount}, Description: ${t.description}`);
    });
    
  } catch (error) {
    console.error('❌ Error generating Week 4 report:', error);
  }
}

// Run the report
generateWeek4Report();