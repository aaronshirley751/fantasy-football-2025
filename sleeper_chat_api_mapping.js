// SLEEPER CHAT VS API MAPPING
// Map the specific chat transactions against API results to identify the missing 5

async function sleeperChatVsApiMapping() {
  console.log('🔍 SLEEPER CHAT VS API DETAILED MAPPING');
  console.log('🎯 Identifying the exact 5 missing transactions from chat data');
  console.log('=' .repeat(80));
  console.log('');
  
  // Sleeper chat transactions from user (20 total)
  const chatTransactions = [
    { description: 'New England Patriots DEF - NE', daysAgo: 6, date: '9/24/2025' },
    { description: 'Atlanta Falcons DEF - ATL', daysAgo: 6, date: '9/24/2025' },
    { description: 'Romeo Doubs WR - GB', daysAgo: 12, date: '9/18/2025' },
    { description: 'Justin Fields QB - NYJ', daysAgo: 13, date: '9/17/2025' },
    { description: 'Rashee Rice WR - KC', daysAgo: 13, date: '9/17/2025' },
    { description: 'Atlanta Falcons DEF - ATL, Pittsburgh Steelers DEF - PIT', daysAgo: 13, date: '9/17/2025' },
    { description: 'Austin Ekeler RB - WAS', daysAgo: 14, date: '9/16/2025' },
    { description: 'Justin Fields QB - NYJ, Rashee Rice WR - KC', daysAgo: 18, date: '9/12/2025' },
    { description: 'Rashee Rice WR - KC, Ollie Gordon RB - MIA', daysAgo: 18, date: '9/12/2025' },
    { description: 'Ollie Gordon RB - MIA, Ray Davis RB - BUF', daysAgo: 30, date: '~8/31/2025' },
    { description: 'Joe Mixon RB - HOU', daysAgo: 30, date: '~8/31/2025' },
    { description: 'Austin Ekeler RB - WAS, Rachaad White RB - TB', daysAgo: 30, date: '~8/31/2025' },
    { description: 'Ray Davis RB - BUF', daysAgo: 30, date: '~8/31/2025' },
    { description: 'Rachaad White RB - TB', daysAgo: 30, date: '~8/31/2025' },
    { description: 'Isaiah Likely TE - BAL', daysAgo: 30, date: '~8/31/2025' }
  ];
  
  // API transactions from our investigation (15 total)
  const apiTransactions = [
    { date: '8/24/2025', time: '1:16:37 PM', id: '1265408466470567936', action: 'Drops: 8131' },
    { date: '8/24/2025', time: '1:17:14 PM', id: '1265408620720300032', action: 'Adds: 8136' },
    { date: '8/24/2025', time: '1:17:20 PM', id: '1265408646020341760', action: 'Adds: 11575' },
    { date: '8/26/2025', time: '11:47:20 PM', id: '1266291967709433856', action: 'Adds: 4663, Drops: 8136' },
    { date: '8/26/2025', time: '11:47:32 PM', id: '1266292014027128832', action: 'Drops: 4018' },
    { date: '9/3/2025', time: '5:01:21 PM', id: '1269088899817295872', action: 'Adds: 12495, Drops: 11575' },
    { date: '9/12/2025', time: '7:52:52 AM', id: '1272212358067945473', action: 'Adds: 10229, Drops: 12495' },
    { date: '9/12/2025', time: '8:10:49 AM', id: '1272216878902681600', action: 'Adds: 7591, Drops: 10229' },
    { date: '9/16/2025', time: '12:30:17 PM', id: '1273731725926621184', action: 'Drops: 4663' },
    { date: '9/17/2025', time: '8:36:20 AM', id: '1274035238900629504', action: 'Adds: ATL, Drops: PIT' },
    { date: '9/17/2025', time: '8:36:56 AM', id: '1274035387290886144', action: 'Adds: 10229' },
    { date: '9/17/2025', time: '11:02:20 PM', id: '1274253173569122304', action: 'Drops: 7591' },
    { date: '9/18/2025', time: '1:15:26 PM', id: '1274467863377231872', action: 'Adds: 8121' },
    { date: '9/24/2025', time: '9:29:35 AM', id: '1276585355335720960', action: 'Drops: ATL' },
    { date: '9/24/2025', time: '9:42:53 AM', id: '1276588703032016896', action: 'Adds: NE' }
  ];
  
  console.log('📋 CHAT TRANSACTIONS (20 total):');
  console.log('-' .repeat(50));
  chatTransactions.forEach((t, index) => {
    console.log(`${String(index + 1).padStart(2, ' ')}. ${t.date} - ${t.description}`);
  });
  
  console.log('');
  console.log('📋 API TRANSACTIONS (15 total):');
  console.log('-' .repeat(50));
  apiTransactions.forEach((t, index) => {
    console.log(`${String(index + 1).padStart(2, ' ')}. ${t.date} ${t.time} - ${t.action}`);
  });
  
  console.log('');
  console.log('🔍 MAPPING ANALYSIS BY DATE:');
  console.log('-' .repeat(50));
  
  // Map by approximate dates
  console.log('✅ 9/24/2025 (6 days ago):');
  console.log('  Chat: New England Patriots DEF - NE');
  console.log('  API:  9/24/2025 9:42:53 AM - Adds: NE ✅ MATCH');
  console.log('  Chat: Atlanta Falcons DEF - ATL');  
  console.log('  API:  9/24/2025 9:29:35 AM - Drops: ATL ✅ MATCH');
  console.log('');
  
  console.log('✅ 9/18/2025 (12 days ago):');
  console.log('  Chat: Romeo Doubs WR - GB');
  console.log('  API:  9/18/2025 1:15:26 PM - Adds: 8121 ❓ NEED PLAYER LOOKUP');
  console.log('');
  
  console.log('✅ 9/17/2025 (13 days ago):');
  console.log('  Chat: Justin Fields QB - NYJ');
  console.log('  Chat: Rashee Rice WR - KC');
  console.log('  Chat: Atlanta Falcons DEF - ATL, Pittsburgh Steelers DEF - PIT');
  console.log('  API:  9/17/2025 8:36:20 AM - Adds: ATL, Drops: PIT ✅ MATCH (DEF swap)');
  console.log('  API:  9/17/2025 8:36:56 AM - Adds: 10229 ❓ NEED PLAYER LOOKUP');
  console.log('  API:  9/17/2025 11:02:20 PM - Drops: 7591 ❓ NEED PLAYER LOOKUP');
  console.log('');
  
  console.log('✅ 9/16/2025 (14 days ago):');
  console.log('  Chat: Austin Ekeler RB - WAS');
  console.log('  API:  9/16/2025 12:30:17 PM - Drops: 4663 ❓ NEED PLAYER LOOKUP');
  console.log('');
  
  console.log('✅ 9/12/2025 (18 days ago):');
  console.log('  Chat: Justin Fields QB - NYJ, Rashee Rice WR - KC');
  console.log('  Chat: Rashee Rice WR - KC, Ollie Gordon RB - MIA');
  console.log('  API:  9/12/2025 7:52:52 AM - Adds: 10229, Drops: 12495 ❓ NEED PLAYER LOOKUP');
  console.log('  API:  9/12/2025 8:10:49 AM - Adds: 7591, Drops: 10229 ❓ NEED PLAYER LOOKUP');
  console.log('');
  
  console.log('❌ MISSING FROM API (~8/31/2025, "1 month ago"):');
  console.log('  Chat: Ollie Gordon RB - MIA, Ray Davis RB - BUF');
  console.log('  Chat: Joe Mixon RB - HOU');
  console.log('  Chat: Austin Ekeler RB - WAS, Rachaad White RB - TB');
  console.log('  Chat: Ray Davis RB - BUF');
  console.log('  Chat: Rachaad White RB - TB');
  console.log('  Chat: Isaiah Likely TE - BAL');
  console.log('  API:  NO MATCHING TRANSACTIONS FOUND');
  console.log('');
  
  console.log('❌ POTENTIALLY MISSING FROM API (8/24-8/26):');
  console.log('  API shows 5 transactions on 8/24-8/26 but chat doesn\'t mention these dates');
  console.log('  This suggests the API transactions from 8/24-8/26 might be:');
  console.log('  1. Pre-cutoff transactions (but they\'re after 8/24)');
  console.log('  2. Different from what chat is tracking');
  console.log('  3. Internal roster moves not shown in chat');
  console.log('');
  
  console.log('🎯 HYPOTHESIS - THE MISSING 5 TRANSACTIONS:');
  console.log('=' .repeat(50));
  console.log('The 6 "1 month ago" chat transactions likely represent:');
  console.log('1. Ollie Gordon RB - MIA, Ray Davis RB - BUF (1 transaction)');
  console.log('2. Joe Mixon RB - HOU (1 transaction)');
  console.log('3. Austin Ekeler RB - WAS, Rachaad White RB - TB (1 transaction)');
  console.log('4. Ray Davis RB - BUF (1 transaction)');
  console.log('5. Rachaad White RB - TB (1 transaction)');
  console.log('6. Isaiah Likely TE - BAL (1 transaction)');
  console.log('');
  console.log('But the API might be missing these if they occurred:');
  console.log('a) Before August 24 (excluded by our cutoff)');
  console.log('b) In weeks the API doesn\'t properly return');
  console.log('c) As a different transaction type we haven\'t checked');
  console.log('');
  console.log('🔍 NEXT STEPS:');
  console.log('1. Check if "1 month ago" = before August 24 cutoff');
  console.log('2. Look for these specific players in API data');
  console.log('3. Check if these are pre-season transactions');
}

sleeperChatVsApiMapping();