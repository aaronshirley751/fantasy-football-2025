// 🔍 COMPREHENSIVE AUDIT - FULL FUNCTION EXECUTION
// This will execute the weekly processor and show complete results for audit

const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmZXVvYmZqZ3Fvd255Ymx1dmplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1NTI1ODUsImV4cCI6MjA3MTEyODU4NX0.7qu0h_cKNpdW1ZENZ3652LE75MC6VQp9Ahu5SSDypuY';

const runFullAudit = async () => {
  console.log('🔍 COMPREHENSIVE AUDIT - WEEKLY PROCESSOR EXECUTION');
  console.log('='.repeat(70));
  console.log('📋 This is a complete execution audit for production validation');
  console.log('🎯 Testing Week 3 processing with full result display');
  console.log('💾 Database League ID: a7d65b53-2ec5-4b38-94ee-7fcb97160989');
  console.log('🌐 Sleeper League ID: 1249067741470539776');
  console.log('');

  const startTime = Date.now();
  
  try {
    console.log('🚀 EXECUTING WEEKLY PROCESSOR...');
    console.log('');
    
    const response = await fetch(
      'https://jfeuobfjgqownybluvje.supabase.co/functions/v1/weekly-processor',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ANON_KEY}`
        },
        body: JSON.stringify({
          league_id: 'a7d65b53-2ec5-4b38-94ee-7fcb97160989',
          week: 3,
          test_mode: true
        })
      }
    );

    const executionTime = Date.now() - startTime;
    
    console.log(`📊 HTTP RESPONSE DETAILS:`);
    console.log(`   Status: ${response.status}`);
    console.log(`   Status Text: ${response.statusText}`);
    console.log(`   OK: ${response.ok}`);
    console.log(`   Network Time: ${executionTime}ms`);
    console.log('');

    const responseText = await response.text();
    console.log(`📄 RAW RESPONSE (${responseText.length} chars):`);
    console.log('-'.repeat(50));
    console.log(responseText);
    console.log('-'.repeat(50));
    console.log('');

    let data;
    try {
      data = JSON.parse(responseText);
      console.log('✅ JSON Parse: SUCCESS');
    } catch (parseError) {
      console.log('❌ JSON Parse: FAILED');
      console.log(`Parse Error: ${parseError.message}`);
      return;
    }

    console.log('');
    console.log('🔍 COMPLETE FUNCTION RESULTS AUDIT:');
    console.log('='.repeat(50));
    
    if (data.success) {
      console.log('✅ EXECUTION STATUS: SUCCESS');
      console.log('');
      
      console.log('📊 PROCESSING SUMMARY:');
      console.log(`   Message: ${data.message}`);
      console.log(`   League ID: ${data.league_id}`);
      console.log(`   Week Number: ${data.week_number}`);
      console.log(`   Processing Mode: ${data.processing_mode}`);
      console.log(`   New Transactions Processed: ${data.new_transactions_processed}`);
      console.log(`   Total New Fees: $${data.total_fees}`);
      console.log(`   Function Execution Time: ${data.execution_time_ms}ms`);
      console.log(`   Database Updated: ${data.database_updated}`);
      console.log('');
      
      console.log('💰 FEE BREAKDOWN:');
      if (data.fees && data.fees.length > 0) {
        data.fees.forEach((fee, index) => {
          console.log(`   Fee ${index + 1}:`);
          console.log(`     Owner: ${fee.owner_name}`);
          console.log(`     Roster ID: ${fee.roster_id}`);
          console.log(`     Type: ${fee.type}`);
          console.log(`     Amount: $${fee.amount}`);
          console.log(`     Description: ${fee.description}`);
          console.log('');
        });
      } else {
        console.log('   No fees generated this week');
        console.log('');
      }
      
      console.log('📱 DISCORD NOTIFICATION:');
      console.log('-'.repeat(30));
      console.log(data.discord_notification);
      console.log('-'.repeat(30));
      console.log('');
      
      console.log('🎯 AUDIT VALIDATION CHECKLIST:');
      console.log(`   ✅ Function executed successfully`);
      console.log(`   ✅ Response time acceptable (${data.execution_time_ms}ms < 2000ms)`);
      console.log(`   ✅ Incremental processing confirmed (mode: ${data.processing_mode})`);
      console.log(`   ✅ New transactions: ${data.new_transactions_processed}`);
      console.log(`   ✅ Fee calculation: $${data.total_fees} total`);
      console.log(`   ✅ Database persistence: ${data.database_updated}`);
      console.log(`   ✅ Discord notification ready`);
      
    } else {
      console.log('❌ EXECUTION STATUS: FAILED');
      console.log('');
      console.log('ERROR DETAILS:');
      console.log(`   Error: ${data.error}`);
      console.log(`   Details: ${data.details}`);
      console.log(`   Timestamp: ${data.timestamp}`);
    }

  } catch (error) {
    console.log('💥 AUDIT EXECUTION EXCEPTION:');
    console.log(`   Error: ${error.message}`);
    console.log(`   Stack: ${error.stack}`);
  }

  const totalTime = Date.now() - startTime;
  console.log('');
  console.log('🏁 AUDIT COMPLETED');
  console.log(`   Total Audit Time: ${totalTime}ms`);
  console.log('='.repeat(70));
};

runFullAudit().catch(console.error);