// Check actual database transaction data
const supabaseUrl = 'https://jfeuobfjgqownybluvje.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmZXVvYmZqZ3Fvd255Ymx1dmplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTU1MjU4NSwiZXhwIjoyMDcxMTI4NTg1fQ.TYZBL4UNLEJN6ovM6HQS5wxm2zkbZHBYtmQYALHDkqQ';
const DATABASE_LEAGUE_UUID = 'a7d65b53-2ec5-4b38-94ee-7fcb97160989';

async function checkDatabaseTransactions() {
    console.log('🔍 CHECKING DATABASE TRANSACTION DATA');
    
    const response = await fetch(`${supabaseUrl}/rest/v1/transactions?league_id=eq.${DATABASE_LEAGUE_UUID}&select=*`, {
        headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`
        }
    });
    const transactions = await response.json();
    
    console.log(`\n📊 DATABASE TRANSACTIONS: ${transactions.length} total`);
    
    // Group by roster and type
    const transactionsByRoster = {};
    const august24Cutoff = new Date('2025-08-24T00:00:00Z');
    
    transactions.forEach(t => {
        if (!transactionsByRoster[t.roster_id]) {
            transactionsByRoster[t.roster_id] = { total: 0, postDraft: 0, types: {} };
        }
        
        transactionsByRoster[t.roster_id].total++;
        
        if (new Date(t.created_at) >= august24Cutoff && ['waiver', 'free_agent'].includes(t.type)) {
            transactionsByRoster[t.roster_id].postDraft++;
        }
        
        if (!transactionsByRoster[t.roster_id].types[t.type]) {
            transactionsByRoster[t.roster_id].types[t.type] = 0;
        }
        transactionsByRoster[t.roster_id].types[t.type]++;
    });
    
    console.log('\n🎯 TRANSACTION ANALYSIS BY ROSTER:');
    Object.entries(transactionsByRoster).forEach(([rosterId, data]) => {
        const feesOwed = Math.max(0, data.postDraft - 10) * 2;
        const freeRemaining = Math.max(0, 10 - data.postDraft);
        console.log(`Roster ${rosterId}: ${data.postDraft} countable transactions, ${freeRemaining} free remaining, $${feesOwed} owed`);
        console.log(`  Types: ${JSON.stringify(data.types)}`);
    });
    
    const totalFees = Object.values(transactionsByRoster).reduce((sum, data) => {
        return sum + Math.max(0, data.postDraft - 10) * 2;
    }, 0);
    
    console.log(`\n💰 TOTAL TRANSACTION FEES: $${totalFees}`);
}

checkDatabaseTransactions().catch(console.error);