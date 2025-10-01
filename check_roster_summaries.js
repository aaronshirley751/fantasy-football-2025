const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://jfeuobfjgqownybluvje.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmZXVvYmZqZ3Fvd255Ymx1dmplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1NTI1ODUsImV4cCI6MjA3MTEyODU4NX0.7qu0h_cKNpdW1ZENZ3652LE75MC6VQp9Ahu5SSDypuY'
);

async function checkRosterSummaries() {
  console.log('🔍 CHECKING CURRENT ROSTER SUMMARIES DATA...\n');
  
  // Check all data to see what's there
  const { data, error } = await supabase
    .from('fee_summaries')
    .select('*')
    .limit(20);
    
  if (error) {
    console.log('❌ Error:', error);
    return;
  }
  
  console.log('📊 CURRENT DATABASE STATE (All leagues):');
  console.log('========================================');
  if (data.length === 0) {
    console.log('🔍 No data found in fee_summaries table');
  } else {
    console.log(`Found ${data.length} records:\n`);
    data.forEach((row, index) => {
      console.log(`${index + 1}. League: ${row.league_id}`);
      console.log(`   Roster: ${row.roster_id} (${row.owner_name})`);
      console.log(`   Loss Fees: $${row.loss_fees?.toFixed ? row.loss_fees.toFixed(2) : row.loss_fees || 0}`);
      console.log(`   Transaction Fees: $${row.transaction_fees?.toFixed ? row.transaction_fees.toFixed(2) : row.transaction_fees || 0}`);
      console.log(`   Inactive Fees: $${row.inactive_fees?.toFixed ? row.inactive_fees.toFixed(2) : row.inactive_fees || 0}`);
      console.log(`   High Score Credits: -$${row.high_score_credits?.toFixed ? row.high_score_credits.toFixed(2) : row.high_score_credits || 0}`);
      console.log(`   Total Owed: $${row.total_owed?.toFixed ? row.total_owed.toFixed(2) : row.total_owed || 0}`);
      console.log(`   Updated Week: ${row.updated_week}`);
      console.log(`   Free Transactions Remaining: ${row.free_transactions_remaining}`);
      console.log(`   Total Transactions: ${row.total_transactions}`);
      console.log(`   Paid Transactions: ${row.paid_transactions}`);
      console.log(`   Mulligan Used: ${row.mulligan_used ? 'Yes' : 'No'}`);
      console.log(`   Fields:`, Object.keys(row));
      console.log('');
    });
  }
}

checkRosterSummaries();