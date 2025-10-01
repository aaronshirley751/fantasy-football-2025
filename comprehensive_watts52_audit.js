// COMPREHENSIVE WATTS52 AUDIT: Database vs Sleeper API
// Deep investigation of transaction counting and data integrity

async function comprehensiveWatts52Audit() {
  const fetch = (await import('node-fetch')).default;
  
  console.log('🔍 COMPREHENSIVE WATTS52 AUDIT - Database vs Sleeper API');
  console.log('🎯 Investigating transaction counting logic and data integrity');
  console.log('=' .repeat(80));
  console.log('');
  
  const workingKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmZXVvYmZqZ3Fvd255Ymx1dmplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1NTI1ODUsImV4cCI6MjA3MTEyODU4NX0.7qu0h_cKNpdW1ZENZ3652LE75MC6VQp9Ahu5SSDypuY';
  const SLEEPER_LEAGUE_ID = '1249067741470539776'; // 2025 live league
  const DATABASE_LEAGUE_ID = 'a7d65b53-2ec5-4b38-94ee-7fcb97160989'; // Test database
  
  // August 24, 2025 cutoff rule
  const draftCutoff = new Date('2025-08-24T00:00:00Z').getTime();
  console.log('📅 CUTOFF DATE:', new Date(draftCutoff).toISOString());
  console.log('   Only transactions on/after this date count toward fees');
  console.log('');
  
  try {
    // 1. Get Watts52's roster ID mapping
    console.log('🔍 STEP 1: IDENTIFYING WATTS52 ROSTER MAPPING');
    console.log('-' .repeat(50));
    
    const [sleepUsersRes, sleepRostersRes] = await Promise.all([
      fetch(`https://api.sleeper.app/v1/league/${SLEEPER_LEAGUE_ID}/users`),
      fetch(`https://api.sleeper.app/v1/league/${SLEEPER_LEAGUE_ID}/rosters`)
    ]);
    
    const sleepUsers = await sleepUsersRes.json();
    const sleepRosters = await sleepRostersRes.json();
    
    const watts52User = sleepUsers.find(u => u.display_name === 'Watts52');
    const watts52Roster = sleepRosters.find(r => r.owner_id === watts52User.user_id);
    
    console.log(`Watts52 User ID: ${watts52User.user_id}`);
    console.log(`Watts52 Roster ID: ${watts52Roster.roster_id}`);
    console.log('');
    
    // 2. Get ALL transactions from Sleeper API
    console.log('🔍 STEP 2: FETCHING ALL TRANSACTIONS FROM SLEEPER API');
    console.log('-' .repeat(50));
    
    const allSleeperTransactions = [];
    
    // Get transactions for all weeks (Sleeper API is paginated by week)
    for (let week = 1; week <= 18; week++) {
      try {
        const transRes = await fetch(`https://api.sleeper.app/v1/league/${SLEEPER_LEAGUE_ID}/transactions/${week}`);
        if (transRes.ok) {
          const weekTransactions = await transRes.json();
          allSleeperTransactions.push(...weekTransactions);
        }
      } catch (e) {
        console.log(`Week ${week}: No transactions or API error`);
      }
    }
    
    console.log(`Total Sleeper transactions found: ${allSleeperTransactions.length}`);
    
    // 3. Filter for Watts52 transactions only
    const watts52SleeperTransactions = allSleeperTransactions.filter(t => 
      t.roster_ids && t.roster_ids.includes(watts52Roster.roster_id)
    );
    
    console.log(`Watts52 transactions in Sleeper: ${watts52SleeperTransactions.length}`);
    console.log('');
    
    // 4. Apply August 24 cutoff rule
    console.log('🔍 STEP 3: APPLYING AUGUST 24 CUTOFF RULE');
    console.log('-' .repeat(50));
    
    const postDraftTransactions = watts52SleeperTransactions.filter(t => t.created >= draftCutoff);
    const preDraftTransactions = watts52SleeperTransactions.filter(t => t.created < draftCutoff);
    
    console.log(`Pre-draft transactions (before Aug 24): ${preDraftTransactions.length}`);
    console.log(`Post-draft transactions (Aug 24+): ${postDraftTransactions.length}`);
    console.log('');
    
    // 5. Analyze post-draft transactions by type
    console.log('🔍 STEP 4: ANALYZING POST-DRAFT TRANSACTIONS BY TYPE');
    console.log('-' .repeat(50));
    
    const countableTransactions = postDraftTransactions.filter(t => ['waiver', 'free_agent'].includes(t.type));
    const tradeTransactions = postDraftTransactions.filter(t => t.type === 'trade');
    
    console.log(`Post-draft waiver/free_agent transactions: ${countableTransactions.length}`);
    console.log(`Post-draft trades (always free): ${tradeTransactions.length}`);
    console.log('');
    
    // 6. Show detailed breakdown of countable transactions
    console.log('📋 DETAILED COUNTABLE TRANSACTIONS:');
    console.log('-' .repeat(50));
    
    countableTransactions.forEach((t, index) => {
      const date = new Date(t.created).toLocaleDateString();
      const time = new Date(t.created).toLocaleTimeString();
      console.log(`${index + 1}. ${t.type.toUpperCase()} - ${date} ${time}`);
      console.log(`   Transaction ID: ${t.transaction_id}`);
      console.log(`   Week: ${t.week || 'Unknown'}`);
    });
    
    console.log('');
    
    // 7. Get database transactions for comparison
    console.log('🔍 STEP 5: COMPARING WITH DATABASE TRANSACTIONS');
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
    console.log('');
    
    // 8. Compare Sleeper IDs
    console.log('🔍 STEP 6: SLEEPER TRANSACTION ID COMPARISON');
    console.log('-' .repeat(50));
    
    const sleeperIds = new Set(countableTransactions.map(t => t.transaction_id));
    const dbIds = new Set(dbTransactions.map(t => t.sleeper_transaction_id));
    
    const missingInDb = [...sleeperIds].filter(id => !dbIds.has(id));
    const extraInDb = [...dbIds].filter(id => !sleeperIds.has(id));
    
    console.log(`Sleeper countable transaction IDs: ${sleeperIds.size}`);
    console.log(`Database transaction IDs: ${dbIds.size}`);
    console.log(`Missing in database: ${missingInDb.length}`);
    console.log(`Extra in database: ${extraInDb.length}`);
    
    if (missingInDb.length > 0) {
      console.log('');
      console.log('❌ MISSING TRANSACTIONS IN DATABASE:');
      missingInDb.forEach(id => {
        const transaction = countableTransactions.find(t => t.transaction_id === id);
        const date = new Date(transaction.created).toLocaleDateString();
        console.log(`   ${id} - ${transaction.type} on ${date}`);
      });
    }
    
    if (extraInDb.length > 0) {
      console.log('');
      console.log('⚠️ EXTRA TRANSACTIONS IN DATABASE:');
      extraInDb.forEach(id => {
        const transaction = dbTransactions.find(t => t.sleeper_transaction_id === id);
        console.log(`   ${id} - Week ${transaction.week_number}`);
      });
    }
    
    // 9. Fee calculation analysis
    console.log('');
    console.log('🔍 STEP 7: FEE CALCULATION ANALYSIS');
    console.log('-' .repeat(50));
    
    const FREE_LIMIT = 10;
    console.log(`Countable transactions from Sleeper: ${countableTransactions.length}`);
    console.log(`Free transaction limit: ${FREE_LIMIT}`);
    
    if (countableTransactions.length > FREE_LIMIT) {
      const expectedPaidTransactions = countableTransactions.length - FREE_LIMIT;
      const expectedFees = expectedPaidTransactions * 2;
      console.log(`Expected paid transactions: ${expectedPaidTransactions}`);
      console.log(`Expected total fees: $${expectedFees.toFixed(2)}`);
    } else {
      console.log('All transactions should be FREE');
    }
    
    const actualFees = dbTransactions.reduce((sum, t) => sum + t.fee_amount, 0);
    console.log(`Actual fees in database: $${actualFees.toFixed(2)}`);
    
    console.log('');
    console.log('🎯 SUMMARY:');
    console.log('=' .repeat(50));
    console.log(`✅ Sleeper API shows ${countableTransactions.length} countable transactions`);
    console.log(`${dbTransactions.length === countableTransactions.length ? '✅' : '❌'} Database has ${dbTransactions.length} transactions`);
    console.log(`${missingInDb.length === 0 ? '✅' : '❌'} Missing in database: ${missingInDb.length}`);
    
  } catch (error) {
    console.error('❌ Error in comprehensive audit:', error);
  }
}

comprehensiveWatts52Audit();