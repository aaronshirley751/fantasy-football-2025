// Test the corrected transaction status logic
console.log("🔍 TESTING CORRECTED TRANSACTION STATUS LOGIC");
console.log("=" * 60);

const transactionStats = [
  { roster_id: 1, free_transactions_per_season: 10, free_remaining: 0, mulligan_used: false }, // Used all 10 free + 3 paid = 13 total
  { roster_id: 6, free_transactions_per_season: 10, free_remaining: 1, mulligan_used: false }, // Used 9 free, 1 remaining  
  { roster_id: 4, free_transactions_per_season: 10, free_remaining: 10, mulligan_used: false }, // Used 0, 10 remaining
  { roster_id: 3, free_transactions_per_season: 10, free_remaining: 8, mulligan_used: false }, // Used 2 free, 8 remaining
];

const userMap = new Map([
  [1, 'Watts52'],
  [6, 'tscotty85'], 
  [4, 'Turd_Ferguson24'],
  [3, 'SaladBar751']
]);

console.log("📊 Season Transaction Status:");

// Sort by free transactions remaining (least to most)
const sortedStats = [...transactionStats].sort((a, b) => a.free_remaining - b.free_remaining);

sortedStats.forEach(stat => {
  const ownerName = userMap.get(stat.roster_id) || `Team ${stat.roster_id}`;
  const totalTransactions = stat.free_transactions_per_season - stat.free_remaining;
  const freeRemaining = stat.free_remaining;
  const freeUsed = stat.free_transactions_per_season - freeRemaining;
  const paidTransactions = Math.max(0, totalTransactions - stat.free_transactions_per_season);
  
  console.log(`\nProcessing ${ownerName}:`);
  console.log(`  - free_transactions_per_season: ${stat.free_transactions_per_season}`);
  console.log(`  - free_remaining: ${freeRemaining}`);
  console.log(`  - freeUsed: ${freeUsed}`);
  console.log(`  - totalTransactions: ${totalTransactions}`);
  console.log(`  - paidTransactions: ${paidTransactions}`);
  
  if (freeRemaining === 0) {
    // All 10 free used, may have paid transactions too
    if (paidTransactions > 0) {
      console.log(`  Result: ${ownerName}: 🔴 0 free remaining (${totalTransactions} total: 10 free + ${paidTransactions} paid)`);
    } else {
      console.log(`  Result: ${ownerName}: 🔴 0 free remaining (${totalTransactions} total: all free)`);
    }
  } else if (freeRemaining <= 3) {
    // Low on free transactions, shouldn't have paid yet
    console.log(`  Result: ${ownerName}: 🟡 ${freeRemaining} free remaining (${totalTransactions} total: all free)`);
  } else {
    // Plenty of free transactions left
    if (totalTransactions > 0) {
      console.log(`  Result: ${ownerName}: 🟢 ${freeRemaining} free remaining (${totalTransactions} total: all free)`);
    }
  }
});

console.log("\n" + "=" * 60);
console.log("🎯 CORRECTED LOGIC EXPLANATION:");
console.log("✅ 10 free transactions per season total");
console.log("✅ free_remaining shows how many of the 10 are left");
console.log("✅ totalTransactions = 10 - free_remaining (for transactions within free limit)");
console.log("✅ paidTransactions = totalTransactions - 10 (only when totalTransactions > 10)");
console.log("✅ Logic now correctly shows relationship between free/paid");

// Test with someone who has 13 total transactions
console.log("\n🧪 TESTING WATTS52 SCENARIO (13 total transactions):");
const watts52 = {
  roster_id: 1, 
  free_transactions_per_season: 10, 
  free_remaining: 0,
  // This means they used all 10 free, but how do we know about the 3 paid?
  // The totalTransactions calculation is wrong - it should come from external data
};

console.log("❌ CURRENT ISSUE: We're calculating totalTransactions wrong!");
console.log("❌ totalTransactions = 10 - 0 = 10 (but should be 13)"); 
console.log("✅ SOLUTION: Need actual transaction count from database, not calculated from free_remaining");
console.log("✅ free_remaining should only track the 10 free slots");
console.log("✅ Total transactions should come from actual transaction count in database");
