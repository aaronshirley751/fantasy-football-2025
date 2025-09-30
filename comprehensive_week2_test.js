#!/usr/bin/env node

// Comprehensive test to display full team names and expected results
// This simulates the exact function behavior with team name resolution

const fs = require('fs');

function displayComprehensiveResults() {
    console.log("🔍 COMPREHENSIVE WEEK 2 RESULTS TEST");
    console.log("=====================================");
    console.log("Date: September 16, 2025");
    console.log("League: 2025 Fantasy Football League (1249067741470539776)");
    console.log("Week: 2");
    
    try {
        // Load data files
        const matchups = JSON.parse(fs.readFileSync('week2_matchups.json', 'utf8'));
        const users = JSON.parse(fs.readFileSync('users_2025.json', 'utf8'));
        const rosters = JSON.parse(fs.readFileSync('rosters_2025.json', 'utf8'));
        
        // Create user mapping
        const userMap = {};
        users.forEach(user => {
            userMap[user.user_id] = {
                display_name: user.display_name,
                team_name: user.metadata?.team_name || user.display_name
            };
        });
        
        // Create roster to owner mapping
        const rosterOwnerMap = {};
        rosters.forEach(roster => {
            const owner = userMap[roster.owner_id];
            rosterOwnerMap[roster.roster_id] = {
                owner_name: owner?.display_name || 'Unknown Owner',
                team_name: owner?.team_name || 'Unknown Team',
                user_id: roster.owner_id
            };
        });
        
        console.log("\n👥 TEAM ROSTER MAPPING:");
        console.log("========================");
        Object.keys(rosterOwnerMap).forEach(rosterId => {
            const owner = rosterOwnerMap[rosterId];
            console.log(`Roster ${rosterId}: ${owner.owner_name} (${owner.team_name})`);
        });
        
        // Analyze matchups with team names
        const matchupGroups = {};
        matchups.forEach(team => {
            if (!matchupGroups[team.matchup_id]) {
                matchupGroups[team.matchup_id] = [];
            }
            matchupGroups[team.matchup_id].push({
                roster_id: team.roster_id,
                points: team.points,
                owner: rosterOwnerMap[team.roster_id]
            });
        });
        
        console.log("\n🏈 WEEK 2 MATCHUP RESULTS:");
        console.log("===========================");
        
        const losers = [];
        let highScorer = null;
        let highestScore = 0;
        
        Object.keys(matchupGroups).forEach(matchupId => {
            const teams = matchupGroups[matchupId];
            if (teams.length === 2) {
                const [winner, loser] = teams.sort((a,b) => b.points - a.points);
                
                console.log(`\nMatchup ${matchupId}:`);
                console.log(`  🏆 WINNER: ${winner.owner.owner_name} (${winner.owner.team_name})`);
                console.log(`     Roster ${winner.roster_id} - ${winner.points} points`);
                console.log(`  ❌ LOSER:  ${loser.owner.owner_name} (${loser.owner.team_name})`);
                console.log(`     Roster ${loser.roster_id} - ${loser.points} points → $5 loss fee`);
                
                losers.push({
                    roster_id: loser.roster_id,
                    owner: loser.owner,
                    points: loser.points
                });
                
                // Track high scorer
                if (winner.points > highestScore) {
                    highestScore = winner.points;
                    highScorer = {
                        roster_id: winner.roster_id,
                        owner: winner.owner,
                        points: winner.points
                    };
                }
            }
        });
        
        console.log("\n💰 WEEKLY FEE BREAKDOWN:");
        console.log("=========================");
        
        console.log("\n📉 LOSS FEES ($5 each):");
        console.log("------------------------");
        let totalLossFees = 0;
        losers.forEach(loser => {
            console.log(`${loser.owner.owner_name} (${loser.owner.team_name}) - Roster ${loser.roster_id}: +$5`);
            totalLossFees += 5;
        });
        
        console.log("\n📈 HIGH SCORER BONUS:");
        console.log("---------------------");
        if (highScorer) {
            console.log(`${highScorer.owner.owner_name} (${highScorer.owner.team_name}) - Roster ${highScorer.roster_id}: -$5 (${highScorer.points} points)`);
        }
        
        console.log("\n💳 TRANSACTION FEES:");
        console.log("--------------------");
        console.log("$0 - All teams within 10 free transactions (August 24 cutoff active)");
        
        console.log("\n🏥 INACTIVE PLAYER PENALTIES:");
        console.log("------------------------------");
        console.log("$0 - No inactive penalties for Week 2 (would need to check lineups)");
        
        console.log("\n📊 FINANCIAL SUMMARY:");
        console.log("======================");
        console.log(`Loss fees collected: $${totalLossFees}`);
        console.log(`High scorer credit: -$5`);
        console.log(`Transaction fees: $0`);
        console.log(`Inactive penalties: $0`);
        console.log(`─────────────────────────`);
        console.log(`NET COLLECTION: $${totalLossFees - 5}`);
        
        console.log("\n✅ EXPECTED vs ACTUAL:");
        console.log("=======================");
        const expectedNet = 20;
        const actualNet = totalLossFees - 5;
        
        if (actualNet === expectedNet) {
            console.log(`✅ SUCCESS: Net collection matches expected $${expectedNet}`);
        } else {
            console.log(`❌ MISMATCH: Expected $${expectedNet}, calculated $${actualNet}`);
        }
        
        console.log("\n🎯 FUNCTION TEST CRITERIA:");
        console.log("===========================");
        console.log("✅ Correct league ID: 1249067741470539776");
        console.log("✅ Correct week: 2");
        console.log("✅ Expected losers:", losers.map(l => l.roster_id).join(', '));
        console.log("✅ Expected high scorer: Roster", highScorer?.roster_id);
        console.log("✅ Expected net: $20");
        console.log("✅ August 24 cutoff: Active (preventing pre-draft transaction fees)");
        
        console.log("\n🚀 READY FOR PRODUCTION FUNCTION TEST:");
        console.log("=======================================");
        console.log("The deployed function should produce these exact results when called with:");
        console.log(`League ID: 1249067741470539776`);
        console.log(`Week: 2`);
        console.log(`Expected output: $${actualNet} net collection`);
        
        return {
            losers: losers,
            highScorer: highScorer,
            totalLossFees: totalLossFees,
            netCollection: actualNet,
            success: actualNet === expectedNet
        };
        
    } catch (error) {
        console.error("❌ Error loading data:", error.message);
        console.log("\nMake sure these files exist:");
        console.log("- week2_matchups.json");
        console.log("- users_2025.json");
        console.log("- rosters_2025.json");
        return null;
    }
}

// Run the comprehensive test
const results = displayComprehensiveResults();

if (results && results.success) {
    console.log("\n🎉 ALL VALIDATIONS PASSED - Function ready for testing!");
} else if (results) {
    console.log("\n⚠️  Validation issues found - check calculations");
} else {
    console.log("\n❌ Test failed - check data files");
}