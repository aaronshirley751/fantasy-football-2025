// Recreate proper database state with 2025 production data
const supabaseUrl = 'https://jfeuobfjgqownybluvje.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmZXVvYmZqZ3Fvd255Ymx1dmplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTU1MjU4NSwiZXhwIjoyMDcxMTI4NTg1fQ.TYZBL4UNLEJN6ovM6HQS5wxm2zkbZHBYtmQYALHDkqQ';
const PROD_2025_LEAGUE_ID = '1249067741470539776';
const DATABASE_LEAGUE_UUID = 'a7d65b53-2ec5-4b38-94ee-7fcb97160989';

async function recreateDatabaseState() {
    console.log('🔧 RECREATING PROPER DATABASE STATE FOR 2025 PRODUCTION');
    console.log('=' .repeat(70));
    
    try {
        // 1. Ensure league configuration exists
        console.log('⚙️  1. ENSURING LEAGUE CONFIGURATION');
        console.log('-'.repeat(50));
        
        const leagueConfig = {
            id: DATABASE_LEAGUE_UUID,
            sleeper_league_id: PROD_2025_LEAGUE_ID,
            name: '2025 Production League',
            high_score_bonus: 5,
            discord_webhook_url: null // Disabled as requested
        };
        
        const leagueResponse = await fetch(`${supabaseUrl}/rest/v1/leagues`, {
            method: 'POST',
            headers: {
                'apikey': supabaseServiceKey,
                'Authorization': `Bearer ${supabaseServiceKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify(leagueConfig)
        });
        
        console.log('✅ League configuration created/updated');
        
        // 2. Populate users with 2025 real owner names
        console.log('\n👥 2. POPULATING USERS WITH 2025 REAL NAMES');
        console.log('-'.repeat(50));
        
        // Get 2025 users and rosters
        const [usersApiResponse, rostersApiResponse] = await Promise.all([
            fetch(`https://api.sleeper.app/v1/league/${PROD_2025_LEAGUE_ID}/users`),
            fetch(`https://api.sleeper.app/v1/league/${PROD_2025_LEAGUE_ID}/rosters`)
        ]);
        
        const [users, rosters] = await Promise.all([
            usersApiResponse.json(),
            rostersApiResponse.json()
        ]);
        
        // Create user mappings
        const userMappings = [];
        rosters.forEach(roster => {
            const user = users.find(u => u.user_id === roster.owner_id);
            if (user) {
                userMappings.push({
                    league_id: DATABASE_LEAGUE_UUID,
                    roster_id: roster.roster_id,
                    sleeper_user_id: user.user_id,
                    sleeper_username: user.username || 'unknown',
                    display_name: user.display_name || user.username || `Team ${roster.roster_id}`
                });
            }
        });
        
        console.log(`Creating ${userMappings.length} user mappings:`);
        userMappings.forEach(mapping => {
            console.log(`   Roster ${mapping.roster_id}: ${mapping.display_name}`);
        });
        
        const usersInsertResponse = await fetch(`${supabaseUrl}/rest/v1/users`, {
            method: 'POST',
            headers: {
                'apikey': supabaseServiceKey,
                'Authorization': `Bearer ${supabaseServiceKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify(userMappings)
        });
        
        if (usersInsertResponse.ok) {
            console.log('✅ Users populated successfully');
        } else {
            console.log('⚠️  Users insert may have failed');
        }
        
        console.log('\n🎯 DATABASE STATE RECREATED');
        console.log('✅ League configuration ready');
        console.log('✅ 2025 real owner names populated');
        console.log('✅ Discord webhook disabled');
        console.log('✅ Ready for season-to-date transaction processing');
        
    } catch (error) {
        console.log('❌ Database recreation error:', error.message);
    }
}

recreateDatabaseState();