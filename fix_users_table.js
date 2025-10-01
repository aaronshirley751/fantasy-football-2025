// Fix missing users data for Discord notifications
const supabaseUrl = 'https://jfeuobfjgqownybluvje.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmZXVvYmZqZ3Fvd255Ymx1dmplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTU1MjU4NSwiZXhwIjoyMDcxMTI4NTg1fQ.TYZBL4UNLEJN6ovM6HQS5wxm2zkbZHBYtmQYALHDkqQ';
const SLEEPER_LEAGUE_ID = 'd06f0672-2848-4b5d-86f5-9ab559605b4f';
const DATABASE_LEAGUE_UUID = 'a7d65b53-2ec5-4b38-94ee-7fcb97160989';

async function populateUsersTable() {
    console.log('👥 FIXING USERS TABLE FOR DISCORD NOTIFICATIONS');
    console.log('=' .repeat(60));
    
    try {
        // Get users from Sleeper API
        console.log('📡 Fetching users from Sleeper API...');
        const usersResponse = await fetch(`https://api.sleeper.app/v1/league/${SLEEPER_LEAGUE_ID}/users`);
        const users = await usersResponse.json();
        
        // Get rosters to map user_id to roster_id
        console.log('📡 Fetching rosters from Sleeper API...');
        const rostersResponse = await fetch(`https://api.sleeper.app/v1/league/${SLEEPER_LEAGUE_ID}/rosters`);
        const rosters = await rostersResponse.json();
        
        // Create user mapping
        const userMappings = [];
        rosters.forEach(roster => {
            const user = users.find(u => u.user_id === roster.owner_id);
            if (user) {
                userMappings.push({
                    league_id: DATABASE_LEAGUE_UUID,
                    roster_id: roster.roster_id,
                    sleeper_user_id: user.user_id,
                    sleeper_username: user.username || user.display_name,
                    display_name: user.display_name || user.username
                });
            }
        });
        
        console.log(`✅ Found ${userMappings.length} user mappings`);
        userMappings.forEach(mapping => {
            console.log(`   Roster ${mapping.roster_id}: ${mapping.display_name} (@${mapping.sleeper_username})`);
        });
        
        // Insert into database
        console.log('\n💾 Inserting users into database...');
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
        
        if (insertResponse.ok) {
            console.log('✅ Users successfully inserted!');
            
            // Verify insertion
            const verifyResponse = await fetch(`${supabaseUrl}/rest/v1/users?select=*&league_id=eq.${DATABASE_LEAGUE_UUID}`, {
                headers: {
                    'apikey': supabaseServiceKey,
                    'Authorization': `Bearer ${supabaseServiceKey}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (verifyResponse.ok) {
                const insertedUsers = await verifyResponse.json();
                console.log(`✅ Verification: ${insertedUsers.length} users in database`);
                console.log('\n🎉 USERS TABLE FIXED - Discord notifications will now show proper names!');
            }
            
        } else {
            const error = await insertResponse.text();
            console.log('❌ Failed to insert users:', error);
        }
        
    } catch (error) {
        console.log('❌ Error populating users table:', error.message);
    }
}

populateUsersTable();