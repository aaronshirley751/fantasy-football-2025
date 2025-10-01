// Check what's in the leagues table and get the proper UUID
const supabaseUrl = 'https://jfeuobfjgqownybluvje.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmZXVvYmZqZ3Fvd255Ymx1dmplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTU1MjU4NSwiZXhwIjoyMDcxMTI4NTg1fQ.TYZBL4UNLEJN6ovM6HQS5wxm2zkbZHBYtmQYALHDkqQ';

async function checkLeagueData() {
    console.log('🔍 CHECKING LEAGUE DATA');
    console.log('=' .repeat(40));
    
    try {
        const response = await fetch(`${supabaseUrl}/rest/v1/leagues?select=*`, {
            headers: {
                'apikey': supabaseServiceKey,
                'Authorization': `Bearer ${supabaseServiceKey}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const leagues = await response.json();
            console.log('✅ Leagues found:', leagues.length);
            
            leagues.forEach((league, index) => {
                console.log(`\n📋 League ${index + 1}:`);
                console.log(`   UUID: ${league.id}`);
                console.log(`   Sleeper ID: ${league.sleeper_league_id}`);
                console.log(`   Name: ${league.league_name}`);
                console.log(`   Season: ${league.season_year}`);
            });
            
            // Find our league
            const ourLeague = leagues.find(l => l.sleeper_league_id === '1249067741470539776');
            if (ourLeague) {
                console.log('\n🎯 FOUND OUR LEAGUE:');
                console.log(`   Database UUID: ${ourLeague.id}`);
                console.log(`   Sleeper ID: ${ourLeague.sleeper_league_id}`);
                console.log('   ✅ Use this UUID for league_id in transactions');
            } else {
                console.log('\n❌ Our league (1249067741470539776) not found in database');
                console.log('   Need to insert league record first');
            }
            
        } else {
            console.log(`❌ Failed to get leagues: ${response.status}`);
            const errorText = await response.text();
            console.log('Error:', errorText);
        }
    } catch (error) {
        console.log('❌ Error checking leagues:', error.message);
    }
    
    // Also check existing transactions to see the format
    console.log('\n🔍 CHECKING EXISTING TRANSACTIONS');
    console.log('=' .repeat(40));
    
    try {
        const response = await fetch(`${supabaseUrl}/rest/v1/transactions?select=*&limit=5`, {
            headers: {
                'apikey': supabaseServiceKey,
                'Authorization': `Bearer ${supabaseServiceKey}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const transactions = await response.json();
            console.log('✅ Existing transactions:', transactions.length);
            
            transactions.forEach((txn, index) => {
                console.log(`\n📋 Transaction ${index + 1}:`);
                console.log(`   ID: ${txn.id}`);
                console.log(`   League ID: ${txn.league_id}`);
                console.log(`   Sleeper Transaction ID: ${txn.sleeper_transaction_id}`);
                console.log(`   Roster ID: ${txn.roster_id}`);
                console.log(`   Type: ${txn.type}`);
                console.log(`   Week: ${txn.week_number}`);
                console.log(`   Fee: $${txn.fee_amount}`);
                console.log(`   Processed: ${txn.processed}`);
            });
            
        } else {
            console.log(`❌ Failed to get transactions: ${response.status}`);
        }
    } catch (error) {
        console.log('❌ Error checking transactions:', error.message);
    }
}

checkLeagueData();