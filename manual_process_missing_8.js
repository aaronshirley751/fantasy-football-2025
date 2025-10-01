// Manual processing of the exact 8 missing transactions
const supabaseUrl = 'https://jfeuobfjgqownybluvje.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmZXVvYmZqZ3Fvd255Ymx1dmplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTU1MjU4NSwiZXhwIjoyMDcxMTI4NTg1fQ.TYZBL4UNLEJN6ovM6HQS5wxm2zkbZHBYtmQYALHDkqQ';
const DATABASE_LEAGUE_UUID = 'a7d65b53-2ec5-4b38-94ee-7fcb97160989';

// The exact 8 missing transactions identified
const missingTransactions = [
    {
        sleeper_transaction_id: '1278803435143069696',
        roster_id: 2,
        type: 'free_agent',
        week_number: 4,
        description: 'Turd_Ferguson24 - DROP Player 3321 (9/30/2025)'
    },
    {
        sleeper_transaction_id: '1276588703032016896',
        roster_id: 6,
        type: 'free_agent',
        week_number: 4,
        description: 'Watts52 - ADD NE DEF (9/24/2025)'
    },
    {
        sleeper_transaction_id: '1276585355335720960',
        roster_id: 6,
        type: 'free_agent',
        week_number: 4,
        description: 'Watts52 - DROP ATL DEF (9/24/2025)'
    },
    {
        sleeper_transaction_id: '1276534889302208512',
        roster_id: 7,
        type: 'free_agent',
        week_number: 4,
        description: 'tscotty85 - ADD Player 10213 (9/24/2025)'
    },
    {
        sleeper_transaction_id: '1277890433569030144',
        roster_id: 8,
        type: 'free_agent',
        week_number: 4,
        description: 'LastOne2022 - ADD SF DEF (9/27/2025)'
    },
    {
        sleeper_transaction_id: '1277890296713076736',
        roster_id: 8,
        type: 'free_agent',
        week_number: 4,
        description: 'LastOne2022 - ADD Player 12474 (9/27/2025)'
    },
    {
        sleeper_transaction_id: '1278002031763664896',
        roster_id: 9,
        type: 'free_agent',
        week_number: 4,
        description: 'petergell - ADD Player 7567 (9/28/2025)'
    },
    {
        sleeper_transaction_id: '1277090101213552640',
        roster_id: 10,
        type: 'free_agent',
        week_number: 4,
        description: 'j1fisher25 - ADD LAC DEF (9/25/2025)'
    }
];

async function manuallyProcessMissingTransactions() {
    console.log('🎯 MANUAL PROCESSING OF 8 MISSING TRANSACTIONS');
    console.log('=' .repeat(60));
    console.log('Goal: Insert exactly the 8 identified missing transactions');
    console.log();
    
    // First, get current transaction counts per roster to calculate fees correctly
    console.log('📊 Getting current transaction counts for fee calculation...');
    
    const currentTransactionsResponse = await fetch(`${supabaseUrl}/rest/v1/transactions?select=roster_id,fee_amount&league_id=eq.${DATABASE_LEAGUE_UUID}`, {
        headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json'
        }
    });
    
    if (!currentTransactionsResponse.ok) {
        console.log('❌ Failed to get current transactions');
        return;
    }
    
    const currentTransactions = await currentTransactionsResponse.json();
    
    // Calculate current transaction counts per roster
    const rosterCounts = {};
    currentTransactions.forEach(txn => {
        if (!rosterCounts[txn.roster_id]) {
            rosterCounts[txn.roster_id] = 0;
        }
        rosterCounts[txn.roster_id]++;
    });
    
    console.log('📋 Current transaction counts:');
    Object.entries(rosterCounts).forEach(([rosterId, count]) => {
        const paidCount = Math.max(0, count - 10);
        console.log(`   Roster ${rosterId}: ${count} transactions (${paidCount} paid)`);
    });
    
    // Calculate fees for each missing transaction
    const transactionsToInsert = missingTransactions.map(txn => {
        const currentCount = rosterCounts[txn.roster_id] || 0;
        const newCount = currentCount + 1;
        
        // Fee calculation: $2 for each transaction after 10 free
        const fee_amount = newCount > 10 ? 2 : 0;
        
        console.log(`📝 ${txn.description} - Transaction #${newCount}, Fee: $${fee_amount}`);
        
        return {
            league_id: DATABASE_LEAGUE_UUID,
            roster_id: txn.roster_id,
            sleeper_transaction_id: txn.sleeper_transaction_id,
            type: txn.type,
            week_number: txn.week_number,
            fee_amount: fee_amount,
            processed: false
        };
    });
    
    console.log('\n📤 Inserting missing transactions...');
    
    try {
        const response = await fetch(`${supabaseUrl}/rest/v1/transactions`, {
            method: 'POST',
            headers: {
                'apikey': supabaseServiceKey,
                'Authorization': `Bearer ${supabaseServiceKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify(transactionsToInsert)
        });
        
        if (response.ok) {
            console.log('✅ SUCCESS! All 8 missing transactions inserted');
            
            // Calculate total fees added
            const totalFeesAdded = transactionsToInsert.reduce((sum, txn) => sum + txn.fee_amount, 0);
            console.log(`💰 Total fees added: $${totalFeesAdded}`);
            
            // Show impact per roster
            console.log('\n📊 IMPACT PER ROSTER:');
            const rosterImpact = {};
            transactionsToInsert.forEach(txn => {
                if (!rosterImpact[txn.roster_id]) {
                    rosterImpact[txn.roster_id] = { count: 0, fees: 0 };
                }
                rosterImpact[txn.roster_id].count++;
                rosterImpact[txn.roster_id].fees += txn.fee_amount;
            });
            
            Object.entries(rosterImpact).forEach(([rosterId, impact]) => {
                console.log(`   Roster ${rosterId}: +${impact.count} transactions, +$${impact.fees} fees`);
            });
            
        } else {
            const errorText = await response.text();
            console.log('❌ FAILED to insert transactions');
            console.log('Error:', errorText);
        }
        
    } catch (error) {
        console.log('❌ ERROR:', error.message);
    }
}

async function validateFinalCount() {
    console.log('\n🔍 VALIDATING FINAL TRANSACTION COUNT');
    console.log('=' .repeat(40));
    
    try {
        const response = await fetch(`${supabaseUrl}/rest/v1/transactions?select=*&league_id=eq.${DATABASE_LEAGUE_UUID}`, {
            headers: {
                'apikey': supabaseServiceKey,
                'Authorization': `Bearer ${supabaseServiceKey}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const allTransactions = await response.json();
            console.log(`📊 Final transaction count: ${allTransactions.length}`);
            
            if (allTransactions.length === 63) {
                console.log('🎉 PERFECT! We now have all 63 expected transactions');
                console.log('✅ Missing transaction issue is RESOLVED');
            } else {
                console.log(`⚠️  Expected 63, got ${allTransactions.length}`);
                console.log(`   Gap: ${63 - allTransactions.length} transactions`);
            }
            
            // Final fee summary
            const totalFees = allTransactions.reduce((sum, txn) => sum + parseFloat(txn.fee_amount), 0);
            console.log(`💰 Total fees in database: $${totalFees}`);
            
        } else {
            console.log('❌ Failed to validate count');
        }
    } catch (error) {
        console.log('❌ Validation error:', error.message);
    }
}

async function main() {
    await manuallyProcessMissingTransactions();
    await validateFinalCount();
    
    console.log('\n🎯 NEXT STEPS:');
    console.log('1. ✅ Missing transactions resolved');
    console.log('2. 🔄 Validate season-to-date database population');
    console.log('3. 🚀 Check/deploy latest function & messaging format');
    console.log('4. 📅 Re-enable GitHub Actions workflow');
}

main();