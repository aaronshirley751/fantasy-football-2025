const fs = require('fs');

function auditTransactions() {
    try {
        // Load all data
        const transactions = JSON.parse(fs.readFileSync('transactions.json', 'utf8'));
        const users = JSON.parse(fs.readFileSync('users.json', 'utf8'));
        const rosters = JSON.parse(fs.readFileSync('rosters.json', 'utf8'));
        
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
        console.log("DETAILED TRANSACTION AUDIT - 2025 FANTASY FOOTBALL LEAGUE");
        console.log("League ID: 1249067741470539776");
        console.log("Analysis Date: September 3, 2025");
        console.log("=".repeat(80));
        console.log("");
        
        // Group transactions by roster
        const transactionsByRoster = {};
        transactions.forEach((transaction, index) => {
            if (transaction.roster_ids && transaction.roster_ids.length > 0) {
                const rosterId = transaction.roster_ids[0];
                if (!transactionsByRoster[rosterId]) {
                    transactionsByRoster[rosterId] = [];
                }
                transactionsByRoster[rosterId].push({...transaction, index: index + 1});
            }
        });
        
        // Focus on SaladBar751's team first (Roster 1)
        console.log("🔍 SALADBAR751 (ROSTER 1) - DETAILED TRANSACTION AUDIT");
        console.log("=".repeat(80));
        
        const roster1Transactions = transactionsByRoster[1] || [];
        if (roster1Transactions.length === 0) {
            console.log("❌ NO TRANSACTIONS FOUND FOR ROSTER 1");
        } else {
            roster1Transactions.forEach((transaction, i) => {
                console.log(`Transaction #${i + 1} (API Index: ${transaction.index})`);
                console.log(`  Type: ${transaction.type}`);
                console.log(`  Status: ${transaction.status}`);
                console.log(`  Created: ${new Date(transaction.created).toLocaleString()}`);
                console.log(`  Transaction ID: ${transaction.transaction_id}`);
                console.log(`  Creator: ${transaction.creator}`);
                
                if (transaction.adds) {
                    console.log(`  Players Added: ${JSON.stringify(transaction.adds)}`);
                }
                if (transaction.drops) {
                    console.log(`  Players Dropped: ${JSON.stringify(transaction.drops)}`);
                }
                if (transaction.consenter_ids) {
                    console.log(`  Consenter IDs: ${JSON.stringify(transaction.consenter_ids)}`);
                }
                
                console.log("");
            });
            
            console.log(`SUMMARY FOR ROSTER 1 (SaladBar751):`);
            console.log(`  Total Transactions: ${roster1Transactions.length}`);
            console.log(`  Free Agent Transactions: ${roster1Transactions.filter(t => t.type === 'free_agent').length}`);
            console.log(`  Commissioner Transactions: ${roster1Transactions.filter(t => t.type === 'commissioner').length}`);
            console.log(`  Trade Transactions: ${roster1Transactions.filter(t => t.type === 'trade').length}`);
            console.log(`  Other Transactions: ${roster1Transactions.filter(t => !['free_agent', 'commissioner', 'trade'].includes(t.type)).length}`);
        }
        
        console.log("");
        console.log("=".repeat(80));
        console.log("ALL ROSTERS - TRANSACTION SUMMARY");
        console.log("=".repeat(80));
        
        // Summary for all rosters
        Object.keys(transactionsByRoster).sort((a, b) => parseInt(a) - parseInt(b)).forEach(rosterId => {
            const rosterTransactions = transactionsByRoster[rosterId];
            const owner = rosterMap[rosterId];
            const freeAgentCount = rosterTransactions.filter(t => t.type === 'free_agent').length;
            
            console.log(`Roster ${rosterId}: ${owner.team_name} (${owner.display_name})`);
            console.log(`  Total: ${rosterTransactions.length} | Free Agent: ${freeAgentCount} | Commissioner: ${rosterTransactions.filter(t => t.type === 'commissioner').length}`);
            
            if (freeAgentCount > 0) {
                console.log(`  Free Agent Transaction Details:`);
                rosterTransactions.filter(t => t.type === 'free_agent').forEach((transaction, i) => {
                    const date = new Date(transaction.created).toLocaleDateString();
                    const adds = transaction.adds ? Object.keys(transaction.adds).join(',') : 'none';
                    const drops = transaction.drops ? Object.keys(transaction.drops).join(',') : 'none';
                    console.log(`    ${i + 1}. ${date} - Add: ${adds} | Drop: ${drops}`);
                });
            }
            console.log("");
        });
        
        console.log("=".repeat(80));
        console.log("RAW DATA VERIFICATION");
        console.log("=".repeat(80));
        console.log(`Total transactions in API response: ${transactions.length}`);
        console.log(`Transactions with roster_ids: ${transactions.filter(t => t.roster_ids && t.roster_ids.length > 0).length}`);
        console.log(`Free agent transactions: ${transactions.filter(t => t.type === 'free_agent').length}`);
        console.log(`Commissioner transactions: ${transactions.filter(t => t.type === 'commissioner').length}`);
        console.log(`Trade transactions: ${transactions.filter(t => t.type === 'trade').length}`);
        
        console.log("");
        console.log("POTENTIAL ISSUES TO INVESTIGATE:");
        console.log("- Are we correctly filtering by transaction type?");
        console.log("- Are commissioner transactions being counted incorrectly?");
        console.log("- Are there duplicate transactions in the data?");
        console.log("- Is the roster_id mapping correct?");
        
    } catch (error) {
        console.error('Error:', error);
    }
}

auditTransactions();
