// Check the league configuration in the database
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://jfeuobfjgqownybluvje.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmZXVvYmZqZ3Fvd255Ymx1dmplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1NTI1ODUsImV4cCI6MjA3MTEyODU4NX0.7qu0h_cKNpdW1ZENZ3652LE75MC6VQp9Ahu5SSDypuY'
);

async function checkLeagueConfiguration() {
  console.log('🏆 CHECKING LEAGUE CONFIGURATION...\n');
  
  // Check leagues table
  const { data: leagues, error: leagueError } = await supabase
    .from('leagues')
    .select('*')
    .limit(10);
    
  if (leagueError) {
    console.log('❌ Error fetching leagues:', leagueError);
  } else {
    console.log('📊 LEAGUES TABLE:');
    console.log('================');
    if (leagues.length === 0) {
      console.log('🔍 No leagues found');
    } else {
      leagues.forEach(league => {
        console.log(`Database ID: ${league.id}`);
        console.log(`Sleeper League ID: ${league.sleeper_league_id}`);
        console.log(`Name: ${league.name}`);
        console.log(`Status: ${league.status || 'unknown'}`);
        console.log(`Fields:`, Object.keys(league));
        console.log('');
      });
    }
  }
  
  // Check users table
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('*')
    .limit(10);
    
  if (usersError) {
    console.log('❌ Error fetching users:', usersError);
  } else {
    console.log('👥 USERS TABLE:');
    console.log('==============');
    if (users.length === 0) {
      console.log('🔍 No users found');  
    } else {
      users.forEach(user => {
        console.log(`Database ID: ${user.id}`);
        console.log(`League ID: ${user.league_id}`);
        console.log(`Roster ID: ${user.roster_id}`);
        console.log(`Display Name: ${user.display_name}`);
        console.log('');
      });
    }
  }
}

checkLeagueConfiguration();