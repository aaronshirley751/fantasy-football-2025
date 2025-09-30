const https = require('https');

async function getApiData(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (error) {
                    reject(error);
                }
            });
        }).on('error', reject);
    });
}

async function analyzePreSeasonTransactions() {
    const leagueId = "1249067741470539776";
    
    try {
        console.log("📊 2025 Fantasy Football Pre-Season Transaction Analysis");
        console.log("=".repeat(60));
        
        // Get all required data
        const [transactions, users, rosters] = await Promise.all([
            getApiData(`https://api.sleeper.app/v1/league/${leagueId}/transactions/1`),
            getApiData(`https://api.sleeper.app/v1/league/${leagueId}/users`),
            getApiData(`https://api.sleeper.app/v1/league/${leagueId}/rosters`)
        ]);
        
        // Create mapping from user_id to display_name and team_name
        const userMap = {};
        users.forEach(user => {
            userMap[user.user_id] = {
                display_name: user.display_name,
                team_name: user.metadata?.team_name || user.display_name
            };
        });
        
        // Create mapping from roster_id to owner info
        const rosterMap = {};
        rosters.forEach(roster => {
            const ownerInfo = userMap[roster.owner_id];
            rosterMap[roster.roster_id] = {
                owner_id: roster.owner_id,
                display_name: ownerInfo?.display_name || 'Unknown',
                team_name: ownerInfo?.team_name || 'Unknown Team'
            };
        });
        
        // Count transactions by roster
        const rosterCounts = {};
        let commissionerCount = 0;
        
        transactions.forEach(transaction => {
            if (transaction.type === 'free_agent') {
                const rosterId = transaction.roster_ids[0];
                rosterCounts[rosterId] = (rosterCounts[rosterId] || 0) + 1;
            } else if (transaction.type === 'commissioner') {
                commissionerCount++;
            }
        });
        
        console.log("Free Agent Transactions by Team:");
        console.log("-".repeat(60));
        
        let totalFA = 0;
        let totalFees = 0;
        const sortedRosterIds = Object.keys(rosterCounts).sort((a, b) => parseInt(a) - parseInt(b));
        
        sortedRosterIds.forEach(rosterId => {
            const count = rosterCounts[rosterId];
            const owner = rosterMap[rosterId];
            totalFA += count;
            
            const feesOwed = Math.max(0, count - 10) * 2; // $2 per transaction after 10 free
            totalFees += feesOwed;
            
            const status = count <= 10 ? "✅ Within limit" : `💰 OWES $${feesOwed}`;
            const remaining = Math.max(0, 10 - count);
            
            console.log(`Roster ${rosterId}: ${owner.team_name} (${owner.display_name})`);
            console.log(`  Transactions: ${count}/10 free | Remaining: ${remaining} | ${status}`);
            console.log("");
        });
        
        // Check rosters with no transactions
        console.log("Teams with No Pre-Season Transactions:");
        console.log("-".repeat(60));
        let noTransactionCount = 0;
        rosters.forEach(roster => {
            if (!rosterCounts[roster.roster_id]) {
                const owner = rosterMap[roster.roster_id];
                console.log(`Roster ${roster.roster_id}: ${owner.team_name} (${owner.display_name}) - 10 free remaining ✅`);
                noTransactionCount++;
            }
        });
        
        if (noTransactionCount === 0) {
            console.log("(All teams have made at least one pre-season transaction)");
        }
        
        console.log("");
        console.log("📈 SUMMARY:");
        console.log("=".repeat(60));
        console.log(`Total Free Agent Transactions: ${totalFA}`);
        console.log(`Commissioner Transactions: ${commissionerCount}`);
        console.log(`Total Pre-Season Transactions: ${totalFA + commissionerCount}`);
        console.log(`Teams Active in Pre-Season: ${sortedRosterIds.length}/${rosters.length}`);
        
        if (totalFees > 0) {
            console.log("");
            console.log(`💰 TOTAL FEES OWED: $${totalFees}`);
            console.log("⚠️  These fees must be processed before Week 1!");
        } else {
            console.log("");
            console.log("✅ NO FEES OWED - All teams within free transaction limits");
        }
        
        console.log("");
        console.log("🎯 ACTION ITEMS:");
        console.log("-".repeat(60));
        console.log("1. Process fees owed before automated system starts");
        console.log("2. Set correct starting free transaction balances");
        console.log("3. Transition database from test to 2025 league");
        console.log("4. Re-enable GitHub Actions with 2025 league ID");
        console.log("");
        console.log(`⏰ First NFL game starts: September 4, 2025`);
        console.log(`⏰ First automated processing: Tuesday, September 9, 2025 at 2 AM EST`);
        
    } catch (error) {
        console.error('Error:', error);
    }
}

analyzePreSeasonTransactions();
