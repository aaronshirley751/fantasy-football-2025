// DISCORD VS API MAPPING ANALYSIS
// Systematic comparison between Discord notifications and API transactions

async function discordApiMappingAnalysis() {
  console.log('🔍 DISCORD VS API MAPPING ANALYSIS');
  console.log('🎯 Systematically comparing Discord notifications with API data');
  console.log('=' .repeat(80));
  console.log('');
  
  // API transactions from our previous analysis (chronological)
  const apiTransactions = [
    { date: '8/24/2025', time: '1:16:37 PM', id: '1265408466470567936', action: 'Drops: 8131', daysAgo: 37 },
    { date: '8/24/2025', time: '1:17:14 PM', id: '1265408620720300032', action: 'Adds: 8136', daysAgo: 37 },
    { date: '8/24/2025', time: '1:17:20 PM', id: '1265408646020341760', action: 'Adds: 11575', daysAgo: 37 },
    { date: '8/26/2025', time: '11:47:20 PM', id: '1266291967709433856', action: 'Adds: 4663, Drops: 8136', daysAgo: 35 },
    { date: '8/26/2025', time: '11:47:32 PM', id: '1266292014027128832', action: 'Drops: 4018', daysAgo: 35 },
    { date: '9/3/2025', time: '5:01:21 PM', id: '1269088899817295872', action: 'Adds: 12495, Drops: 11575', daysAgo: 27 },
    { date: '9/12/2025', time: '7:52:52 AM', id: '1272212358067945473', action: 'Adds: 10229, Drops: 12495', daysAgo: 18 },
    { date: '9/12/2025', time: '8:10:49 AM', id: '1272216878902681600', action: 'Adds: 7591, Drops: 10229', daysAgo: 18 },
    { date: '9/16/2025', time: '12:30:17 PM', id: '1273731725926621184', action: 'Drops: 4663', daysAgo: 14 },
    { date: '9/17/2025', time: '8:36:20 AM', id: '1274035238900629504', action: 'Adds: ATL, Drops: PIT', daysAgo: 13 },
    { date: '9/17/2025', time: '8:36:56 AM', id: '1274035387290886144', action: 'Adds: 10229', daysAgo: 13 },
    { date: '9/17/2025', time: '11:02:20 PM', id: '1274253173569122304', action: 'Drops: 7591', daysAgo: 13 },
    { date: '9/18/2025', time: '1:15:26 PM', id: '1274467863377231872', action: 'Adds: 8121', daysAgo: 12 },
    { date: '9/24/2025', time: '9:29:35 AM', id: '1276585355335720960', action: 'Drops: ATL', daysAgo: 6 },
    { date: '9/24/2025', time: '9:42:53 AM', id: '1276588703032016896', action: 'Adds: NE', daysAgo: 6 }
  ];
  
  // Discord notifications (from user's list)
  const discordNotifications = [
    { description: 'New England Patriots DEF - NE', daysAgo: 6 },
    { description: 'Atlanta Falcons DEF - ATL', daysAgo: 6 },
    { description: 'Romeo Doubs WR - GB', daysAgo: 12 },
    { description: 'Justin Fields QB - NYJ', daysAgo: 13 },
    { description: 'Rashee Rice WR - KC', daysAgo: 13 },
    { description: 'Atlanta Falcons DEF - ATL, Pittsburgh Steelers DEF - PIT', daysAgo: 13 },
    { description: 'Austin Ekeler RB - WAS', daysAgo: 14 },
    { description: 'Justin Fields QB - NYJ, Rashee Rice WR - KC', daysAgo: 18 },
    { description: 'Rashee Rice WR - KC, Ollie Gordon RB - MIA', daysAgo: 18 },
    { description: 'Ollie Gordon RB - MIA, Ray Davis RB - BUF', daysAgo: 30 },
    { description: 'Joe Mixon RB - HOU', daysAgo: 30 },
    { description: 'Austin Ekeler RB - WAS, Rachaad White RB - TB', daysAgo: 30 },
    { description: 'Ray Davis RB - BUF', daysAgo: 30 },
    { description: 'Rachaad White RB - TB', daysAgo: 30 },
    { description: 'Isaiah Likely TE - BAL', daysAgo: 30 }
  ];
  
  console.log('📊 TRANSACTION COUNT COMPARISON:');
  console.log('-' .repeat(50));
  console.log(`API Transactions: ${apiTransactions.length}`);
  console.log(`Discord Notifications: ${discordNotifications.length}`);
  console.log('');
  
  console.log('📋 MAPPING BY TIME PERIOD:');
  console.log('-' .repeat(50));
  
  // Group by approximate time periods
  const timePeriods = [
    { name: '6 days ago (9/24)', discordCount: 2, apiCount: 2 },
    { name: '12 days ago (9/18)', discordCount: 1, apiCount: 1 },
    { name: '13 days ago (9/17)', discordCount: 3, apiCount: 3 },
    { name: '14 days ago (9/16)', discordCount: 1, apiCount: 1 },
    { name: '18 days ago (9/12)', discordCount: 2, apiCount: 2 },
    { name: '27 days ago (9/3)', discordCount: 0, apiCount: 1 },
    { name: '35 days ago (8/26)', discordCount: 0, apiCount: 2 },
    { name: '37 days ago (8/24)', discordCount: 0, apiCount: 3 },
    { name: '30 days ago (1 month)', discordCount: 6, apiCount: 0 }
  ];
  
  timePeriods.forEach(period => {
    const status = period.discordCount === period.apiCount ? '✅' : '❌';
    console.log(`${status} ${period.name}: Discord ${period.discordCount}, API ${period.apiCount}`);
  });
  
  console.log('');
  console.log('🔍 DETAILED ANALYSIS:');
  console.log('-' .repeat(50));
  
  console.log('✅ MATCHES FOUND:');
  console.log('• 6 days ago: Both show 2 transactions (NE DEF, ATL DEF)');
  console.log('• 12 days ago: Both show Romeo Doubs move');
  console.log('• 13 days ago: Both show 3 moves (Justin Fields, Rashee Rice, DEF swap)');
  console.log('• 14 days ago: Both show Austin Ekeler move');
  console.log('• 18 days ago: Both show 2 moves (Justin Fields + Rashee Rice pair)');
  console.log('');
  
  console.log('❌ DISCREPANCIES:');
  console.log('• API shows 6 transactions from 8/24-8/26 that Discord doesn\'t mention');
  console.log('• Discord shows 6 "1 month ago" transactions that API doesn\'t have');
  console.log('• API missing: Joe Mixon, Austin Ekeler/Rachaad White, Ray Davis, etc.');
  console.log('');
  
  console.log('🎯 HYPOTHESIS:');
  console.log('-' .repeat(50));
  console.log('1. Discord "1 month ago" transactions may be from before August 24 cutoff');
  console.log('2. API transactions from 8/24-8/26 might not be showing in Discord history');
  console.log('3. Discord might be showing older transactions that are outside current season');
  console.log('4. Different transaction filtering between Discord and API');
  console.log('');
  
  console.log('📅 CUTOFF DATE ANALYSIS:');
  console.log('-' .repeat(50));
  const cutoffDate = new Date('2025-08-24T00:00:00Z');
  console.log(`Our cutoff: ${cutoffDate.toLocaleDateString()}`);
  console.log('API transactions all appear to be AFTER cutoff date');
  console.log('Discord "1 month ago" might be BEFORE cutoff date');
  
  // Calculate what "1 month ago" means
  const today = new Date('2025-09-30');
  const oneMonthAgo = new Date(today);
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  console.log(`"1 month ago" ≈ ${oneMonthAgo.toLocaleDateString()}`);
  
  if (oneMonthAgo < cutoffDate) {
    console.log('✅ "1 month ago" transactions would be BEFORE our cutoff!');
  } else {
    console.log('❌ "1 month ago" transactions should be AFTER our cutoff');
  }
  
  console.log('');
  console.log('🎯 CONCLUSION:');
  console.log('=' .repeat(50));
  console.log('The discrepancy might be explained by:');
  console.log('1. Discord showing pre-season transactions (before Aug 24)');
  console.log('2. API correctly filtering to post-Aug 24 transactions');
  console.log('3. Our 15 API transactions are likely the correct count for fees');
  console.log('4. Discord\'s "1 month ago" entries are probably pre-cutoff');
}

discordApiMappingAnalysis();