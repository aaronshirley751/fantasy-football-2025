// Test script to validate Discord message format
// Simulates the exact logic from our corrected sendEnhancedDiscordNotification function

// Sample data matching Week 3 expected output
const fees = [
  { roster_id: 3, type: 'loss_fee', amount: 5, description: 'Loss fee' },
  { roster_id: 9, type: 'high_score_bonus', amount: -5, description: 'High scorer bonus' }
];

const userMappings = [
  { roster_id: 3, display_name: 'SaladBar751' },
  { roster_id: 9, display_name: 'BeanerDipp' }
];

const weekNumber = 3;

// Build the clean text message in approved format (exact logic from function)
let message = `🎉 **COMPLETE WEEKLY FEE ASSESSMENT - Week ${weekNumber}**\n\n`;

// Create user mapping lookup
const userMap = new Map();
userMappings.forEach(mapping => {
  userMap.set(mapping.roster_id, mapping.display_name);
});

// Group fees by roster
const feesByRoster = new Map();
fees.forEach(fee => {
  if (!feesByRoster.has(fee.roster_id)) {
    feesByRoster.set(fee.roster_id, []);
  }
  feesByRoster.get(fee.roster_id).push(fee);
});

// Process each roster that had fees
if (feesByRoster.size > 0) {
  for (const [rosterId, rosterFees] of feesByRoster) {
    const ownerName = userMap.get(rosterId) || `Team ${rosterId}`;
    const totalFees = rosterFees.reduce((sum, fee) => sum + fee.amount, 0);
    
    // Only show rosters with fees (positive or negative)
    if (totalFees !== 0) {
      if (totalFees > 0) {
        // Roster owes money - build fee breakdown
        const feeBreakdown = [];
        rosterFees.forEach(fee => {
          if (fee.amount > 0) {
            if (fee.type === 'loss_fee') feeBreakdown.push('Loss fee');
            else if (fee.type === 'transaction_fee') feeBreakdown.push('Transaction fee'); 
            else if (fee.type === 'inactive_penalty') feeBreakdown.push('Inactive penalty');
            else feeBreakdown.push(fee.description);
          }
        });
        message += `**${ownerName}**: $${totalFees} (${feeBreakdown.join(', ')})\n`;
      } else {
        // Roster gets money back (bonus)
        message += `**${ownerName}**: -$${Math.abs(totalFees)} (High scorer bonus)\n`;
      }
    }
  }
}

// Calculate and add weekly total
const totalWeeklyFees = fees.reduce((sum, fee) => sum + Math.max(0, fee.amount), 0);
message += `\n**Week ${weekNumber} Total**: $${totalWeeklyFees.toFixed(2)}`;

console.log("=== DISCORD MESSAGE OUTPUT ===");
console.log(message);
console.log("==============================");
