// Populate users table with REAL 2025 production league data
const supabaseUrl = 'https://jfeuobfjgqownybluvje.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmZXVvYmZqZ3Fvd255Ymx1dmplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTU1MjU4NSwiZXhwIjoyMDcxMTI4NTg1fQ.TYZBL4UNLEJN6ovM6HQS5wxm2zkbZHBYtmQYALHDkqQ';
const PROD_2025_LEAGUE_ID = '1249067741470539776';
const DATABASE_LEAGUE_UUID = 'a7d65b53-2ec5-4b38-94ee-7fcb97160989';

async function populate2025UsersTable() {
    console.log('👥 POPULATING USERS TABLE WITH 2025 PRODUCTION DATA');
    console.log('=' .repeat(70));
    console.log(`Production League: ${PROD_2025_LEAGUE_ID}`);
    console.log(`Database League: ${DATABASE_LEAGUE_UUID}`);
    console.log();
    
    try {
        // 1. Clear existing users table first
        console.log('🧹 1. CLEARING EXISTING USERS DATA');
        console.log('-'.repeat(50));
        
        const deleteResponse = await fetch(`${supabaseUrl}/rest/v1/users?league_id=eq.${DATABASE_LEAGUE_UUID}`, {
            method: 'DELETE',
            headers: {
                'apikey': supabaseServiceKey,
                'Authorization': `Bearer ${supabaseServiceKey}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (deleteResponse.ok) {
            console.log('✅ Existing users cleared');
        } else {
            console.log('⚠️ Delete may have failed or no users existed');
        }
        
        // 2. Get users from 2025 production league
        console.log('\n📡 2. FETCHING 2025 PRODUCTION USERS');
        console.log('-'.repeat(50));
        
        const usersResponse = await fetch(`https://api.sleeper.app/v1/league/${PROD_2025_LEAGUE_ID}/users`);
        if (!usersResponse.ok) {
            console.log('❌ Failed to fetch users from Sleeper API');
            return;
        }
        const users = await usersResponse.json();
        console.log(`✅ Fetched ${users.length} users from 2025 league`);
        
        // 3. Get rosters to map user_id to roster_id
        console.log('\n📡 3. FETCHING 2025 PRODUCTION ROSTERS');
        console.log('-'.repeat(50));
        
        const rostersResponse = await fetch(`https://api.sleeper.app/v1/league/${PROD_2025_LEAGUE_ID}/rosters`);
        if (!rostersResponse.ok) {
            console.log('❌ Failed to fetch rosters from Sleeper API');
            return;
        }
        const rosters = await rostersResponse.json();
        console.log(`✅ Fetched ${rosters.length} rosters from 2025 league`);
        
        // 4. Create proper user mappings
        console.log('\n🔗 4. CREATING USER-ROSTER MAPPINGS');
        console.log('-'.repeat(50));
        
        const userMappings = [];
        rosters.forEach(roster => {
            const user = users.find(u => u.user_id === roster.owner_id);
            if (user) {
                const mapping = {
                    league_id: DATABASE_LEAGUE_UUID,
                    roster_id: roster.roster_id,
                    sleeper_user_id: user.user_id,
                    sleeper_username: user.username || 'unknown',
                    display_name: user.display_name || user.username || `Team ${roster.roster_id}`
                };
                userMappings.push(mapping);
                console.log(`   Roster ${roster.roster_id}: ${mapping.display_name} (@${mapping.sleeper_username})`);
            } else {
                console.log(`   ⚠️  Roster ${roster.roster_id}: No user found for owner_id ${roster.owner_id}`);
            }
        });
        
        console.log(`\n✅ Created ${userMappings.length} user mappings`);
        
        // 5. Insert into database
        console.log('\n💾 5. INSERTING USERS INTO DATABASE');
        console.log('-'.repeat(50));
        
        const insertResponse = await fetch(`${supabaseUrl}/rest/v1/users`, {
            method: 'POST',
            headers: {
                'apikey': supabaseServiceKey,
                'Authorization': `Bearer ${supabaseServiceKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify(userMappings)
        });
        
        if (!insertResponse.ok) {
            const error = await insertResponse.text();
            console.log('❌ Failed to insert users:', error);
            return;
        }
        
        console.log('✅ Users successfully inserted into database!');
        
        // 6. Verify insertion
        console.log('\n✅ 6. VERIFYING INSERTION');
        console.log('-'.repeat(50));
        
        const verifyResponse = await fetch(`${supabaseUrl}/rest/v1/users?select=*&league_id=eq.${DATABASE_LEAGUE_UUID}&order=roster_id.asc`, {
            headers: {
                'apikey': supabaseServiceKey,
                'Authorization': `Bearer ${supabaseServiceKey}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (verifyResponse.ok) {
            const insertedUsers = await verifyResponse.json();
            console.log(`✅ Verification: ${insertedUsers.length} users in database`);
            console.log('\n👥 Final User List:');
            insertedUsers.forEach(user => {
                console.log(`   Roster ${user.roster_id}: ${user.display_name} (@${user.sleeper_username})`);
            });
            
            console.log('\n🎉 SUCCESS: USERS TABLE POPULATED WITH 2025 PRODUCTION DATA!');
            console.log('✅ Discord notifications will now show proper owner names');
            console.log('✅ Ready for production function deployment');
            
        } else {
            console.log('❌ Failed to verify insertion');
        }
        
    } catch (error) {
        console.log('❌ Error populating users table:', error.message);
    }
}

populate2025UsersTable();