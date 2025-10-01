// Create user mappings from existing database data
const supabaseUrl = 'https://jfeuobfjgqownybluvje.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmZXVvYmZqZ3Fvd255Ymx1dmplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTU1MjU4NSwiZXhwIjoyMDcxMTI4NTg1fQ.TYZBL4UNLEJN6ovM6HQS5wxm2zkbZHBYtmQYALHDkqQ';
const DATABASE_LEAGUE_UUID = 'a7d65b53-2ec5-4b38-94ee-7fcb97160989';

async function createUsersFromDatabase() {
    console.log('👥 CREATING USERS FROM EXISTING DATABASE DATA');
    console.log('=' .repeat(60));
    
    try {
        // Get unique roster IDs from transactions
        console.log('📋 Getting roster IDs from transactions...');
        const txnResponse = await fetch(`${supabaseUrl}/rest/v1/transactions?select=roster_id&league_id=eq.${DATABASE_LEAGUE_UUID}`, {
            headers: {
                'apikey': supabaseServiceKey,
                'Authorization': `Bearer ${supabaseServiceKey}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!txnResponse.ok) {
            console.log('❌ Failed to get transactions');
            return;
        }
        
        const transactions = await txnResponse.json();
        const uniqueRosterIds = [...new Set(transactions.map(t => t.roster_id))];
        console.log('✅ Found roster IDs:', uniqueRosterIds.sort((a, b) => a - b));
        
        // Create user mappings with placeholder names
        const userMappings = uniqueRosterIds.map(rosterId => ({
            league_id: DATABASE_LEAGUE_UUID,
            roster_id: rosterId,
            sleeper_user_id: `user_${rosterId}`, // Placeholder
            sleeper_username: `team${rosterId}`,
            display_name: `Team ${rosterId}`
        }));
        
        console.log('\n👤 Creating user mappings:');
        userMappings.forEach(mapping => {
            console.log(`   Roster ${mapping.roster_id}: ${mapping.display_name}`);
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
                console.log('\n🎉 USERS TABLE POPULATED - Discord notifications will work!');
                console.log('💡 Note: Using placeholder names (Team 1, Team 2, etc.)');
                console.log('   Real names can be updated when 2025 league is active');
            }
            
        } else {
            const error = await insertResponse.text();
            console.log('❌ Failed to insert users:', error);
        }
        
    } catch (error) {
        console.log('❌ Error creating users:', error.message);
    }
}

createUsersFromDatabase();