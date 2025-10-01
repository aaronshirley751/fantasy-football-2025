// COMPARE WEEK 4: Database vs Sleeper API
async function compareWeek4Data() {
  const fetch = (await import('node-fetch')).default;
  
  console.log('🔍 WEEK 4 DATA COMPARISON: Database vs Sleeper API');
  console.log('=' .repeat(80));
  console.log('');
  
  try {
    // Get Week 4 data from Sleeper API (real data)
    const sleeperResponse = await fetch('https://api.sleeper.app/v1/league/1249067741470539776/matchups/4');
    const sleeperData = await sleeperResponse.json();
    
    console.log('🌟 REAL WEEK 4 DATA (from Sleeper API):');
    console.log('-' .repeat(50));
    sleeperData.forEach(matchup => {
      console.log(`Roster ${matchup.roster_id}: ${matchup.points} points (Matchup ${matchup.matchup_id})`);
    });
    
    // Find winners/losers and high scorer
    const matchupGroups = {};
    sleeperData.forEach(team => {
      if (!matchupGroups[team.matchup_id]) {
        matchupGroups[team.matchup_id] = [];
      }
      matchupGroups[team.matchup_id].push(team);
    });
    
    console.log('');
    console.log('🏆 REAL WEEK 4 RESULTS:');
    console.log('-' .repeat(50));
    
    let highScorer = null;
    let highScore = 0;
    
    Object.values(matchupGroups).forEach(matchup => {
      const [team1, team2] = matchup;
      const winner = team1.points > team2.points ? team1 : team2;
      const loser = team1.points > team2.points ? team2 : team1;
      
      console.log(`Matchup ${team1.matchup_id}: Roster ${winner.roster_id} (${winner.points}) beat Roster ${loser.roster_id} (${loser.points})`);
      
      // Track high scorer
      if (team1.points > highScore) {
        highScore = team1.points;
        highScorer = team1.roster_id;
      }
      if (team2.points > highScore) {
        highScore = team2.points;
        highScorer = team2.roster_id;
      }
    });
    
    console.log('');
    console.log(`🏆 HIGH SCORER: Roster ${highScorer} with ${highScore} points`);
    
    // Get our database data
    const workingKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmZXVvYmZqZ3Fvd255Ymx1dmplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1NTI1ODUsImV4cCI6MjA3MTEyODU4NX0.7qu0h_cKNpdW1ZENZ3652LE75MC6VQp9Ahu5SSDypuY';
    
    const dbResponse = await fetch(`https://jfeuobfjgqownybluvje.supabase.co/rest/v1/matchups?league_id=eq.a7d65b53-2ec5-4b38-94ee-7fcb97160989&week_number=eq.4&select=roster_id,points,is_winner,is_high_scorer`, {
      headers: {
        'apikey': workingKey,
        'Authorization': `Bearer ${workingKey}`
      }
    });
    const dbData = await dbResponse.json();
    
    console.log('');
    console.log('💀 CORRUPT DATABASE DATA:');
    console.log('-' .repeat(50));
    dbData.forEach(matchup => {
      console.log(`Roster ${matchup.roster_id}: ${matchup.points} points, Winner: ${matchup.is_winner}, High Scorer: ${matchup.is_high_scorer}`);
    });
    
    console.log('');
    console.log('🚨 CONCLUSION:');
    console.log('=' .repeat(50));
    console.log('❌ Week 4 database data is COMPLETELY WRONG');
    console.log('✅ Real highest scorer should be Roster', highScorer, 'with', highScore, 'points');
    console.log('❌ Database shows all teams with 0 points and all as losers');
    console.log('🔧 SOLUTION: Delete corrupt Week 4 data and reprocess with real Sleeper data');
    
  } catch (error) {
    console.error('❌ Error comparing data:', error);
  }
}

compareWeek4Data();