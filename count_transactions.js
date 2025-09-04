const https = require('https');

function countTransactionsByRoster() {
    const leagueId = "1249067741470539776";
    const url = `https://api.sleeper.app/v1/league/${leagueId}/transactions/1`;
    
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const transactions = JSON.parse(data);
                    
                    // Count free agent transactions by roster
                    const rosterCounts = {};
                    let commissisnerCount = 0;
                    
                    transactions.forEach(transaction => {
                        if (transaction.type === 'free_agent') {
                            const rosterId = transaction.roster_ids[0];
                            rosterCounts[rosterId] = (rosterCounts[rosterId] || 0) + 1;
                        } else if (transaction.type === 'commissioner') {
                            commissisnerCount++;
                        }
                    });
                    
                    console.log("Pre-Season Transaction Analysis - 2025 League");
                    console.log("=".repeat(50));
                    console.log("Free Agent Transactions by Roster:");
                    
                    let totalFA = 0;
                    const sortedRosterIds = Object.keys(rosterCounts).sort((a, b) => parseInt(a) - parseInt(b));
                    
                    sortedRosterIds.forEach(rosterId => {
                        const count = rosterCounts[rosterId];
                        totalFA += count;
                        const feesOwed = Math.max(0, count - 10) * 2; // $2 per transaction after 10 free
                        const status = count <= 10 ? "✅ Under limit" : `💰 Owes $${feesOwed}`;
                        console.log(`  Roster ${rosterId}: ${count} transactions - ${status}`);
                    });
                    
                    console.log("\nSummary:");
                    console.log(`  Total Free Agent Transactions: ${totalFA}`);
                    console.log(`  Commissioner Transactions: ${commissisnerCount}`);
                    console.log(`  Total Transactions: ${totalFA + commissisnerCount}`);
                    
                    // Calculate total fees owed
                    const totalFees = Object.values(rosterCounts).reduce((sum, count) => 
                        sum + Math.max(0, count - 10) * 2, 0);
                    
                    if (totalFees > 0) {
                        console.log(`\n💰 Total Fees Owed: $${totalFees}`);
                    } else {
                        console.log(`\n✅ No fees owed - all rosters within free transaction limits`);
                    }
                    
                    resolve();
                } catch (error) {
                    reject(error);
                }
            });
        }).on('error', (error) => {
            reject(error);
        });
    });
}

countTransactionsByRoster().catch(console.error);