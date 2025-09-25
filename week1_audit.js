// 🔍 AUDIT WEEK 1 - SHOW TRANSACTION PROCESSING
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmZXVvYmZqZ3Fvd255Ymx1dmplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1NTI1ODUsImV4cCI6MjA3MTEyODU4NX0.7qu0h_cKNpdW1ZENZ3652LE75MC6VQp9Ahu5SSDypuY';

const auditWeek1 = async () => {
  console.log('🔍 AUDIT: WEEK 1 PROCESSING (TRANSACTION DEMONSTRATION)');
  console.log('='.repeat(60));
  
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
        week: 1
      })
    }
  );

  const data = await response.json();
  console.log('📊 WEEK 1 RESULTS:');
  console.log(JSON.stringify(data, null, 2));
  
  if (data.success) {
    console.log('\n✅ WEEK 1 AUDIT SUMMARY:');
    console.log(`   New Transactions: ${data.new_transactions_processed}`);
    console.log(`   New Fees: $${data.total_fees}`);
    console.log(`   Execution Time: ${data.execution_time_ms}ms`);
  }
};

auditWeek1().catch(console.error);