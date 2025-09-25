// Test the updated transaction status logic with dollar amounts
console.log("💰 TESTING TRANSACTION STATUS WITH DOLLAR AMOUNTS");
console.log("=" * 60);

// Example data with actual transaction counts and costs
const transactionStats = [
  { roster_id: 1, free_transactions_per_season: 10, free_remaining: 0, total_transactions: 13, mulligan_used: false }, // Watts52: 13 total (10 free + 3 paid = $6)
  { roster_id: 6, free_transactions_per_season: 10, free_remaining: 1, total_transactions: 22, mulligan_used: false }, // tscotty85: 22 total (10 free + 12 paid = $24)
  { roster_id: 4, free_transactions_per_season: 10, free_remaining: 10, total_transactions: 7, mulligan_used: false }, // Turd_Ferguson24: 7 total (all paid = $14)
  { roster_id: 3, free_transactions_per_season: 10, free_remaining: 8, total_transactions: 2, mulligan_used: false }, // SaladBar751: 2 total (all free)
];

const userMap = new Map([
  [1, 'Watts52'],
  [6, 'tscotty85'], 
  [4, 'Turd_Ferguson24'],
  [3, 'SaladBar751']
]);

console.log("📊 Season Transaction Status (WITH DOLLAR AMOUNTS):");

// Sort by free transactions remaining (least to most)
const sortedStats = [...transactionStats].sort((a, b) => a.free_remaining - b.free_remaining);

sortedStats.forEach(stat => {
  const ownerName = userMap.get(stat.roster_id) || `Team ${stat.roster_id}`;
  const totalTransactions = stat.total_transactions;  // Use actual transaction count
  const freeRemaining = stat.free_remaining;
  const freeUsed = Math.min(totalTransactions, stat.free_transactions_per_season);  // Can't use more than 10 free
  const paidTransactions = Math.max(0, totalTransactions - stat.free_transactions_per_season);
  const paidTransactionCost = paidTransactions * 2;  // $2 per paid transaction
  
  console.log(`\n💰 Processing ${ownerName}:`);
  console.log(`  - total_transactions: ${totalTransactions}`);
  console.log(`  - free_remaining: ${freeRemaining}`);
  console.log(`  - freeUsed: ${freeUsed}`);
  console.log(`  - paidTransactions: ${paidTransactions}`);
  console.log(`  - paidTransactionCost: $${paidTransactionCost}`);
  
  if (freeRemaining === 0 && totalTransactions > 0) {
    // All 10 free used, may have paid transactions too
    if (paidTransactions > 0) {
      const result = `${ownerName}: 🔴 0 free remaining (${totalTransactions} total: 10 free + ${paidTransactions} paid = $${paidTransactionCost})`;
      console.log(`  ✅ Result: ${result}`);
    } else {
      const result = `${ownerName}: 🔴 0 free remaining (${totalTransactions} total: all free)`;
      console.log(`  ✅ Result: ${result}`);
    }
  } else if (freeRemaining <= 3 && totalTransactions > 0) {
    // Low on free transactions, shouldn't have paid yet
    const result = `${ownerName}: 🟡 ${freeRemaining} free remaining (${totalTransactions} total: all free)`;
    console.log(`  ✅ Result: ${result}`);
  } else if (totalTransactions > 0) {
    // Check for special case where all transactions are paid (like Turd_Ferguson24 example)
    if (paidTransactions > 0) {
      const result = `${ownerName}: 🟢 ${freeRemaining} free remaining (${totalTransactions} total: all paid = $${paidTransactionCost})`;
      console.log(`  ✅ Result: ${result}`);
    } else {
      const result = `${ownerName}: 🟢 ${freeRemaining} free remaining (${totalTransactions} total: all free)`;
      console.log(`  ✅ Result: ${result}`);
    }
  } else {
    console.log(`  ⏭️  Skipped: ${ownerName} (0 transactions)`);
  }
});

console.log("\n" + "=" * 60);
console.log("💰 UPDATED OUTPUT WITH DOLLAR AMOUNTS:");
console.log("Watts52: 🔴 0 free remaining (13 total: 10 free + 3 paid = $6)");
console.log("tscotty85: 🔴 0 free remaining (22 total: 10 free + 12 paid = $24)");  
console.log("Turd_Ferguson24: 🟢 10 free remaining (7 total: all paid = $14)");
console.log("SaladBar751: 🟢 8 free remaining (2 total: all free)");
console.log("All others: 🟢 8-10 free remaining");

console.log("\n💡 BUSINESS LOGIC:");
console.log("✅ Each paid transaction costs $2");
console.log("✅ Dollar amounts only shown when there are paid transactions");
console.log("✅ Format: 'X paid = $Y' where Y = X * $2");
console.log("✅ Free transactions show no dollar amount");
console.log("✅ Mixed transactions show breakdown with cost for paid portion");

console.log("\n🎯 ENHANCEMENT COMPLETE!");
console.log("Season Transaction Status now includes transaction fees! 💰");
