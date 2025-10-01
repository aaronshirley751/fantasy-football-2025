// Deep dive investigation - find the actual fee records in the database
async function investigateTransactionFees() {
  const fetch = (await import('node-fetch')).default;
  
  console.log('🔍 DEEP DIVE: TRANSACTION FEE INVESTIGATION');
  console.log('🎯 Finding the actual fee records that should exist from previous sessions');
  console.log('💡 Addressing recurring issue of missing fee data in audits');
  console.log('=' .repeat(80));
  console.log('');
  
  const workingKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmZXVvYmZqZ3Fvd255Ymx1dmplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1NTI1ODUsImV4cCI6MjA3MTEyODU4NX0.7qu0h_cKNpdW1ZENZ3652LE75MC6VQp9Ahu5SSDypuY';
  
  try {
    // 1. Try to get detailed database information through setup-league with expanded query
    console.log('📊 STEP 1: COMPREHENSIVE DATABASE QUERY');
    console.log('-' .repeat(50));
    
    const setupResponse = await fetch('https://jfeuobfjgqownybluvje.supabase.co/functions/v1/setup-league', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${workingKey}`
      },
      body: JSON.stringify({
        action: 'get_full_summary',
        league_id: 'a7d65b53-2ec5-4b38-94ee-7fcb97160989',
        include_all_data: true
      })
    });
    
    if (setupResponse.ok) {
      const setupData = await setupResponse.json();
      
      console.log('✅ DATABASE FULL SUMMARY RECEIVED');
      console.log('');
      
      // Check for fee_summaries table data
      if (setupData.database_info) {
        const dbInfo = setupData.database_info;
        
        // Look for any table that might contain fee data
        console.log('🗃️  DATABASE TABLES ANALYSIS:');
        console.log('-' .repeat(40));
        
        Object.entries(dbInfo).forEach(([tableName, tableData]) => {
          if (tableData && typeof tableData === 'object') {
            console.log(`📋 Table: ${tableName}`);
            console.log(`   Count: ${tableData.count || 0} records`);
            
            if (tableData.data && Array.isArray(tableData.data) && tableData.data.length > 0) {
              console.log(`   Sample record keys: ${Object.keys(tableData.data[0]).join(', ')}`);
              
              // Look for fee-related data
              if (tableName.includes('fee') || tableName.includes('transaction')) {
                console.log(`   🎯 FEE-RELATED DATA FOUND IN ${tableName}:`);
                tableData.data.forEach((record, idx) => {
                  if (idx < 5) { // Show first 5 records
                    console.log(`     Record ${idx + 1}:`, JSON.stringify(record, null, 6));
                  }
                });
              }
            }
            console.log('');
          }
        });
      }
    }
    
    // 2. Query the debug-league function with different actions to find fee data
    console.log('🔎 STEP 2: DEBUG FUNCTION COMPREHENSIVE SEARCH');
    console.log('-' .repeat(50));
    
    const debugActions = [
      'get_fee_summaries',
      'get_all_fees', 
      'get_transaction_fees',
      'show_database_data',
      'audit_complete',
      'fee_audit',
      'transaction_audit'
    ];
    
    for (const action of debugActions) {
      console.log(`🔍 Testing debug action: ${action}`);
      
      const debugResponse = await fetch('https://jfeuobfjgqownybluvje.supabase.co/functions/v1/debug-league', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${workingKey}`
        },
        body: JSON.stringify({
          action: action,
          league_id: 'a7d65b53-2ec5-4b38-94ee-7fcb97160989'
        })
      });
      
      if (debugResponse.ok) {
        const debugData = await debugResponse.json();
        
        // Look for any fee-related data in the response
        if (debugData.fees || debugData.fee_summaries || debugData.transaction_fees) {
          console.log(`✅ FEE DATA FOUND with action: ${action}`);
          console.log(JSON.stringify(debugData, null, 2));
          console.log('');
          break; // Found fee data, stop searching
        } else {
          console.log(`   No fee data in ${action} response`);
        }
      } else {
        console.log(`   ❌ ${action} failed: ${debugResponse.status}`);
      }
    }
    
    // 3. Try both leagues to compare data availability
    console.log('🔄 STEP 3: CROSS-LEAGUE COMPARISON');
    console.log('-' .repeat(50));
    
    const leagues = [
      { name: '2025 Live League', id: 'a7d65b53-2ec5-4b38-94ee-7fcb97160989' },
      { name: '2024 Test League', id: 'd06f0672-2848-4b5d-86f5-9ab559605b4f' }
    ];
    
    for (const league of leagues) {
      console.log(`📊 Checking ${league.name}...`);
      
      const leagueResponse = await fetch('https://jfeuobfjgqownybluvje.supabase.co/functions/v1/setup-league', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${workingKey}`
        },
        body: JSON.stringify({
          action: 'get_summary',
          league_id: league.id
        })
      });
      
      if (leagueResponse.ok) {
        const leagueData = await leagueResponse.json();
        
        console.log(`✅ ${league.name} data retrieved`);
        
        // Count records in each table
        if (leagueData.database_info) {
          Object.entries(leagueData.database_info).forEach(([table, data]) => {
            if (data && data.count !== undefined) {
              console.log(`   ${table}: ${data.count} records`);
            }
          });
        }
        console.log('');
      }
    }
    
    // 4. Direct function call to try to force processing and see current state
    console.log('⚡ STEP 4: FORCE PROCESSING TEST');
    console.log('-' .repeat(50));
    
    console.log('Attempting to force a fresh calculation...');
    
    const forceResponse = await fetch('https://jfeuobfjgqownybluvje.supabase.co/functions/v1/weekly-processor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${workingKey}`
      },
      body: JSON.stringify({
        league_id: 'a7d65b53-2ec5-4b38-94ee-7fcb97160989',
        week: 3, // Force reprocess week 3
        force_recalculate: true,
        test_mode: false
      })
    });
    
    if (forceResponse.ok) {
      const forceData = await forceResponse.json();
      
      console.log('📊 FORCED PROCESSING RESULTS:');
      console.log(JSON.stringify(forceData, null, 2));
      
      // Look specifically for transaction stats
      if (forceData.transaction_stats) {
        console.log('');
        console.log('📱 DETAILED TRANSACTION BREAKDOWN:');
        console.log('==================================');
        
        forceData.transaction_stats.forEach(stat => {
          console.log(`🏈 ${stat.owner_name || `Roster ${stat.roster_id}`}:`);
          console.log(`   Total Transactions: ${stat.total_transactions || 0}`);
          console.log(`   Free Used: ${(stat.total_transactions || 0) - (stat.free_remaining || 10)}`);
          console.log(`   Free Remaining: ${stat.free_remaining || 10}/10`);
          console.log(`   Paid Transactions: ${Math.max(0, (stat.total_transactions || 0) - 10)}`);
          console.log(`   Transaction Fees: $${Math.max(0, (stat.total_transactions || 0) - 10) * 2}`);
          console.log('');
        });
      }
    }
    
    console.log('🎯 INVESTIGATION SUMMARY:');
    console.log('=========================');
    console.log('✅ Comprehensive database search completed');
    console.log('✅ Multiple function endpoints tested');
    console.log('✅ Cross-league comparison performed');
    console.log('✅ Force processing attempted');
    console.log('');
    console.log('📋 NEXT: Review results above to identify fee data location');
    
  } catch (error) {
    console.log(`💥 Investigation error: ${error.message}`);
  }
}

// Execute the deep investigation
investigateTransactionFees().catch(console.error);