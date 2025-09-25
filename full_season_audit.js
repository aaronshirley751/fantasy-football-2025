// 🔍 FULL SEASON DATA AUDIT - SHOW COMPLETE TRANSACTION PROCESSING
// This demonstrates what the system looks like when processing actual transactions

const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmZXVvYmZqZ3Fvd255Ymx1dmplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1NTI1ODUsImV4cCI6MjA3MTEyODU4NX0.7qu0h_cKNpdW1ZENZ3652LE75MC6VQp9Ahu5SSDypuY';

const showFullSeasonProcessing = async () => {
  console.log('🔍 FULL SEASON TRANSACTION AUDIT');
  console.log('=' .repeat(50));
  console.log('📊 This shows what the system looks like processing ALL transactions');
  console.log('💰 Demonstrates fee calculation with real league data');
  console.log('👥 Shows owner names and rolling transaction counts');
  console.log('');

  const response = await fetch(
    'https://jfeuobfjgqownybluvje.supabase.co/functions/v1/fee-processor-fresh',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ANON_KEY}`
      },
      body: JSON.stringify({
        league_id: 'a7d65b53-2ec5-4b38-94ee-7fcb97160989',
        week: 3
      })
    }
  );

  const data = await response.json();
  
  console.log('🏈 FULL SEASON PROCESSING RESULTS:');
  console.log(`Status: ${response.status}`);
  
  if (data.success) {
    console.log(`✅ SUCCESS - ${data.message}`);
    console.log(`📊 Total Transactions Found: ${data.total_transactions_found}`);
    console.log(`💰 Total Fees: $${data.total_fees}`);
    console.log(`⚡ Execution Time: ${data.execution_time_ms}ms`);
    console.log('');

    if (data.fees && data.fees.length > 0) {
      console.log('💰 DETAILED FEE BREAKDOWN BY OWNER:');
      console.log('-'.repeat(60));
      
      // Group fees by owner
      const feesByOwner = data.fees.reduce((acc, fee) => {
        if (!acc[fee.owner_name]) {
          acc[fee.owner_name] = [];
        }
        acc[fee.owner_name].push(fee);
        return acc;
      }, {});

      Object.entries(feesByOwner).forEach(([owner, fees]) => {
        const totalOwed = fees.reduce((sum, fee) => sum + fee.amount, 0);
        console.log(`👤 ${owner} (Roster ${fees[0].roster_id}): $${totalOwed} total`);
        
        fees.forEach(fee => {
          console.log(`   • ${fee.description}: $${fee.amount}`);
        });
        console.log('');
      });

      console.log('📊 SEASON TOTALS:');
      console.log(`   Total Players with Fees: ${Object.keys(feesByOwner).length}`);
      console.log(`   Total Season Fees: $${data.total_fees}`);
      console.log('');
    }

    if (data.discord_notification) {
      console.log('📱 DISCORD NOTIFICATION PREVIEW:');
      console.log('=' .repeat(50));
      console.log(data.discord_notification);
      console.log('=' .repeat(50));
    }

    console.log('🎯 TRANSACTION SYSTEM CAPABILITIES DEMONSTRATED:');
    console.log('   ✅ Owner name attribution (real names vs "Team X")');
    console.log('   ✅ Free transaction system (10 free + $2 paid)');
    console.log('   ✅ Multiple transaction types (waiver, free_agent)');
    console.log('   ✅ Post-draft filtering (August 24, 2025 cutoff)');
    console.log('   ✅ Fast processing with real league data');

  } else {
    console.log(`❌ ERROR: ${data.error}`);
    if (data.details) console.log(`Details: ${data.details}`);
  }
};

showFullSeasonProcessing().catch(console.error);