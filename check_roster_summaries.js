const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://jfeuobfjgqownybluvje.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmZXVvYmZqZ3Fvd255Ymx1dmplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1NTI1ODUsImV4cCI6MjA3MTEyODU4NX0.7qu0h_cKNpdW1ZENZ3652LE75MC6VQp9Ahu5SSDypuY'
);

async function checkRosterSummaries() {
  console.log('🔍 CHECKING CURRENT ROSTER SUMMARIES DATA...\n');
  
  // Check all data to see what's there
  const { data, error } = await supabase
    .from('fee_summary')
    .select('*')
    .limit(20);
    
  if (error) {
    console.log('❌ Error:', error);
    return;
  }
  
  console.log('📊 CURRENT DATABASE STATE (All leagues):');
  console.log('========================================');
  if (data.length === 0) {
    console.log('🔍 No data found in fee_summary table');
  } else {
    console.log(`Found ${data.length} records:\n`);
    data.forEach((row, index) => {
      console.log(`${index + 1}. League: ${row.league_id}`);
      console.log(`   Roster: ${row.roster_id} (${row.owner_name})`);
      console.log(`   Total Owed: $${row.total_owed || 0}`);
      console.log(`   Updated Week: ${row.updated_week}`);
      console.log(`   Fields:`, Object.keys(row));
      console.log('');
    });
  }
}

checkRosterSummaries();