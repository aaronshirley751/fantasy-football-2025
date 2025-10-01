// Test the exact Discord message format with real data
const feeDetails = [
    {"roster_id":3,"type":"loss_fee","amount":5,"description":"Week 16 loss fee","owner_name":"BillyTrim"},
    {"roster_id":7,"type":"loss_fee","amount":5,"description":"Week 16 loss fee","owner_name":"tscotty85"},
    {"roster_id":6,"type":"loss_fee","amount":5,"description":"Week 16 loss fee","owner_name":"Watts52"},
    {"roster_id":8,"type":"loss_fee","amount":5,"description":"Week 16 loss fee","owner_name":"LastOne2022"},
    {"roster_id":10,"type":"loss_fee","amount":5,"description":"Week 16 loss fee","owner_name":"j1fisher25"},
    {"roster_id":1,"type":"high_score_bonus","amount":-5,"description":"High scorer bonus - Week 16","owner_name":"SaladBar751"}
];

const weekNumber = 16;

// Group fees by owner
const feesByOwner = {};
feeDetails.forEach(fee => {
    const ownerName = fee.owner_name || `Team ${fee.roster_id}`;
    if (!feesByOwner[ownerName]) {
        feesByOwner[ownerName] = { total: 0, details: [] };
    }
    feesByOwner[ownerName].total += fee.amount;
    feesByOwner[ownerName].details.push(fee);
});

// Create approved Discord message format
const fields = [];

// Weekly Activity section
fields.push({
    name: "📅 Weekly Activity",
    value: "Week 16 fees processed",
    inline: false
});

// Individual fees
Object.entries(feesByOwner).forEach(([ownerName, data]) => {
    const total = data.total;
    const formattedTotal = total >= 0 ? `$${total.toFixed(2)}` : `-$${Math.abs(total).toFixed(2)}`;
    
    // Create detail description
    const details = data.details.map(fee => {
        if (fee.type === 'loss_fee') return 'Loss';
        if (fee.type === 'high_score_bonus') return 'High Score Bonus';
        if (fee.type === 'transaction_fee') return 'Transaction';
        if (fee.type === 'inactive_fee') return 'Inactive Player';
        return fee.type;
    }).join(', ');
    
    fields.push({
        name: `${total >= 0 ? '💰' : '🎉'} ${ownerName}`,
        value: `${formattedTotal} (${details})`,
        inline: true
    });
});

// Season Totals section (placeholder - would be calculated from database)
fields.push({
    name: "📊 Season Totals",
    value: "BillyTrim: $45.00\ntscotty85: $35.00\nWatts52: $25.00\nLastOne2022: $40.00\nj1fisher25: $30.00\nSaladBar751: $15.00",
    inline: false
});

const discordMessage = {
    username: "Fantasy Fee Tracker",
    embeds: [{
        title: "🏈 Fantasy Football Fee Update",
        color: 0x00ff00,
        fields: fields,
        timestamp: new Date().toISOString(),
        footer: {
            text: "Automated weekly processing"
        }
    }]
};

console.log("📋 EXACT DISCORD MESSAGE FORMAT (Your Approved Version):");
console.log("=".repeat(60));
console.log(JSON.stringify(discordMessage, null, 2));

console.log("\n📱 DISCORD DISPLAY PREVIEW:");
console.log("=".repeat(60));
console.log("🏈 Fantasy Football Fee Update");
console.log("");
console.log("📅 Weekly Activity");
console.log("Week 16 fees processed");
console.log("");
console.log("💰 BillyTrim        $5.00 (Loss)");
console.log("💰 tscotty85       $5.00 (Loss)");
console.log("💰 Watts52         $5.00 (Loss)");
console.log("💰 LastOne2022     $5.00 (Loss)");
console.log("💰 j1fisher25      $5.00 (Loss)");
console.log("🎉 SaladBar751     -$5.00 (High Score Bonus)");
console.log("");
console.log("📊 Season Totals");
console.log("BillyTrim: $45.00");
console.log("tscotty85: $35.00");
console.log("Watts52: $25.00");
console.log("LastOne2022: $40.00");
console.log("j1fisher25: $30.00");
console.log("SaladBar751: $15.00");
console.log("");
console.log("Automated weekly processing");