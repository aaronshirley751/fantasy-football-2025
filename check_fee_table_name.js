// Check which fee table name exists in the database
const supabaseUrl = 'https://jfeuobfjgqownybluvje.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmZXVvYmZqZ3Fvd255Ymx1dmplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTU1MjU4NSwiZXhwIjoyMDcxMTI4NTg1fQ.TYZBL4UNLEJN6ovM6HQS5wxm2zkbZHBYtmQYALHDkqQ';

async function checkFeeTableName() {
    console.log('🔍 CHECKING FEE TABLE NAME IN DATABASE');
    console.log('=' .repeat(50));
    
    // Test fee_summary (singular)
    try {
        console.log('Testing "fee_summary" (singular)...');
        const response1 = await fetch(`${supabaseUrl}/rest/v1/fee_summary?select=count()`, {
            headers: {
                'apikey': supabaseServiceKey,
                'Authorization': `Bearer ${supabaseServiceKey}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log(`fee_summary status: ${response1.status}`);
        if (response1.ok) {
            const result = await response1.json();
            console.log('✅ fee_summary table EXISTS');
            console.log('Result:', result);
        } else {
            console.log('❌ fee_summary table does NOT exist');
        }
    } catch (error) {
        console.log('❌ Error testing fee_summary:', error.message);
    }
    
    // Test fee_summaries (plural)
    try {
        console.log('\nTesting "fee_summaries" (plural)...');
        const response2 = await fetch(`${supabaseUrl}/rest/v1/fee_summaries?select=count()`, {
            headers: {
                'apikey': supabaseServiceKey,
                'Authorization': `Bearer ${supabaseServiceKey}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log(`fee_summaries status: ${response2.status}`);
        if (response2.ok) {
            const result = await response2.json();
            console.log('✅ fee_summaries table EXISTS');
            console.log('Result:', result);
        } else {
            console.log('❌ fee_summaries table does NOT exist');
        }
    } catch (error) {
        console.log('❌ Error testing fee_summaries:', error.message);
    }
    
    console.log('\n💡 CONCLUSION:');
    console.log('We need to fix the function to use the correct table name.');
}

checkFeeTableName();