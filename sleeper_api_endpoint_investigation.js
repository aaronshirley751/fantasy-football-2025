// SLEEPER API ENDPOINT INVESTIGATION
// Testing different endpoints and pagination strategies to find missing transactions

async function sleeperApiEndpointInvestigation() {
  const fetch = (await import('node-fetch')).default;
  
  console.log('🔍 SLEEPER API ENDPOINT INVESTIGATION');
  console.log('🎯 Sleeper chat shows 20 transactions, API returns 15 - finding the missing 5');
  console.log('=' .repeat(80));
  console.log('');
  
  const SLEEPER_LEAGUE_ID = '1249067741470539776';
  const WATTS52_ROSTER_ID = 6;
  
  try {
    console.log('🔍 TESTING DIFFERENT API STRATEGIES');
    console.log('-' .repeat(50));
    
    // Strategy 1: Week-by-week with extended range
    console.log('📋 STRATEGY 1: Extended week range (0-20)');
    const extendedWeekTransactions = [];
    
    for (let week = 0; week <= 20; week++) {
      try {
        const url = `https://api.sleeper.app/v1/league/${SLEEPER_LEAGUE_ID}/transactions/${week}`;
        const transRes = await fetch(url);
        if (transRes.ok) {
          const weekTransactions = await transRes.json();
          const watts52WeekTrans = weekTransactions.filter(t => 
            t.roster_ids && t.roster_ids.includes(WATTS52_ROSTER_ID)
          );
          if (watts52WeekTrans.length > 0) {
            console.log(`  Week ${week}: ${watts52WeekTrans.length} transactions`);
            extendedWeekTransactions.push(...watts52WeekTrans);
          }
        }
      } catch (e) {
        // Silent continue
      }
    }
    console.log(`Strategy 1 Total: ${extendedWeekTransactions.length} transactions\n`);
    
    // Strategy 2: Try different base endpoints
    console.log('📋 STRATEGY 2: Alternative endpoints');
    
    const endpoints = [
      `https://api.sleeper.app/v1/league/${SLEEPER_LEAGUE_ID}/transactions`,
      `https://api.sleeper.app/v1/league/${SLEEPER_LEAGUE_ID}/transactions/all`,
      `https://api.sleeper.app/v1/user/862853736618364928/leagues/2025/nfl/transactions`,
      `https://api.sleeper.app/v1/league/${SLEEPER_LEAGUE_ID}/rosters/${WATTS52_ROSTER_ID}/transactions`
    ];
    
    for (const endpoint of endpoints) {
      try {
        console.log(`Testing: ${endpoint}`);
        const response = await fetch(endpoint);
        if (response.ok) {
          const data = await response.json();
          console.log(`  ✅ Success: ${Array.isArray(data) ? data.length : 'Object'} results`);
        } else {
          console.log(`  ❌ Failed: ${response.status} ${response.statusText}`);
        }
      } catch (e) {
        console.log(`  ❌ Error: ${e.message}`);
      }
    }
    console.log('');
    
    // Strategy 3: Check different seasons
    console.log('📋 STRATEGY 3: Different season/league checks');
    
    // Get user's leagues to see if transactions might be in different league
    try {
      const userLeaguesUrl = `https://api.sleeper.app/v1/user/862853736618364928/leagues/nfl/2025`;
      const userLeaguesRes = await fetch(userLeaguesUrl);
      if (userLeaguesRes.ok) {
        const userLeagues = await userLeaguesRes.json();
        console.log(`Watts52 is in ${userLeagues.length} leagues in 2025:`);
        userLeagues.forEach((league, index) => {
          console.log(`  ${index + 1}. ${league.name} (${league.league_id})`);
          if (league.league_id === SLEEPER_LEAGUE_ID) {
            console.log(`      ✅ This is our target league`);
          }
        });
      }
    } catch (e) {
      console.log('Could not fetch user leagues');
    }
    console.log('');
    
    // Strategy 4: Pagination investigation
    console.log('📋 STRATEGY 4: Pagination investigation');
    
    // Check if any endpoints support limit/offset
    const paginationTests = [
      `https://api.sleeper.app/v1/league/${SLEEPER_LEAGUE_ID}/transactions/1?limit=100`,
      `https://api.sleeper.app/v1/league/${SLEEPER_LEAGUE_ID}/transactions/1?offset=0&limit=50`,
      `https://api.sleeper.app/v1/league/${SLEEPER_LEAGUE_ID}/transactions/1?page=1`,
      `https://api.sleeper.app/v1/league/${SLEEPER_LEAGUE_ID}/transactions/1?start=0&count=100`
    ];
    
    for (const url of paginationTests) {
      try {
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          const watts52Trans = data.filter(t => 
            t.roster_ids && t.roster_ids.includes(WATTS52_ROSTER_ID)
          );
          console.log(`✅ ${url}: ${watts52Trans.length} Watts52 transactions`);
        } else {
          console.log(`❌ ${url}: ${response.status}`);
        }
      } catch (e) {
        console.log(`❌ ${url}: Error`);
      }
    }
    console.log('');
    
    // Strategy 5: Recent transactions endpoint
    console.log('📋 STRATEGY 5: Recent/trending transactions');
    
    const recentEndpoints = [
      `https://api.sleeper.app/v1/league/${SLEEPER_LEAGUE_ID}/transactions/recent`,
      `https://api.sleeper.app/v1/league/${SLEEPER_LEAGUE_ID}/transactions/latest`,
      `https://api.sleeper.app/v1/league/${SLEEPER_LEAGUE_ID}/activity`
    ];
    
    for (const endpoint of recentEndpoints) {
      try {
        const response = await fetch(endpoint);
        if (response.ok) {
          const data = await response.json();
          console.log(`✅ ${endpoint}: Found data`);
        } else {
          console.log(`❌ ${endpoint}: ${response.status}`);
        }
      } catch (e) {
        console.log(`❌ ${endpoint}: Error`);
      }
    }
    
    console.log('');
    console.log('🎯 SUMMARY:');
    console.log('=' .repeat(50));
    console.log(`Current best result: ${extendedWeekTransactions.length} transactions`);
    console.log('Missing transactions: 5 (20 in chat - 15 in API)');
    console.log('');
    console.log('🚨 IMPLICATIONS:');
    console.log('- Sleeper API has incomplete transaction data');
    console.log('- Fee calculations may be systematically undercharging');
    console.log('- All roster audits needed to assess impact');
    console.log('- May need alternative data collection strategy');
    
  } catch (error) {
    console.error('❌ Error in endpoint investigation:', error);
  }
}

sleeperApiEndpointInvestigation();