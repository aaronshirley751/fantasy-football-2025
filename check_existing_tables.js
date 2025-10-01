// Check what tables actually exist in the database
const supabaseUrl = 'https://jfeuobfjgqownybluvje.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmZXVvYmZqZ3Fvd255Ymx1dmplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTU1MjU4NSwiZXhwIjoyMDcxMTI4NTg1fQ.TYZBL4UNLEJN6ovM6HQS5wxm2zkbZHBYtmQYALHDkqQ';

async function checkExistingTables() {
    console.log('📋 CHECKING EXISTING DATABASE TABLES');
    console.log('=' .repeat(50));
    
    const commonTables = [
        'transactions',
        'matchups', 
        'users',
        'rosters',
        'fee_summary',
        'fee_summaries',
        'weekly_fees',
        'fees'
    ];
    
    for (const table of commonTables) {
        try {
            const response = await fetch(`${supabaseUrl}/rest/v1/${table}?select=count()`, {
                headers: {
                    'apikey': supabaseServiceKey,
                    'Authorization': `Bearer ${supabaseServiceKey}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.status === 200) {
                const result = await response.json();
                console.log(`✅ ${table}: EXISTS (${result[0]?.count || 0} records)`);
            } else if (response.status === 404) {
                console.log(`❌ ${table}: NOT FOUND`);
            } else {
                console.log(`⚠️  ${table}: Status ${response.status}`);
            }
        } catch (error) {
            console.log(`❌ ${table}: Error - ${error.message}`);
        }
    }
    
    console.log('\n💡 SOLUTION OPTIONS:');
    console.log('1. Create the missing fee_summaries table');
    console.log('2. Remove fee summaries logic from function (simpler)');
    console.log('3. Use existing transactions table for fee tracking');
}

checkExistingTables();