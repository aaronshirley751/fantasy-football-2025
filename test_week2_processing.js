#!/usr/bin/env node

// Test script to validate Week 2 processing logic
// This simulates what the process-weekly-fees function should produce

const fs = require('fs');

// Expected results from our analysis
const EXPECTED_RESULTS = {
  losses: [1, 5, 6, 7, 10], // Rosters that should pay $5 for losing
  highScorer: 3, // Roster 3 with 207.08 points should get -$5 credit
  matchups: {
    1: {winner: 8, loser: 6, winnerPoints: 174.5, loserPoints: 147.12},
    2: {winner: 2, loser: 1, winnerPoints: 164.9, loserPoints: 107.6},
    3: {winner: 3, loser: 10, winnerPoints: 207.08, loserPoints: 135.76},
    4: {winner: 9, loser: 7, winnerPoints: 180.64, loserPoints: 125.14},
    5: {winner: 4, loser: 5, winnerPoints: 136.24, loserPoints: 132.6}
  }
};

function analyzeMatchups() {
  console.log("🔍 WEEK 2 VALIDATION TEST - 2025 League");
  console.log("==========================================");
  
  const matchupData = JSON.parse(fs.readFileSync('week2_matchups.json', 'utf8'));
  
  // Group by matchup_id
  const matchups = {};
  matchupData.forEach(team => {
    if (!matchups[team.matchup_id]) {
      matchups[team.matchup_id] = [];
    }
    matchups[team.matchup_id].push({
      roster_id: team.roster_id,
      points: team.points
    });
  });
  
  console.log("\n📊 MATCHUP RESULTS:");
  console.log("===================");
  
  const actualLosers = [];
  let actualHighScorer = null;
  let highestScore = 0;
  
  Object.keys(matchups).forEach(matchupId => {
    const teams = matchups[matchupId];
    if (teams.length === 2) {
      const [team1, team2] = teams.sort((a,b) => b.points - a.points);
      console.log(`Matchup ${matchupId}: Roster ${team1.roster_id} (${team1.points}) BEATS Roster ${team2.roster_id} (${team2.points})`);
      
      actualLosers.push(team2.roster_id);
      
      // Track high scorer
      if (team1.points > highestScore) {
        highestScore = team1.points;
        actualHighScorer = team1.roster_id;
      }
    }
  });
  
  console.log("\n💰 FEE CALCULATIONS:");
  console.log("====================");
  
  console.log(`High Scorer: Roster ${actualHighScorer} (${highestScore} points) → -$5 credit`);
  console.log("Loss Fees:");
  actualLosers.sort((a,b) => a-b).forEach(rosterId => {
    console.log(`  Roster ${rosterId} → +$5 (loss fee)`);
  });
  
  console.log("\n✅ VALIDATION:");
  console.log("===============");
  
  // Validate losers
  const expectedLosers = EXPECTED_RESULTS.losses.sort((a,b) => a-b);
  const actualLosersSorted = actualLosers.sort((a,b) => a-b);
  
  const losersMatch = JSON.stringify(expectedLosers) === JSON.stringify(actualLosersSorted);
  console.log(`Loss fees match expected: ${losersMatch ? '✅' : '❌'}`);
  if (!losersMatch) {
    console.log(`  Expected: [${expectedLosers.join(', ')}]`);
    console.log(`  Actual:   [${actualLosersSorted.join(', ')}]`);
  }
  
  // Validate high scorer
  const highScorerMatch = actualHighScorer === EXPECTED_RESULTS.highScorer;
  console.log(`High scorer match expected: ${highScorerMatch ? '✅' : '❌'}`);
  if (!highScorerMatch) {
    console.log(`  Expected: Roster ${EXPECTED_RESULTS.highScorer}`);
    console.log(`  Actual:   Roster ${actualHighScorer}`);
  }
  
  console.log("\n📋 SUMMARY FOR PRODUCTION FUNCTION TEST:");
  console.log("=========================================");
  console.log(`League ID: 1249067741470539776`);
  console.log(`Week: 2`);
  console.log(`Expected total fees to process: ${actualLosers.length} loss fees ($5 each) + 1 high scorer credit (-$5)`);
  console.log(`Net fee collection: $${actualLosers.length * 5 - 5} (${actualLosers.length * 5} collected - 5 credited)`);
  
  return {
    success: losersMatch && highScorerMatch,
    actualLosers: actualLosersSorted,
    actualHighScorer,
    totalLossFees: actualLosers.length * 5,
    highScorerCredit: -5,
    netCollection: actualLosers.length * 5 - 5
  };
}

// Run the analysis
const results = analyzeMatchups();

if (results.success) {
  console.log("\n🎉 VALIDATION PASSED - Week 2 data is correctly analyzed!");
} else {
  console.log("\n❌ VALIDATION FAILED - Check the logic!");
  process.exit(1);
}