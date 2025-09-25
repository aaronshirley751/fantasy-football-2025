// 🔍 DEEP AUDIT - SHOW SLEEPER API DATA AND DATABASE STATE
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmZXVvYmZqZ3Fvd255Ymx1dmplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1NTI1ODUsImV4cCI6MjA3MTEyODU4NX0.7qu0h_cKNpdW1ZENZ3652LE75MC6VQp9Ahu5SSDypuY';

const deepAudit = async () => {
  console.log('🔍 DEEP AUDIT - SLEEPER API + DATABASE STATE');
  console.log('='.repeat(55));
  
  const SLEEPER_LEAGUE_ID = '1249067741470539776';
  
  console.log('🌐 FETCHING SLEEPER API DATA...');
  
  // Fetch Week 1 transactions directly from Sleeper
  const week1Response = await fetch(`https://api.sleeper.app/v1/league/${SLEEPER_LEAGUE_ID}/transactions/1`);
  const week1Transactions = await week1Response.json();
  
  console.log(`📊 Week 1 Sleeper Transactions: ${week1Transactions?.length || 0}`);
  
  if (week1Transactions && week1Transactions.length > 0) {
    console.log('📋 FIRST FEW TRANSACTIONS:');
    week1Transactions.slice(0, 3).forEach((t, i) => {
      console.log(`   ${i+1}. ID: ${t.transaction_id}`);
      console.log(`      Type: ${t.type}`);
      console.log(`      Status: ${t.status}`);
      console.log(`      Created: ${new Date(t.created).toISOString()}`);
      console.log(`      Roster IDs: ${t.roster_ids?.join(', ')}`);
      console.log('');
    });
  }
  
  // Test the debug-league function to see database state
  console.log('🗄️ CHECKING DATABASE STATE...');
  
  const debugResponse = await fetch(
    'https://jfeuobfjgqownybluvje.supabase.co/functions/v1/debug-league',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ANON_KEY}`
      },
      body: JSON.stringify({
        action: 'show_transactions',
        league_id: 'a7d65b53-2ec5-4b38-94ee-7fcb97160989'
      })
    }
  );
  
  const debugData = await debugResponse.json();
  console.log('📊 DATABASE TRANSACTIONS:');
  console.log(JSON.stringify(debugData, null, 2));
  
  console.log('\n🔍 AUDIT COMPLETE - Raw data from both Sleeper API and Database shown above');
};

deepAudit().catch(console.error);