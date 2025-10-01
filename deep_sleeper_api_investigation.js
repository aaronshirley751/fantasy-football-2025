// DEEP SLEEPER API INVESTIGATION
// Investigating why we only see 15 transactions when Discord shows 20

async function deepSleeperAPIInvestigation() {
  const fetch = (await import('node-fetch')).default;
  
  console.log('🔍 DEEP SLEEPER API INVESTIGATION');
  console.log('🎯 Discord shows 20 Watts52 transactions, API returned 15');
  console.log('=' .repeat(80));
  console.log('');
  
  const SLEEPER_LEAGUE_ID = '1249067741470539776';
  
  try {
    // 1. Get roster mapping first
    console.log('🔍 STEP 1: GET ROSTER MAPPING');
    console.log('-' .repeat(50));
    
    const [sleepUsersRes, sleepRostersRes] = await Promise.all([
      fetch(`https://api.sleeper.app/v1/league/${SLEEPER_LEAGUE_ID}/users`),
      fetch(`https://api.sleeper.app/v1/league/${SLEEPER_LEAGUE_ID}/rosters`)
    ]);
    
    const sleepUsers = await sleepUsersRes.json();
    const sleepRosters = await sleepRostersRes.json();
    
    const watts52User = sleepUsers.find(u => u.display_name === 'Watts52');
    const watts52Roster = sleepRosters.find(r => r.owner_id === watts52User.user_id);
    
    console.log(`Watts52 User ID: ${watts52User.user_id}`);
    console.log(`Watts52 Roster ID: ${watts52Roster.roster_id}`);
    console.log('');
    
    // 2. Try different API endpoints and strategies
    console.log('🔍 STEP 2: TESTING DIFFERENT API STRATEGIES');
    console.log('-' .repeat(50));
    
    // Strategy A: Week-by-week (what we did before)
    console.log('📋 STRATEGY A: Week-by-week pagination (previous method)');
    const weekByWeekTransactions = [];
    
    for (let week = 1; week <= 18; week++) {
      try {
        const transRes = await fetch(`https://api.sleeper.app/v1/league/${SLEEPER_LEAGUE_ID}/transactions/${week}`);
        if (transRes.ok) {
          const weekTransactions = await transRes.json();
          const watts52WeekTrans = weekTransactions.filter(t => 
            t.roster_ids && t.roster_ids.includes(watts52Roster.roster_id)
          );
          if (watts52WeekTrans.length > 0) {
            console.log(`Week ${week}: ${watts52WeekTrans.length} transactions`);
            weekByWeekTransactions.push(...watts52WeekTrans);
          }
        }
      } catch (e) {
        // Silent continue
      }
    }
    
    console.log(`Strategy A Total: ${weekByWeekTransactions.length} transactions`);
    console.log('');
    
    // Strategy B: Try without week parameter (if supported)
    console.log('📋 STRATEGY B: All transactions without week filter');
    try {
      const allTransRes = await fetch(`https://api.sleeper.app/v1/league/${SLEEPER_LEAGUE_ID}/transactions`);
      if (allTransRes.ok) {
        const allTransactions = await allTransRes.json();
        const watts52AllTrans = allTransactions.filter(t => 
          t.roster_ids && t.roster_ids.includes(watts52Roster.roster_id)
        );
        console.log(`Strategy B Total: ${watts52AllTrans.length} transactions`);
      } else {
        console.log('Strategy B: API endpoint not supported');
      }
    } catch (e) {
      console.log('Strategy B: Failed -', e.message);
    }
    console.log('');
    
    // 3. Analyze the 15 transactions we found in detail
    console.log('🔍 STEP 3: DETAILED ANALYSIS OF FOUND TRANSACTIONS');
    console.log('-' .repeat(50));
    
    // Sort by creation date
    weekByWeekTransactions.sort((a, b) => a.created - b.created);
    
    console.log('📋 ALL 15 TRANSACTIONS FOUND (chronological order):');
    weekByWeekTransactions.forEach((t, index) => {
      const date = new Date(t.created).toLocaleDateString();
      const time = new Date(t.created).toLocaleTimeString();
      console.log(`${String(index + 1).padStart(2, ' ')}. ${t.type.toUpperCase()} - ${date} ${time}`);
      console.log(`    ID: ${t.transaction_id}`);
      console.log(`    Week: ${t.week || 'Unknown'}`);
      
      // Show adds/drops if available
      if (t.adds) {
        const adds = Object.keys(t.adds).join(', ');
        console.log(`    Adds: ${adds}`);
      }
      if (t.drops) {
        const drops = Object.keys(t.drops).join(', ');
        console.log(`    Drops: ${drops}`);
      }
      console.log('');
    });
    
    // 4. Compare with Discord timeline
    console.log('🔍 STEP 4: MAPPING TO DISCORD TIMELINE');
    console.log('-' .repeat(50));
    
    const discordMoves = [
      { description: 'DEF - NE (6 days ago)', daysAgo: 6 },
      { description: 'DEF - ATL (6 days ago)', daysAgo: 6 },
      { description: 'Romeo Doubs WR - GB (12 days ago)', daysAgo: 12 },
      { description: 'Justin Fields QB - NYJ (13 days ago)', daysAgo: 13 },
      { description: 'Rashee Rice WR - KC (13 days ago)', daysAgo: 13 },
      { description: 'DEF - ATL, DEF - PIT (13 days ago)', daysAgo: 13 },
      { description: 'Austin Ekeler RB - WAS (14 days ago)', daysAgo: 14 },
      { description: 'Justin Fields QB - NYJ, Rashee Rice WR - KC (18 days ago)', daysAgo: 18 },
      { description: 'Rashee Rice WR - KC, Ollie Gordon RB - MIA (18 days ago)', daysAgo: 18 },
      { description: 'Ollie Gordon RB - MIA, Ray Davis RB - BUF (1 month ago)', daysAgo: 30 },
      { description: 'Joe Mixon RB - HOU (1 month ago)', daysAgo: 30 },
      { description: 'Austin Ekeler RB - WAS, Rachaad White RB - TB (1 month ago)', daysAgo: 30 },
      { description: 'Ray Davis RB - BUF (1 month ago)', daysAgo: 30 },
      { description: 'Rachaad White RB - TB (1 month ago)', daysAgo: 30 },
      { description: 'Isaiah Likely TE - BAL (1 month ago)', daysAgo: 30 }
    ];
    
    console.log(`Discord shows: ${discordMoves.length} transaction groups`);
    console.log('Note: Some Discord entries show multiple players, which could be single transactions');
    console.log('');
    
    // 5. Date range analysis
    console.log('🔍 STEP 5: DATE RANGE ANALYSIS');
    console.log('-' .repeat(50));
    
    const today = new Date();
    const oldestTransaction = new Date(Math.min(...weekByWeekTransactions.map(t => t.created)));
    const newestTransaction = new Date(Math.max(...weekByWeekTransactions.map(t => t.created)));
    
    console.log(`Today: ${today.toLocaleDateString()}`);
    console.log(`Oldest transaction: ${oldestTransaction.toLocaleDateString()} (${Math.floor((today - oldestTransaction) / (1000 * 60 * 60 * 24))} days ago)`);
    console.log(`Newest transaction: ${newestTransaction.toLocaleDateString()} (${Math.floor((today - newestTransaction) / (1000 * 60 * 60 * 24))} days ago)`);
    console.log('');
    
    // 6. Week coverage analysis
    console.log('🔍 STEP 6: WEEK COVERAGE ANALYSIS');
    console.log('-' .repeat(50));
    
    const weekCoverage = {};
    weekByWeekTransactions.forEach(t => {
      const week = t.week || 'Unknown';
      weekCoverage[week] = (weekCoverage[week] || 0) + 1;
    });
    
    console.log('Transactions by week:');
    Object.entries(weekCoverage).sort().forEach(([week, count]) => {
      console.log(`  Week ${week}: ${count} transactions`);
    });
    
    console.log('');
    console.log('🎯 POTENTIAL ISSUES:');
    console.log('=' .repeat(50));
    console.log('1. API pagination limits (Sleeper may limit results per request)');
    console.log('2. Week-based filtering may miss some transactions');
    console.log('3. Different transaction types might be on different endpoints');
    console.log('4. Timing differences between Discord notifications and API updates');
    console.log('5. Transactions might be spread across multiple weeks differently than expected');
    
  } catch (error) {
    console.error('❌ Error in deep investigation:', error);
  }
}

deepSleeperAPIInvestigation();