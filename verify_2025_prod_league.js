// Test 2025 Production League API Access
const PROD_2025_LEAGUE_ID = '1249067741470539776';

async function verifyProd2025LeagueAccess() {
    console.log('🏈 VERIFYING 2025 PRODUCTION LEAGUE API ACCESS');
    console.log('=' .repeat(70));
    console.log(`League ID: ${PROD_2025_LEAGUE_ID}`);
    console.log();
    
    try {
        // 1. Test League Info
        console.log('📡 1. TESTING LEAGUE INFO ENDPOINT');
        console.log('-'.repeat(50));
        const leagueResponse = await fetch(`https://api.sleeper.app/v1/league/${PROD_2025_LEAGUE_ID}`);
        console.log(`Status: ${leagueResponse.status}`);
        
        if (leagueResponse.ok) {
            const league = await leagueResponse.json();
            console.log(`✅ League Name: ${league.name}`);
            console.log(`✅ Season: ${league.season}`);
            console.log(`✅ Status: ${league.status}`);
            console.log(`✅ Total Rosters: ${league.total_rosters}`);
            console.log(`✅ League Type: ${league.league_type}`);
        } else {
            console.log('❌ League endpoint failed');
            return false;
        }
        
        // 2. Test Users Endpoint
        console.log('\n📡 2. TESTING USERS ENDPOINT');
        console.log('-'.repeat(50));
        const usersResponse = await fetch(`https://api.sleeper.app/v1/league/${PROD_2025_LEAGUE_ID}/users`);
        console.log(`Status: ${usersResponse.status}`);
        
        if (usersResponse.ok) {
            const users = await usersResponse.json();
            console.log(`✅ Total Users: ${users.length}`);
            console.log('\n👥 User List:');
            users.forEach((user, index) => {
                console.log(`   ${index + 1}. ${user.display_name || user.username} (@${user.username})`);
            });
        } else {
            console.log('❌ Users endpoint failed');
            return false;
        }
        
        // 3. Test Rosters Endpoint
        console.log('\n📡 3. TESTING ROSTERS ENDPOINT');
        console.log('-'.repeat(50));
        const rostersResponse = await fetch(`https://api.sleeper.app/v1/league/${PROD_2025_LEAGUE_ID}/rosters`);
        console.log(`Status: ${rostersResponse.status}`);
        
        if (rostersResponse.ok) {
            const rosters = await rostersResponse.json();
            console.log(`✅ Total Rosters: ${rosters.length}`);
            console.log('\n🏆 Roster Overview:');
            rosters.forEach(roster => {
                console.log(`   Roster ${roster.roster_id}: Owner ${roster.owner_id} (${roster.wins}-${roster.losses})`);
            });
        } else {
            console.log('❌ Rosters endpoint failed');
            return false;
        }
        
        // 4. Test Recent Transactions
        console.log('\n📡 4. TESTING TRANSACTIONS ENDPOINT');
        console.log('-'.repeat(50));
        const transactionsResponse = await fetch(`https://api.sleeper.app/v1/league/${PROD_2025_LEAGUE_ID}/transactions/1`);
        console.log(`Status: ${transactionsResponse.status}`);
        
        if (transactionsResponse.ok) {
            const transactions = await transactionsResponse.json();
            console.log(`✅ Week 1 Transactions: ${transactions.length}`);
            
            // Sample a few transactions
            const sampleTransactions = transactions.slice(0, 3);
            console.log('\n📋 Sample Transactions:');
            sampleTransactions.forEach((txn, index) => {
                console.log(`   ${index + 1}. Type: ${txn.type}, Roster: ${txn.roster_ids?.[0]}, Date: ${new Date(txn.created).toLocaleDateString()}`);
            });
        } else {
            console.log('❌ Transactions endpoint failed');
            return false;
        }
        
        // 5. Test Week 1 Matchups
        console.log('\n📡 5. TESTING MATCHUPS ENDPOINT');
        console.log('-'.repeat(50));
        const matchupsResponse = await fetch(`https://api.sleeper.app/v1/league/${PROD_2025_LEAGUE_ID}/matchups/1`);
        console.log(`Status: ${matchupsResponse.status}`);
        
        if (matchupsResponse.ok) {
            const matchups = await matchupsResponse.json();
            console.log(`✅ Week 1 Matchups: ${matchups.length}`);
            console.log('\n🏆 Sample Scores:');
            matchups.slice(0, 4).forEach((matchup, index) => {
                console.log(`   Roster ${matchup.roster_id}: ${matchup.points} points`);
            });
        } else {
            console.log('❌ Matchups endpoint failed');
            return false;
        }
        
        console.log('\n🎉 SUCCESS: 2025 PRODUCTION LEAGUE IS FULLY ACCESSIBLE!');
        console.log('✅ All API endpoints working correctly');
        console.log('✅ League is active and has data');
        console.log('✅ Ready to proceed with production user population');
        return true;
        
    } catch (error) {
        console.log('❌ API Test Error:', error.message);
        return false;
    }
}

verifyProd2025LeagueAccess();