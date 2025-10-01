// Check database schema and tables
const supabaseUrl = 'https://jfeuobfjgqownybluvje.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmZXVvYmZqZ3Fvd255Ymx1dmplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTU1MjU4NSwiZXhwIjoyMDcxMTI4NTg1fQ.TYZBL4UNLEJN6ovM6HQS5wxm2zkbZHBYtmQYALHDkqQ';

async function checkSchema() {
    console.log('🔍 CHECKING DATABASE SCHEMA');
    console.log('=' .repeat(50));
    
    // List all tables
    console.log('\n📋 Available Tables:');
    try {
        const response = await fetch(`${supabaseUrl}/rest/v1/`, {
            headers: {
                'apikey': supabaseServiceKey,
                'Authorization': `Bearer ${supabaseServiceKey}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const schema = await response.json();
            console.log('✅ Schema info received');
            console.log(JSON.stringify(schema, null, 2));
        } else {
            console.log(`❌ Failed to get schema: ${response.status}`);
        }
    } catch (error) {
        console.log('❌ Error getting schema:', error.message);
    }
    
    // Try to check specific tables
    const tables = ['transactions', 'fees', 'fee_summaries', 'users', 'leagues'];
    
    for (const table of tables) {
        console.log(`\n📊 Checking table: ${table}`);
        try {
            const response = await fetch(`${supabaseUrl}/rest/v1/${table}?select=*&limit=1`, {
                headers: {
                    'apikey': supabaseServiceKey,
                    'Authorization': `Bearer ${supabaseServiceKey}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log(`✅ Table ${table} exists, ${data.length} records`);
                if (data.length > 0) {
                    console.log('Sample data:', Object.keys(data[0]));
                }
            } else {
                const errorText = await response.text();
                console.log(`❌ Table ${table} not found: ${response.status}`);
                console.log(`   Error: ${errorText.substring(0, 100)}...`);
            }
        } catch (error) {
            console.log(`❌ Error checking ${table}:`, error.message);
        }
    }
    
    // Check transactions table structure specifically
    console.log('\n🔍 DETAILED TRANSACTIONS TABLE CHECK');
    try {
        const response = await fetch(`${supabaseUrl}/rest/v1/transactions`, {
            method: 'OPTIONS',
            headers: {
                'apikey': supabaseServiceKey,
                'Authorization': `Bearer ${supabaseServiceKey}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('OPTIONS response status:', response.status);
        const headers = response.headers;
        console.log('Allow header:', headers.get('Allow'));
        console.log('Accept-Post header:', headers.get('Accept-Post'));
        
    } catch (error) {
        console.log('❌ Error checking transactions table:', error.message);
    }
}

checkSchema();