// Debug roster API issue
const SLEEPER_LEAGUE_ID = 'd06f0672-2848-4b5d-86f5-9ab559605b4f';

async function debugRosterAPI() {
    console.log('🔍 DEBUG: Checking Sleeper API responses');
    
    try {
        // Test users endpoint
        console.log('📡 Testing users endpoint...');
        const usersResponse = await fetch(`https://api.sleeper.app/v1/league/${SLEEPER_LEAGUE_ID}/users`);
        console.log('Users response status:', usersResponse.status);
        const users = await usersResponse.json();
        console.log('Users data type:', typeof users);
        console.log('Users length:', users ? users.length : 'null/undefined');
        if (users && users.length > 0) {
            console.log('Sample user:', users[0]);
        }
        
        // Test rosters endpoint
        console.log('\n📡 Testing rosters endpoint...');
        const rostersResponse = await fetch(`https://api.sleeper.app/v1/league/${SLEEPER_LEAGUE_ID}/rosters`);
        console.log('Rosters response status:', rostersResponse.status);
        const rosters = await rostersResponse.json();
        console.log('Rosters data type:', typeof rosters);
        console.log('Rosters length:', rosters ? rosters.length : 'null/undefined');
        if (rosters && rosters.length > 0) {
            console.log('Sample roster:', rosters[0]);
        }
        
    } catch (error) {
        console.log('❌ API Debug error:', error.message);
    }
}

debugRosterAPI();