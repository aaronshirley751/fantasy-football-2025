// EXACT DATE VERIFICATION
// Let's verify the exact cutoff date and transaction timeline

function exactDateVerification() {
  console.log('🔍 EXACT DATE VERIFICATION');
  console.log('🎯 Verifying cutoff date and transaction timeline');
  console.log('=' .repeat(80));
  console.log('');
  
  // Our cutoff date
  const cutoffDate = new Date('2025-08-24T00:00:00Z');
  console.log(`Cutoff Date: ${cutoffDate.toLocaleDateString()} (August 24, 2025)`);
  console.log('');
  
  // Today's date (September 30, 2025)
  const today = new Date('2025-09-30');
  console.log(`Today: ${today.toLocaleDateString()} (September 30, 2025)`);
  console.log('');
  
  // Calculate "1 month ago" from September 30
  const oneMonthAgo = new Date('2025-08-30'); // Approximately 1 month ago
  console.log(`"1 month ago" from Sep 30: ${oneMonthAgo.toLocaleDateString()} (August 30, 2025)`);
  console.log('');
  
  // API transaction dates
  const apiDates = [
    { date: '2025-08-24', description: '3 transactions on cutoff day' },
    { date: '2025-08-26', description: '2 transactions, 2 days after cutoff' },
    { date: '2025-09-03', description: '1 transaction' },
    { date: '2025-09-12', description: '2 transactions' },
    { date: '2025-09-16', description: '1 transaction' },
    { date: '2025-09-17', description: '3 transactions' },
    { date: '2025-09-18', description: '1 transaction' },
    { date: '2025-09-24', description: '2 transactions' }
  ];
  
  console.log('📅 API TRANSACTION TIMELINE:');
  console.log('-' .repeat(50));
  apiDates.forEach(item => {
    const transDate = new Date(item.date);
    const daysFromToday = Math.floor((today - transDate) / (1000 * 60 * 60 * 24));
    const afterCutoff = transDate >= cutoffDate ? '✅' : '❌';
    console.log(`${afterCutoff} ${item.date} (${daysFromToday} days ago): ${item.description}`);
  });
  
  console.log('');
  console.log('🔍 DISCORD "1 MONTH AGO" ANALYSIS:');
  console.log('-' .repeat(50));
  
  // Discord says these are "1 month ago"
  const discordOneMonthAgo = [
    'Joe Mixon RB - HOU',
    'Austin Ekeler RB - WAS, Rachaad White RB - TB', 
    'Ray Davis RB - BUF',
    'Rachaad White RB - TB',
    'Isaiah Likely TE - BAL',
    'Ollie Gordon RB - MIA, Ray Davis RB - BUF'
  ];
  
  console.log(`Discord shows ${discordOneMonthAgo.length} transactions as "1 month ago"`);
  console.log('');
  
  if (oneMonthAgo >= cutoffDate) {
    console.log('✅ "1 month ago" should be AFTER cutoff (counted in fees)');
    console.log('❌ But API doesn\'t show these transactions!');
    console.log('');
    console.log('🎯 THIS SUGGESTS:');
    console.log('1. API is missing recent transactions, OR');
    console.log('2. Discord timing is inaccurate, OR');
    console.log('3. These transactions are from a different league/season');
  } else {
    console.log('✅ "1 month ago" would be BEFORE cutoff (not counted in fees)');
    console.log('✅ API correctly excludes these pre-cutoff transactions');
  }
  
  console.log('');
  console.log('🔍 MISSING TRANSACTIONS INVESTIGATION:');
  console.log('-' .repeat(50));
  console.log('If Discord "1 month ago" = late August 2025:');
  console.log('• These should appear in API results');
  console.log('• Our database should have them');
  console.log('• Fees should be higher than $6.00');
  console.log('');
  console.log('If Discord "1 month ago" = late July 2025:');
  console.log('• These would be pre-cutoff');
  console.log('• API correctly excludes them');
  console.log('• Our $6.00 fees would be correct');
  
  console.log('');
  console.log('🎯 NEXT STEPS:');
  console.log('=' .repeat(50));
  console.log('1. Check exact dates of Discord "1 month ago" transactions');
  console.log('2. Verify if we\'re missing API data from late August');
  console.log('3. Compare with other rosters to see if this is systematic');
  console.log('4. Check if Discord might be showing different league data');
}

exactDateVerification();