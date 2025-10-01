// DATABASE VS API TRANSACTION AUDIT
// Find exactly which 2 transactions are missing from database

async function databaseVsApiTransactionAudit() {
  const fetch = (await import('node-fetch')).default;
  
  console.log('🔍 DATABASE VS API TRANSACTION AUDIT');
  console.log('🎯 Finding the missing 2 transactions causing $6.00 vs $10.00 discrepancy');
  console.log('=' .repeat(80));
  console.log('');
  
  const workingKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmZXVvYmZqZ3Fvd255Ymx1dmplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1NTI1ODUsImV4cCI6MjA3MTEyODU4NX0.7qu0h_cKNpdW1ZENZ3652LE75MC6VQp9Ahu5SSDypuY';
  const DATABASE_LEAGUE_ID = 'a7d65b53-2ec5-4b38-94ee-7fcb97160989';
  
  // All 15 API transactions with their Sleeper IDs
  const apiTransactions = [
    { id: '1265408466470567936', date: '8/24/2025', time: '1:16:37 PM', action: 'DROP Isaiah Likely' },
    { id: '1265408620720300032', date: '8/24/2025', time: '1:17:14 PM', action: 'ADD Rachaad White' },
    { id: '1265408646020341760', date: '8/24/2025', time: '1:17:20 PM', action: 'ADD Ray Davis' },
    { id: '1266291967709433856', date: '8/26/2025', time: '11:47:20 PM', action: 'ADD Austin Ekeler + DROP Rachaad White' },
    { id: '1266292014027128832', date: '8/26/2025', time: '11:47:32 PM', action: 'DROP Joe Mixon' },
    { id: '1269088899817295872', date: '9/3/2025', time: '5:01:21 PM', action: 'ADD Ollie Gordon + DROP Ray Davis' },
    { id: '1272212358067945473', date: '9/12/2025', time: '7:52:52 AM', action: 'ADD Romeo Doubs + DROP Ollie Gordon' },
    { id: '1272216878902681600', date: '9/12/2025', time: '8:10:49 AM', action: 'ADD Justin Fields + DROP Romeo Doubs' },
    { id: '1273731725926621184', date: '9/16/2025', time: '12:30:17 PM', action: 'DROP Austin Ekeler' },
    { id: '1274035238900629504', date: '9/17/2025', time: '8:36:20 AM', action: 'ADD ATL DEF + DROP PIT DEF' },
    { id: '1274035387290886144', date: '9/17/2025', time: '8:36:56 AM', action: 'ADD Romeo Doubs' },
    { id: '1274253173569122304', date: '9/17/2025', time: '11:02:20 PM', action: 'DROP Justin Fields' },
    { id: '1274467863377231872', date: '9/18/2025', time: '1:15:26 PM', action: 'ADD Rashee Rice' },
    { id: '1276585355335720960', date: '9/24/2025', time: '9:29:35 AM', action: 'DROP ATL DEF' },
    { id: '1276588703032016896', date: '9/24/2025', time: '9:42:53 AM', action: 'ADD NE DEF' }
  ];
  
  try {
    console.log('🔍 STEP 1: GET DATABASE TRANSACTIONS');
    console.log('-' .repeat(50));
    
    const dbResponse = await fetch(`https://jfeuobfjgqownybluvje.supabase.co/rest/v1/transactions?league_id=eq.${DATABASE_LEAGUE_ID}&roster_id=eq.6&select=*&order=created_at`, {
      headers: {
        'apikey': workingKey,
        'Authorization': `Bearer ${workingKey}`
      }
    });
    
    const dbTransactions = await dbResponse.json();
    
    if (!Array.isArray(dbTransactions)) {
      console.log('❌ Database query error:', dbTransactions);
      return;
    }
    
    console.log(`Database transactions for Watts52: ${dbTransactions.length}`);
    console.log(`API transactions: ${apiTransactions.length}`);
    console.log(`Missing: ${apiTransactions.length - dbTransactions.length}`);
    console.log('');
    
    console.log('🔍 STEP 2: MAP DATABASE TRANSACTIONS');
    console.log('-' .repeat(50));
    
    console.log('Database transactions:');
    dbTransactions.forEach((t, index) => {
      console.log(`${String(index + 1).padStart(2, ' ')}. ID: ${t.sleeper_transaction_id || 'NO_ID'}`);
      console.log(`    Week: ${t.week_number}`);
      console.log(`    Fee: $${t.fee_amount}`);
      console.log(`    Date: ${t.created_at}`);
      console.log(`    Type: ${t.transaction_type}`);
      console.log('');
    });
    
    console.log('🔍 STEP 3: IDENTIFY MISSING TRANSACTIONS');
    console.log('-' .repeat(50));
    
    const dbSleeperIds = new Set(dbTransactions.map(t => t.sleeper_transaction_id).filter(id => id));
    const apiSleeperIds = new Set(apiTransactions.map(t => t.id));
    
    const missingInDb = apiTransactions.filter(t => !dbSleeperIds.has(t.id));
    const extraInDb = dbTransactions.filter(t => t.sleeper_transaction_id && !apiSleeperIds.has(t.sleeper_transaction_id));
    
    console.log(`Missing in database: ${missingInDb.length}`);
    console.log(`Extra in database: ${extraInDb.length}`);
    console.log('');
    
    if (missingInDb.length > 0) {
      console.log('❌ MISSING TRANSACTIONS IN DATABASE:');
      missingInDb.forEach((t, index) => {
        console.log(`${index + 1}. ${t.id} - ${t.date} ${t.time}`);
        console.log(`   ${t.action}`);
        console.log('');
      });
    }
    
    if (extraInDb.length > 0) {
      console.log('⚠️ EXTRA TRANSACTIONS IN DATABASE:');
      extraInDb.forEach((t, index) => {
        console.log(`${index + 1}. ${t.sleeper_transaction_id}`);
        console.log(`   Week: ${t.week_number}, Fee: $${t.fee_amount}`);
        console.log('');
      });
    }
    
    console.log('🔍 STEP 4: FEE CALCULATION ANALYSIS');
    console.log('-' .repeat(50));
    
    const totalDbFees = dbTransactions.reduce((sum, t) => sum + t.fee_amount, 0);
    const expectedFees = Math.max(0, (apiTransactions.length - 10) * 2);
    
    console.log(`Database total fees: $${totalDbFees.toFixed(2)}`);
    console.log(`Expected fees (${apiTransactions.length} transactions - 10 free × $2): $${expectedFees.toFixed(2)}`);
    console.log(`Discrepancy: $${(expectedFees - totalDbFees).toFixed(2)}`);
    console.log('');
    
    // Analyze fee pattern
    console.log('🔍 STEP 5: FEE PATTERN ANALYSIS');
    console.log('-' .repeat(50));
    
    const freeTransactionsSeen = dbTransactions.filter(t => t.fee_amount === 0).length;
    const paidTransactionsSeen = dbTransactions.filter(t => t.fee_amount > 0).length;
    
    console.log(`Free transactions in DB: ${freeTransactionsSeen}`);
    console.log(`Paid transactions in DB: ${paidTransactionsSeen}`);
    console.log(`Expected free transactions: 10`);
    console.log(`Expected paid transactions: ${Math.max(0, apiTransactions.length - 10)}`);
    
    if (missingInDb.length === 2 && (expectedFees - totalDbFees) === 4) {
      console.log('');
      console.log('✅ CONFIRMED: Missing exactly 2 paid transactions worth $4.00');
      console.log('The database is missing 2 transactions that should have $2 fees each');
    }
    
  } catch (error) {
    console.error('❌ Error in database vs API audit:', error);
  }
}

databaseVsApiTransactionAudit();