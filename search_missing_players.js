// SEARCH FOR MISSING PLAYERS
// Look for the specific players mentioned in chat but missing from API

async function searchForMissingPlayers() {
  const fetch = (await import('node-fetch')).default;
  
  console.log('🔍 SEARCHING FOR MISSING PLAYERS');
  console.log('🎯 Looking for Joe Mixon, Austin Ekeler, Rachaad White, Ray Davis, Ollie Gordon, Isaiah Likely');
  console.log('=' .repeat(80));
  console.log('');
  
  const SLEEPER_LEAGUE_ID = '1249067741470539776';
  const WATTS52_ROSTER_ID = 6;
  
  // Missing players from chat
  const missingPlayers = [
    'Joe Mixon',
    'Austin Ekeler', 
    'Rachaad White',
    'Ray Davis',
    'Ollie Gordon',
    'Isaiah Likely'
  ];
  
  console.log('🔍 TARGET PLAYERS:');
  console.log('-' .repeat(50));
  missingPlayers.forEach((player, index) => {
    console.log(`${index + 1}. ${player}`);
  });
  console.log('');
  
  try {
    // First, get all NFL players to map IDs to names
    console.log('📋 GETTING NFL PLAYER DATABASE:');
    console.log('-' .repeat(50));
    
    const playersRes = await fetch('https://api.sleeper.app/v1/players/nfl');
    if (!playersRes.ok) {
      console.log('❌ Could not fetch NFL players database');
      return;
    }
    
    const allPlayers = await playersRes.json();
    console.log(`Loaded ${Object.keys(allPlayers).length} NFL players`);
    
    // Find the target players
    const targetPlayerIds = {};
    Object.entries(allPlayers).forEach(([playerId, playerData]) => {
      const fullName = `${playerData.first_name} ${playerData.last_name}`;
      if (missingPlayers.includes(fullName)) {
        targetPlayerIds[playerId] = fullName;
        console.log(`✅ Found ${fullName} (ID: ${playerId})`);
      }
    });
    
    console.log(`\nMapped ${Object.keys(targetPlayerIds).length} target players`);
    console.log('');
    
    // Now search ALL weeks for these specific players
    console.log('🔍 SEARCHING ALL WEEKS FOR THESE PLAYERS:');
    console.log('-' .repeat(50));
    
    const foundTransactions = [];
    
    for (let week = 0; week <= 20; week++) {
      try {
        const transRes = await fetch(`https://api.sleeper.app/v1/league/${SLEEPER_LEAGUE_ID}/transactions/${week}`);
        if (transRes.ok) {
          const weekTransactions = await transRes.json();
          
          weekTransactions.forEach(t => {
            // Check if Watts52 is involved
            const involvesWatts52 = 
              (t.roster_ids && t.roster_ids.includes(WATTS52_ROSTER_ID)) ||
              (t.consenter_ids && t.consenter_ids.includes(WATTS52_ROSTER_ID));
            
            if (involvesWatts52) {
              // Check if any target players are in adds/drops
              const addedPlayers = t.adds ? Object.keys(t.adds) : [];
              const droppedPlayers = t.drops ? Object.keys(t.drops) : [];
              const allPlayersInTrans = [...addedPlayers, ...droppedPlayers];
              
              const targetPlayersInTrans = allPlayersInTrans.filter(pid => targetPlayerIds[pid]);
              
              if (targetPlayersInTrans.length > 0) {
                const playerNames = targetPlayersInTrans.map(pid => targetPlayerIds[pid]);
                console.log(`Week ${week}: Found ${playerNames.join(', ')}`);
                console.log(`  Transaction ID: ${t.transaction_id}`);
                console.log(`  Date: ${new Date(t.created).toLocaleDateString()}`);
                console.log(`  Type: ${t.type}`);
                console.log(`  Status: ${t.status}`);
                
                foundTransactions.push({
                  week,
                  transaction: t,
                  targetPlayers: playerNames
                });
              }
            }
          });
        }
      } catch (e) {
        // Silent continue
      }
    }
    
    console.log('');
    console.log('🎯 SEARCH RESULTS:');
    console.log('-' .repeat(50));
    
    if (foundTransactions.length > 0) {
      console.log(`✅ FOUND ${foundTransactions.length} transactions with target players:`);
      foundTransactions.forEach((result, index) => {
        console.log(`${index + 1}. ${result.targetPlayers.join(', ')}`);
        console.log(`   Week: ${result.week}`);
        console.log(`   Date: ${new Date(result.transaction.created).toLocaleDateString()}`);
        console.log(`   ID: ${result.transaction.transaction_id}`);
        console.log('');
      });
    } else {
      console.log('❌ NO TRANSACTIONS FOUND with target players');
      console.log('');
      console.log('This confirms that the API is missing these transactions:');
      missingPlayers.forEach(player => {
        console.log(`  - ${player}`);
      });
    }
    
    console.log('');
    console.log('🔍 ADDITIONAL CHECKS:');
    console.log('-' .repeat(50));
    
    // Check if we missed any player name variations
    console.log('Checking for partial name matches:');
    const partialMatches = {};
    Object.entries(allPlayers).forEach(([playerId, playerData]) => {
      const lastName = playerData.last_name?.toLowerCase() || '';
      missingPlayers.forEach(targetPlayer => {
        const targetLastName = targetPlayer.split(' ').pop().toLowerCase();
        if (lastName === targetLastName && !targetPlayerIds[playerId]) {
          const fullName = `${playerData.first_name} ${playerData.last_name}`;
          partialMatches[playerId] = fullName;
        }
      });
    });
    
    if (Object.keys(partialMatches).length > 0) {
      console.log('Found potential name variations:');
      Object.entries(partialMatches).forEach(([playerId, name]) => {
        console.log(`  ${name} (ID: ${playerId})`);
      });
    } else {
      console.log('No additional name variations found');
    }
    
  } catch (error) {
    console.error('❌ Error searching for missing players:', error);
  }
}

searchForMissingPlayers();