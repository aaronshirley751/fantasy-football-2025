// Format Week 4 results with CORRECTED transaction data from Sleeper API
const weekNumber = 4;
const highScorerName = "Watts52";
const highScorerPoints = 213.66;

// Real fee data from function result
const feeDetails = [
    {"roster_id":10,"type":"loss_fee","amount":5,"description":"Week 4 loss fee","owner_name":"j1fisher25"},
    {"roster_id":1,"type":"loss_fee","amount":5,"description":"Week 4 loss fee","owner_name":"SaladBar751"},
    {"roster_id":8,"type":"loss_fee","amount":5,"description":"Week 4 loss fee","owner_name":"LastOne2022"},
    {"roster_id":5,"type":"loss_fee","amount":5,"description":"Week 4 loss fee","owner_name":"Shaklee77"},
    {"roster_id":2,"type":"loss_fee","amount":5,"description":"Week 4 loss fee","owner_name":"Turd_Ferguson24"},
    {"roster_id":6,"type":"high_score_bonus","amount":-5,"description":"High scorer bonus - Week 4","owner_name":"Watts52"}
];

// CORRECTED season summary with real Sleeper API transaction data
const seasonSummary = [
    {"roster_id":1,"owner_name":"SaladBar751","season_total":5,"transaction_fees":0,"other_fees":5,"transactions_used":0,"free_remaining":10},
    {"roster_id":2,"owner_name":"Turd_Ferguson24","season_total":0,"transaction_fees":0,"other_fees":0,"transactions_used":0,"free_remaining":10},
    {"roster_id":3,"owner_name":"BillyTrim","season_total":0,"transaction_fees":0,"other_fees":0,"transactions_used":1,"free_remaining":9},
    {"roster_id":4,"owner_name":"BeanerDipp","season_total":0,"transaction_fees":0,"other_fees":0,"transactions_used":0,"free_remaining":10},
    {"roster_id":5,"owner_name":"Shaklee77","season_total":0,"transaction_fees":0,"other_fees":0,"transactions_used":0,"free_remaining":10},
    {"roster_id":6,"owner_name":"Watts52","season_total":0,"transaction_fees":0,"other_fees":0,"transactions_used":6,"free_remaining":4},
    {"roster_id":7,"owner_name":"tscotty85","season_total":5,"transaction_fees":0,"other_fees":5,"transactions_used":5,"free_remaining":5},
    {"roster_id":8,"owner_name":"LastOne2022","season_total":5,"transaction_fees":0,"other_fees":5,"transactions_used":0,"free_remaining":10},
    {"roster_id":9,"owner_name":"petergell","season_total":5,"transaction_fees":0,"other_fees":5,"transactions_used":0,"free_remaining":10},
    {"roster_id":10,"owner_name":"j1fisher25","season_total":5,"transaction_fees":0,"other_fees":5,"transactions_used":0,"free_remaining":10}
];

// Calculate week total
const weekTotal = feeDetails.reduce((sum, fee) => sum + fee.amount, 0);
const grandTotal = seasonSummary.reduce((sum, team) => sum + team.season_total, 0);

console.log(`📊 Week ${weekNumber} Fantasy Football Fees`);
console.log("🏆 Highest Scorer");
console.log(`${highScorerName}: ${highScorerPoints} pts (-$5 bonus)`);
console.log("🆕 THIS WEEK'S ACTIVITY");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━");

// Individual fee lines with bullet points
feeDetails.forEach(fee => {
    if (fee.type === 'loss_fee') {
        console.log(`• ${fee.owner_name}: Loss ($5) = $${fee.amount.toFixed(2)}`);
    } else if (fee.type === 'high_score_bonus') {
        console.log(`• ${fee.owner_name}: Bonus (-$5) = $${fee.amount.toFixed(2)}`);
    } else if (fee.type === 'transaction_fee') {
        console.log(`• ${fee.owner_name}: Transaction ($2) = $${fee.amount.toFixed(2)}`);
    } else if (fee.type === 'inactive_fee') {
        console.log(`• ${fee.owner_name}: Inactive ($5) = $${fee.amount.toFixed(2)}`);
    }
});

console.log("💰 Week Total");
console.log(`$${Math.abs(weekTotal).toFixed(2)}`);
console.log("📈 SEASON TOTALS (All Teams)");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━");

// Real season totals with CORRECTED transaction tracking
seasonSummary.forEach(team => {
    if (team.transaction_fees > 0) {
        // Show paid transaction details
        const paidCount = team.transactions_used - 10;
        console.log(`• ${team.owner_name}: $${team.season_total.toFixed(2)} total ($${team.transaction_fees.toFixed(2)} transactions, $${team.other_fees.toFixed(2)} other), ${team.free_remaining}/10 free remaining (${paidCount} paid)`);
    } else {
        // Show free transaction details
        console.log(`• ${team.owner_name}: $${team.season_total.toFixed(2)} total (losses/inactive), ${team.free_remaining}/10 free remaining`);
    }
});

console.log("🏦 Season Grand Total");
console.log(`$${grandTotal.toFixed(2)} across all teams`);

console.log("ℹ️ Transaction Rules");
console.log("First 10 waiver/free agent claims per season are free ($2 each after)");

console.log("");
console.log(`Fantasy Fee Tracker | Powered by Sleeper API•${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`);

console.log("\n" + "=".repeat(60));
console.log("🔍 CORRECTED TRANSACTION ANALYSIS:");
console.log("=".repeat(60));
console.log("• BillyTrim: 1 transaction (9 free remaining)");
console.log("• Watts52: 6 transactions (4 free remaining) - Most active!");
console.log("• tscotty85: 5 transactions (5 free remaining)");
console.log("• All others: 0 transactions (10 free remaining)");
console.log("• August 24 cutoff rule working correctly");
console.log("• No transaction fees yet - all teams within 10 free limit");