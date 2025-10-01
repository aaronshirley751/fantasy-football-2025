// Get detailed fee summaries directly from the database
async function getFeeDetails() {
  const fetch = (await import('node-fetch')).default;
  
  console.log('💰 DETAILED FEE SUMMARY REPORT');
  console.log('🏈 2025 Fantasy Football League - Current Season Totals');
  console.log('=' .repeat(60));
  console.log('');
  
  const workingKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmZXVvYmZqZ3Fvd255Ymx1dmplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1NTI1ODUsImV4cCI6MjA3MTEyODU4NX0.7qu0h_cKNpdW1ZENZ3652LE75MC6VQp9Ahu5SSDypuY';
  
  try {
    // Try different debug actions to get the data we need
    const actions = [
      'get_fee_summaries',
      'audit_fees',
      'show_all_data',
      'get_all_fees',
      'league_summary'
    ];
    
    for (const action of actions) {
      console.log(`🔍 Trying action: ${action}`);
      
      const response = await fetch('https://jfeuobfjgqownybluvje.supabase.co/functions/v1/debug-league', {
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
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Action ${action} successful:`);
        
        // Check if we got useful data
        if (data.fee_summaries && data.fee_summaries.length > 0) {
          console.log('📊 FEE SUMMARIES FOUND:');
          console.log('-' .repeat(40));
          
          let grandTotal = 0;
          data.fee_summaries.forEach(summary => {
            const total = parseFloat(summary.total_fees) || 0;
            grandTotal += total;
            console.log(`   ${summary.owner_name || summary.roster_id}: $${total.toFixed(2)}`);
          });
          
          console.log(`   TOTAL: $${grandTotal.toFixed(2)}`);
          console.log('');
          break; // Found what we need
        } else if (data.fees && data.fees.length > 0) {
          console.log('📋 INDIVIDUAL FEES FOUND:');
          console.log('-' .repeat(40));
          
          // Group by owner
          const feesByOwner = {};
          data.fees.forEach(fee => {
            const owner = fee.owner_name || fee.roster_id;
            if (!feesByOwner[owner]) {
              feesByOwner[owner] = 0;
            }
            feesByOwner[owner] += parseFloat(fee.amount) || 0;
          });
          
          let grandTotal = 0;
          Object.entries(feesByOwner).forEach(([owner, total]) => {
            grandTotal += total;
            console.log(`   ${owner}: $${total.toFixed(2)}`);
          });
          
          console.log(`   TOTAL: $${grandTotal.toFixed(2)}`);
          console.log('');
          break; // Found what we need
        } else {
          console.log(`   No fee data in response for ${action}`);
          console.log(`   Response keys: ${Object.keys(data).join(', ')}`);
        }
        console.log('');
      } else {
        console.log(`❌ Action ${action} failed: ${response.status}`);
      }
    }
    
    // Also try the setup-league function which might have summary capabilities
    console.log('🔍 Trying setup-league for summary...');
    const setupResponse = await fetch('https://jfeuobfjgqownybluvje.supabase.co/functions/v1/setup-league', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${workingKey}`
      },
      body: JSON.stringify({
        action: 'get_summary',
        league_id: 'a7d65b53-2ec5-4b38-94ee-7fcb97160989'
      })
    });
    
    if (setupResponse.ok) {
      const setupData = await setupResponse.json();
      console.log('✅ Setup-league response:');
      console.log(JSON.stringify(setupData, null, 2));
    } else {
      console.log('❌ Setup-league request failed');
    }
    
  } catch (error) {
    console.log(`💥 Error: ${error.message}`);
  }
}

// Execute the fee details lookup
getFeeDetails().catch(console.error);