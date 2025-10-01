// Get full transaction count and summary
const supabaseUrl = 'https://jfeuobfjgqownybluvje.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmZXVvYmZqZ3Fvd255Ymx1dmplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTU1MjU4NSwiZXhwIjoyMDcxMTI4NTg1fQ.TYZBL4UNLEJN6ovM6HQS5wxm2zkbZHBYtmQYALHDkqQ';

async function getFullTransactionSummary() {
    console.log('📊 FINAL TRANSACTION DATABASE SUMMARY');
    console.log('=' .repeat(60));
    
    try {
        // Get total count
        const countResponse = await fetch(`${supabaseUrl}/rest/v1/transactions?select=*&league_id=eq.a7d65b53-2ec5-4b38-94ee-7fcb97160989`, {
            headers: {
                'apikey': supabaseServiceKey,
                'Authorization': `Bearer ${supabaseServiceKey}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!countResponse.ok) {
            console.log(`❌ Failed to get transactions: ${countResponse.status}`);
            return;
        }
        
        const allTransactions = await countResponse.json();
        console.log(`✅ TOTAL TRANSACTIONS IN DATABASE: ${allTransactions.length}`);
        
        // Group by roster
        const byRoster = {};
        allTransactions.forEach(txn => {
            if (!byRoster[txn.roster_id]) {
                byRoster[txn.roster_id] = [];
            }
            byRoster[txn.roster_id].push(txn);
        });
        
        console.log('\n📋 BREAKDOWN BY ROSTER:');
        Object.entries(byRoster).forEach(([rosterId, transactions]) => {
            const paidTxns = transactions.filter(t => t.fee_amount > 0).length;
            const totalFees = transactions.reduce((sum, t) => sum + parseFloat(t.fee_amount), 0);
            console.log(`   Roster ${rosterId}: ${transactions.length} transactions, $${totalFees} in fees (${paidTxns} paid)`);
        });
        
        // Compare to our audit expectation
        console.log('\n🔍 COMPARISON TO AUDIT RESULTS:');
        console.log(`   Expected: 63 transactions (from audit)`);
        console.log(`   Actual: ${allTransactions.length} transactions (in database)`);
        
        if (allTransactions.length >= 63) {
            console.log('   ✅ SUCCESS! Database has equal or more transactions than expected');
            console.log('   🎉 Transaction backfill appears to be COMPLETE!');
        } else {
            console.log(`   ⚠️  Missing: ${63 - allTransactions.length} transactions`);
        }
        
        // Show recent transactions
        console.log('\n📋 MOST RECENT TRANSACTIONS:');
        const recent = allTransactions
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 5);
        
        recent.forEach((txn, index) => {
            const date = new Date(txn.created_at).toLocaleDateString();
            console.log(`   ${index + 1}. Roster ${txn.roster_id}: ${txn.type} (${date}) - $${txn.fee_amount}`);
        });
        
    } catch (error) {
        console.log('❌ Error getting transaction summary:', error.message);
    }
}

getFullTransactionSummary();