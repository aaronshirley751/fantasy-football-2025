const fs = require('fs');

function auditTransactionsPostDraft() {
    try {
        // Load all data
        const transactions = JSON.parse(fs.readFileSync('transactions.json', 'utf8'));
        const users = JSON.parse(fs.readFileSync('users.json', 'utf8'));
        const rosters = JSON.parse(fs.readFileSync('rosters.json', 'utf8'));
        
        // Draft cutoff date: August 24, 2025 at midnight
        const draftCutoff = new Date('2025-08-24T00:00:00Z').getTime();
        
        // Create mappings
        const userMap = {};
        users.forEach(user => {
            userMap[user.user_id] = {
                display_name: user.display_name,
                team_name: user.metadata?.team_name || user.display_name
            };
        });
        
        const rosterMap = {};
        rosters.forEach(roster => {
            const ownerInfo = userMap[roster.owner_id];
            rosterMap[roster.roster_id] = {
                owner_id: roster.owner_id,
                display_name: ownerInfo?.display_name || 'Unknown',
                team_name: ownerInfo?.team_name || 'Unknown Team'
            };
        });
        
        console.log("=".repeat(80));
        console.log("POST-DRAFT TRANSACTION ANALYSIS - 2025 FANTASY FOOTBALL LEAGUE");
        console.log("Cutoff Date: August 24, 2025 (transactions on/after this date count)");
        console.log("League ID: 1249067741470539776");
        console.log("Analysis Date: September 3, 2025");
        console.log("=".repeat(80));
        console.log("");
        
        // Filter transactions to only those after draft cutoff
        const postDraftTransactions = transactions.filter(transaction => 
            transaction.created >= draftCutoff
        );
        
        console.log(`Total transactions in league: ${transactions.length}`);
        console.log(`Transactions BEFORE August 24, 2025: ${transactions.length - postDraftTransactions.length} (excluded)`);
        console.log(`Transactions ON/AFTER August 24, 2025: ${postDraftTransactions.length} (counted)`);
        console.log("");
        
        // Group post-draft transactions by roster
        const postDraftByRoster = {};
        postDraftTransactions.forEach((transaction, index) => {
            if (transaction.roster_ids && transaction.roster_ids.length > 0) {
                const rosterId = transaction.roster_ids[0];
                if (!postDraftByRoster[rosterId]) {
                    postDraftByRoster[rosterId] = [];
                }
                postDraftByRoster[rosterId].push({...transaction, index: index + 1});
            }
        });
        
        console.log("POST-DRAFT TRANSACTION SUMMARY BY TEAM:");
        console.log("=".repeat(80));
        
        let totalPostDraftFees = 0;
        const rosterIds = Object.keys(postDraftByRoster).sort((a, b) => parseInt(a) - parseInt(b));
        
        if (rosterIds.length === 0) {
            console.log("✅ NO POST-DRAFT TRANSACTIONS FOUND - All teams within limits!");
        } else {
            rosterIds.forEach(rosterId => {
                const rosterTransactions = postDraftByRoster[rosterId];
                const owner = rosterMap[rosterId];
                const freeAgentCount = rosterTransactions.filter(t => t.type === 'free_agent').length;
                const feesOwed = Math.max(0, freeAgentCount - 10) * 2;
                totalPostDraftFees += feesOwed;
                
                console.log(`Roster ${rosterId}: ${owner.team_name} (${owner.display_name})`);
                console.log(`  Post-Draft Free Agent Transactions: ${freeAgentCount}`);
                console.log(`  Free Transactions Remaining: ${Math.max(0, 10 - freeAgentCount)}`);
                
                if (feesOwed > 0) {
                    console.log(`  💰 FEES OWED: $${feesOwed}`);
                } else {
                    console.log(`  ✅ No fees owed`);
                }
                
                if (freeAgentCount > 0) {
                    console.log(`  Transaction Details:`);
                    rosterTransactions.filter(t => t.type === 'free_agent').forEach((transaction, i) => {
                        const date = new Date(transaction.created).toLocaleDateString();
                        const time = new Date(transaction.created).toLocaleTimeString();
                        const adds = transaction.adds ? Object.keys(transaction.adds).join(',') : 'none';
                        const drops = transaction.drops ? Object.keys(transaction.drops).join(',') : 'none';
                        console.log(`    ${i + 1}. ${date} ${time} - Add: ${adds} | Drop: ${drops}`);
                    });
                }
                console.log("");
            });
        }
        
        // Check teams with no post-draft activity
        console.log("TEAMS WITH NO POST-DRAFT TRANSACTIONS:");
        console.log("-".repeat(80));
        rosters.forEach(roster => {
            if (!postDraftByRoster[roster.roster_id]) {
                const owner = rosterMap[roster.roster_id];
                console.log(`Roster ${roster.roster_id}: ${owner.team_name} (${owner.display_name}) - 10 free remaining ✅`);
            }
        });
        
        console.log("");
        console.log("📊 FINAL SUMMARY:");
        console.log("=".repeat(80));
        console.log(`Teams with post-draft activity: ${rosterIds.length}/${rosters.length}`);
        console.log(`Total post-draft free agent transactions: ${postDraftTransactions.filter(t => t.type === 'free_agent').length}`);
        console.log(`Total post-draft commissioner transactions: ${postDraftTransactions.filter(t => t.type === 'commissioner').length}`);
        
        if (totalPostDraftFees > 0) {
            console.log(`💰 TOTAL FEES OWED (post-draft): $${totalPostDraftFees}`);
        } else {
            console.log(`✅ NO FEES OWED - All teams within 10 free transaction limits`);
        }
        
        console.log("");
        console.log("🎯 IMPACT OF AUGUST 24 CUTOFF RULE:");
        console.log("-".repeat(80));
        console.log("Previous analysis (all transactions): $16 owed");
        console.log(`New analysis (post-August 24 only): $${totalPostDraftFees} owed`);
        console.log(`Difference: $${16 - totalPostDraftFees} savings due to excluding pre-draft cleanup`);
        
    } catch (error) {
        console.error('Error:', error);
    }
}

auditTransactionsPostDraft();