// WATTS52 TRANSACTION AUDIT
// Detailed audit of all transactions for Watts52 (roster 6)

async function auditWatts52Transactions() {
  const fetch = (await import('node-fetch')).default;
  
  console.log('🔍 WATTS52 (Roster 6) TRANSACTION AUDIT');
  console.log('🎯 Detailed breakdown of all transactions and fees');
  console.log('=' .repeat(80));
  console.log('');
  
  const workingKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmZXVvYmZqZ3Fvd255Ymx1dmplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1NTI1ODUsImV4cCI6MjA3MTEyODU4NX0.7qu0h_cKNpdW1ZENZ3652LE75MC6VQp9Ahu5SSDypuY';
  
  try {
    // Get all Watts52 transactions
    const response = await fetch(`https://jfeuobfjgqownybluvje.supabase.co/rest/v1/transactions?league_id=eq.a7d65b53-2ec5-4b38-94ee-7fcb97160989&roster_id=eq.6&select=*&order=week_number,created_at`, {
      headers: {
        'apikey': workingKey,
        'Authorization': `Bearer ${workingKey}`
      }
    });
    
    const transactions = await response.json();
    
    console.log('📊 TRANSACTION SUMMARY:');
    console.log('-' .repeat(50));
    console.log(`Total Transactions: ${transactions.length}`);
    
    let totalFees = 0;
    let paidTransactions = 0;
    let freeTransactions = 0;
    
    const weeklyBreakdown = {};
    
    transactions.forEach((t, index) => {
      const week = t.week_number;
      if (!weeklyBreakdown[week]) {
        weeklyBreakdown[week] = { count: 0, fees: 0, transactions: [] };
      }
      
      weeklyBreakdown[week].count++;
      weeklyBreakdown[week].fees += t.fee_amount;
      weeklyBreakdown[week].transactions.push(t);
      
      totalFees += t.fee_amount;
      if (t.fee_amount > 0) {
        paidTransactions++;
      } else {
        freeTransactions++;
      }
    });
    
    console.log(`Free Transactions: ${freeTransactions}`);
    console.log(`Paid Transactions: ${paidTransactions}`);
    console.log(`Total Fees: $${totalFees.toFixed(2)}`);
    console.log('');
    
    console.log('📅 WEEKLY BREAKDOWN:');
    console.log('-' .repeat(50));
    
    Object.keys(weeklyBreakdown).sort((a, b) => parseInt(a) - parseInt(b)).forEach(week => {
      const data = weeklyBreakdown[week];
      console.log(`Week ${week}: ${data.count} transactions, $${data.fees.toFixed(2)} in fees`);
      
      data.transactions.forEach((t, index) => {
        const date = new Date(t.created_at).toLocaleDateString();
        const feeStatus = t.fee_amount > 0 ? `$${t.fee_amount.toFixed(2)} FEE` : 'FREE';
        console.log(`  ${index + 1}. ${t.type} transaction (${feeStatus}) - ${date}`);
        console.log(`     ID: ${t.sleeper_transaction_id}`);
      });
      console.log('');
    });
    
    console.log('🔍 FEE CALCULATION ANALYSIS:');
    console.log('-' .repeat(50));
    
    // Calculate expected fees based on 10 free transactions rule
    const FREE_LIMIT = 10;
    console.log(`Total Transactions: ${transactions.length}`);
    console.log(`Free Transaction Limit: ${FREE_LIMIT}`);
    
    if (transactions.length > FREE_LIMIT) {
      const expectedPaidTransactions = transactions.length - FREE_LIMIT;
      const expectedFees = expectedPaidTransactions * 2;
      console.log(`Expected Paid Transactions: ${expectedPaidTransactions}`);
      console.log(`Expected Total Fees: $${expectedFees.toFixed(2)}`);
      console.log(`Actual Total Fees: $${totalFees.toFixed(2)}`);
      console.log(`Difference: $${(totalFees - expectedFees).toFixed(2)}`);
    } else {
      console.log(`All transactions should be FREE (under ${FREE_LIMIT} limit)`);
      console.log(`Expected Fees: $0.00`);
      console.log(`Actual Fees: $${totalFees.toFixed(2)}`);
      if (totalFees > 0) {
        console.log(`❌ ERROR: Should have no fees!`);
      }
    }
    
    console.log('');
    console.log('💰 SEASON CONTEXT:');
    console.log('-' .repeat(50));
    
    const freeRemaining = Math.max(0, FREE_LIMIT - freeTransactions);
    console.log(`Free Transactions Used: ${freeTransactions}`);
    console.log(`Free Transactions Remaining: ${freeRemaining}`);
    console.log(`Paid Transactions: ${paidTransactions}`);
    
  } catch (error) {
    console.error('❌ Error auditing Watts52 transactions:', error);
  }
}

auditWatts52Transactions();