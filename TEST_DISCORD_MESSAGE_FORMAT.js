// This script simulates what Discord will receive - formatted exactly as the production function sends it

const sampleSeasonSummary = [
  {
    owner_name: "BeanerDipp",
    season_total: -5.00,
    transaction_fees: 0,
    losses_inactive_fees: 0,
    high_scorer_bonuses: -5.00,
    transactions_used: 1,
    free_remaining: 9
  },
  {
    owner_name: "tscotty85",
    season_total: 57.00,
    transaction_fees: 42.00,
    losses_inactive_fees: 15.00,
    high_scorer_bonuses: 0,
    transactions_used: 31,
    free_remaining: 0
  },
  {
    owner_name: "Watts52",
    season_total: 5.00,
    transaction_fees: 10.00,
    losses_inactive_fees: 5.00,
    high_scorer_bonuses: -10.00,
    transactions_used: 15,
    free_remaining: 0
  }
];

const weekFees = [
  { owner_name: "j1fisher25", type: "loss_fee", amount: 5 },
  { owner_name: "SaladBar751", type: "loss_fee", amount: 5 },
  { owner_name: "BillyTrim", type: "high_score_bonus", amount: -5 }
];

const highScorer = { owner_name: "BillyTrim", points: 187.44 };
const weekNumber = 5;
const weekTotal = 20;
const seasonGrandTotal = 156;
const seasonSummary = sampleSeasonSummary;  // Fix: assign the variable

// EXACT DISCORD MESSAGE FORMATTING (from process-weekly-fees/index.ts lines 88-134)
let message = `📊 Week ${weekNumber} Fantasy Football Fees\n`;

// High scorer section
message += `🏆 Highest Scorer\n`;
message += `${highScorer?.owner_name || 'Unknown'}: ${highScorer?.points || 0} pts (-$5 bonus)\n`;

// This week's activity
message += `🆕 THIS WEEK'S ACTIVITY\n`;
message += `━━━━━━━━━━━━━━━━━━━━━━━━\n`;

weekFees.forEach(fee => {
  if (fee.type === 'loss_fee') {
    message += `• ${fee.owner_name}: Loss ($${fee.amount}) = $${fee.amount.toFixed(2)}\n`;
  } else if (fee.type === 'high_score_bonus') {
    message += `• ${fee.owner_name}: Bonus (-$${Math.abs(fee.amount)}) = -$${Math.abs(fee.amount).toFixed(2)}\n`;
  }
});

message += `💰 Week Total\n`;
message += `$${weekTotal.toFixed(2)}\n`;

// Season totals
message += `📈 SEASON TOTALS (All Teams)\n`;
message += `━━━━━━━━━━━━━━━━━━━━━━━━\n`;

seasonSummary.forEach(team => {
  const total = team.season_total;
  const totalStr = total >= 0 ? `$${total.toFixed(2)}` : `-$${Math.abs(total).toFixed(2)}`;
  
  let details = [];
  if (team.transaction_fees > 0) {
    details.push(`$${team.transaction_fees.toFixed(2)} transactions`);
  }
  if (team.losses_inactive_fees > 0) {
    details.push(`$${team.losses_inactive_fees.toFixed(2)} losses/inactive`);
  }
  if (team.high_scorer_bonuses < 0) {
    details.push(`$${team.high_scorer_bonuses.toFixed(2)} high scorer bonus`);
  }
  
  const detailsStr = details.length > 0 ? ` (${details.join(', ')})` : '';
  const paidTransactions = Math.max(0, team.transactions_used - 10);
  const freeRemaining = Math.max(0, 10 - team.transactions_used);
  
  message += `• ${team.owner_name}: ${totalStr} total${detailsStr}, ${freeRemaining}/10 free remaining`;
  if (paidTransactions > 0) {
    message += ` (${paidTransactions} paid)`;
  }
  message += `\n`;
});

message += `🏦 Season Grand Total\n`;
message += `$${seasonGrandTotal.toFixed(2)} across all teams`;

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📨 EXACT DISCORD MESSAGE FORMAT (What Discord Will Receive)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log(message);
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('✅ This is EXACTLY what Discord webhook will receive');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
