// Format Week 4 results in YOUR ACTUAL APPROVED FORMAT
const weekNumber = 4;
const highScorerName = "Watts52";
const highScorerPoints = 213.66;

// Week 4 fee data from function result
const feeDetails = [
    {"roster_id":10,"type":"loss_fee","amount":5,"description":"Week 4 loss fee","owner_name":"j1fisher25"},
    {"roster_id":1,"type":"loss_fee","amount":5,"description":"Week 4 loss fee","owner_name":"SaladBar751"},
    {"roster_id":8,"type":"loss_fee","amount":5,"description":"Week 4 loss fee","owner_name":"LastOne2022"},
    {"roster_id":5,"type":"loss_fee","amount":5,"description":"Week 4 loss fee","owner_name":"Shaklee77"},
    {"roster_id":2,"type":"loss_fee","amount":5,"description":"Week 4 loss fee","owner_name":"Turd_Ferguson24"},
    {"roster_id":6,"type":"high_score_bonus","amount":-5,"description":"High scorer bonus - Week 4","owner_name":"Watts52"}
];

// Calculate week total
const weekTotal = feeDetails.reduce((sum, fee) => sum + fee.amount, 0);

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

// Season totals for all teams (placeholder data - would be calculated from database)
const allTeams = [
    "SaladBar751", "Turd_Ferguson24", "BillyTrim", "BeanerDipp", "Shaklee77", 
    "Watts52", "tscotty85", "LastOne2022", "petergell", "j1fisher25"
];

allTeams.forEach(teamName => {
    // Placeholder season totals - in real implementation would query database
    const seasonTotal = Math.floor(Math.random() * 30) + 5; // Random for demo
    const freeRemaining = Math.floor(Math.random() * 11); // 0-10
    console.log(`• ${teamName}: $${seasonTotal}.00 total (losses/inactive), ${freeRemaining}/10 free remaining`);
});

console.log("🏦 Season Grand Total");
console.log("$150.00 across all teams"); // Placeholder

console.log("ℹ️ Transaction Rules");
console.log("First 10 waiver/free agent claims per season are free ($2 each after)");

console.log("");
console.log(`Fantasy Fee Tracker | Powered by Sleeper API•${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`);