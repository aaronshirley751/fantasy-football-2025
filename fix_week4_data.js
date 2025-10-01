// MANUALLY FIX WEEK 4 DATA
// Insert correct Week 4 matchup data based on real Sleeper API results

async function fixWeek4Data() {
  const fetch = (await import('node-fetch')).default;
  
  console.log('🔧 FIXING WEEK 4 DATA - Manual Insert');
  console.log('🎯 Inserting correct matchup results based on Sleeper API data');
  console.log('=' .repeat(80));
  console.log('');
  
  const workingKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmZXVvYmZqZ3Fvd255Ymx1dmplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1NTI1ODUsImV4cCI6MjA3MTEyODU4NX0.7qu0h_cKNpdW1ZENZ3652LE75MC6VQp9Ahu5SSDypuY';
  const LEAGUE_ID = 'a7d65b53-2ec5-4b38-94ee-7fcb97160989';
  
  // Real Week 4 results from Sleeper API analysis
  const realWeek4Data = [
    // Matchup 1: Roster 3 (193.8) beat Roster 8 (130.12)
    { roster_id: 3, opponent_roster_id: 8, points: 193.8, opponent_points: 130.12, is_winner: true, is_high_scorer: false, loss_fee_applied: false },
    { roster_id: 8, opponent_roster_id: 3, points: 130.12, opponent_points: 193.8, is_winner: false, is_high_scorer: false, loss_fee_applied: true },
    
    // Matchup 2: Roster 9 (165.74) beat Roster 2 (104.98)  
    { roster_id: 9, opponent_roster_id: 2, points: 165.74, opponent_points: 104.98, is_winner: true, is_high_scorer: false, loss_fee_applied: false },
    { roster_id: 2, opponent_roster_id: 9, points: 104.98, opponent_points: 165.74, is_winner: false, is_high_scorer: false, loss_fee_applied: true },
    
    // Matchup 3: Roster 6 (213.66) beat Roster 10 (127.16) - HIGHEST SCORER
    { roster_id: 6, opponent_roster_id: 10, points: 213.66, opponent_points: 127.16, is_winner: true, is_high_scorer: true, loss_fee_applied: false },
    { roster_id: 10, opponent_roster_id: 6, points: 127.16, opponent_points: 213.66, is_winner: false, is_high_scorer: false, loss_fee_applied: true },
    
    // Matchup 4: Roster 4 (201.42) beat Roster 1 (158.66)
    { roster_id: 4, opponent_roster_id: 1, points: 201.42, opponent_points: 158.66, is_winner: true, is_high_scorer: false, loss_fee_applied: false },
    { roster_id: 1, opponent_roster_id: 4, points: 158.66, opponent_points: 201.42, is_winner: false, is_high_scorer: false, loss_fee_applied: true },
    
    // Matchup 5: Roster 7 (168.08) beat Roster 5 (163.7)
    { roster_id: 7, opponent_roster_id: 5, points: 168.08, opponent_points: 163.7, is_winner: true, is_high_scorer: false, loss_fee_applied: false },
    { roster_id: 5, opponent_roster_id: 7, points: 163.7, opponent_points: 168.08, is_winner: false, is_high_scorer: false, loss_fee_applied: true }
  ];
  
  try {
    console.log('📝 INSERTING CORRECT WEEK 4 MATCHUP DATA:');
    console.log('-' .repeat(50));
    
    for (const matchup of realWeek4Data) {
      const matchupData = {
        league_id: LEAGUE_ID,
        week_number: 4,
        roster_id: matchup.roster_id,
        opponent_roster_id: matchup.opponent_roster_id,
        points: matchup.points,
        opponent_points: matchup.opponent_points,
        is_winner: matchup.is_winner,
        is_high_scorer: matchup.is_high_scorer,
        loss_fee_applied: matchup.loss_fee_applied,
        processed_at: new Date().toISOString()
      };
      
      const response = await fetch('https://jfeuobfjgqownybluvje.supabase.co/rest/v1/matchups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': workingKey,
          'Authorization': `Bearer ${workingKey}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(matchupData)
      });
      
      if (response.ok) {
        console.log(`✅ Roster ${matchup.roster_id}: ${matchup.points} pts, Winner: ${matchup.is_winner}, High Scorer: ${matchup.is_high_scorer}, Loss Fee: ${matchup.loss_fee_applied}`);
      } else {
        console.log(`❌ Failed to insert Roster ${matchup.roster_id}:`, await response.text());
      }
    }
    
    console.log('');
    console.log('🏆 WEEK 4 SUMMARY:');
    console.log('-' .repeat(50));
    console.log('Winners (no loss fee):');
    console.log('  • Roster 6 (Watts52): 213.66 pts - HIGH SCORER BONUS (-$5)');
    console.log('  • Roster 4 (BeanerDipp): 201.42 pts');
    console.log('  • Roster 3 (BillyTrim): 193.8 pts');
    console.log('  • Roster 7 (tscotty85): 168.08 pts');
    console.log('  • Roster 9 (petergell): 165.74 pts');
    console.log('');
    console.log('Losers (owe $5 loss fee):');
    console.log('  • Roster 5 (Shaklee77): 163.7 pts');
    console.log('  • Roster 1 (SaladBar751): 158.66 pts');
    console.log('  • Roster 8 (LastOne2022): 130.12 pts');
    console.log('  • Roster 10 (j1fisher25): 127.16 pts');
    console.log('  • Roster 2 (Turd_Ferguson24): 104.98 pts');
    
    console.log('');
    console.log('✅ Week 4 data correction complete!');
    
  } catch (error) {
    console.error('❌ Error fixing Week 4 data:', error);
  }
}

fixWeek4Data();