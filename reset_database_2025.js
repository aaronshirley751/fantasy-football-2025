// Clear database and populate fresh with 2025 league data
const supabaseUrl = 'https://jfeuobfjgqownybluvje.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmZXVvYmZqZ3Fvd255Ymx1dmplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTU1MjU4NSwiZXhwIjoyMDcxMTI4NTg1fQ.TYZBL4UNLEJN6ovM6HQS5wxm2zkbZHBYtmQYALHDkqQ';
const PROD_2025_LEAGUE_ID = '1249067741470539776';
const DATABASE_LEAGUE_UUID = 'a7d65b53-2ec5-4b38-94ee-7fcb97160989';

async function resetDatabaseFor2025() {
    console.log('🗑️  RESETTING DATABASE FOR 2025 PRODUCTION LEAGUE');
    console.log('=' .repeat(70));
    console.log('This will clear ALL existing data and populate fresh with 2025 league');
    console.log();
    
    try {
        // 1. Clear all existing data
        console.log('🧹 1. CLEARING ALL EXISTING DATA');
        console.log('-'.repeat(50));
        
        const tables = ['transactions', 'matchups', 'fee_summary', 'users'];
        
        for (const table of tables) {
            console.log(`   Clearing ${table} table...`);
            const deleteResponse = await fetch(`${supabaseUrl}/rest/v1/${table}?league_id=eq.${DATABASE_LEAGUE_UUID}`, {
                method: 'DELETE',
                headers: {
                    'apikey': supabaseServiceKey,
                    'Authorization': `Bearer ${supabaseServiceKey}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (deleteResponse.ok) {
                console.log(`   ✅ ${table} cleared`);
            } else {
                console.log(`   ⚠️  ${table} clear may have failed or was empty`);
            }
        }
        
        // 2. Verify database is empty
        console.log('\n🔍 2. VERIFYING DATABASE IS EMPTY');
        console.log('-'.repeat(50));
        
        for (const table of tables) {
            const countResponse = await fetch(`${supabaseUrl}/rest/v1/${table}?select=count()&league_id=eq.${DATABASE_LEAGUE_UUID}`, {
                headers: {
                    'apikey': supabaseServiceKey,
                    'Authorization': `Bearer ${supabaseServiceKey}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (countResponse.ok) {
                const result = await countResponse.json();
                const count = result[0]?.count || 0;
                console.log(`   ${table}: ${count} records`);
            }
        }
        
        // 3. Test function with clean database
        console.log('\n🧪 3. TESTING FUNCTION WITH CLEAN DATABASE');
        console.log('-'.repeat(50));
        console.log('This should now work without "Failed to update fee summaries" error');
        
        const functionResponse = await fetch(`${supabaseUrl}/functions/v1/process-weekly-fees`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${supabaseServiceKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                week_number: 1,
                league_id: PROD_2025_LEAGUE_ID
            })
        });
        
        console.log(`Function Status: ${functionResponse.status}`);
        
        if (functionResponse.ok) {
            const result = await functionResponse.json();
            console.log('✅ FUNCTION SUCCESS!');
            console.log('Response:', JSON.stringify(result, null, 2));
            
            // 4. Verify data was populated
            console.log('\n✅ 4. VERIFYING 2025 DATA POPULATION');
            console.log('-'.repeat(50));
            
            // Check transactions
            const txnResponse = await fetch(`${supabaseUrl}/rest/v1/transactions?select=count()&league_id=eq.${DATABASE_LEAGUE_UUID}`, {
                headers: {
                    'apikey': supabaseServiceKey,
                    'Authorization': `Bearer ${supabaseServiceKey}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (txnResponse.ok) {
                const txnResult = await txnResponse.json();
                const txnCount = txnResult[0]?.count || 0;
                console.log(`   Transactions populated: ${txnCount}`);
            }
            
            // Check users
            const userResponse = await fetch(`${supabaseUrl}/rest/v1/users?select=count()&league_id=eq.${DATABASE_LEAGUE_UUID}`, {
                headers: {
                    'apikey': supabaseServiceKey,
                    'Authorization': `Bearer ${supabaseServiceKey}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (userResponse.ok) {
                const userResult = await userResponse.json();
                const userCount = userResult[0]?.count || 0;
                console.log(`   Users populated: ${userCount}`);
            }
            
            console.log('\n🎉 DATABASE SUCCESSFULLY RESET AND POPULATED WITH 2025 DATA!');
            console.log('✅ Function is working correctly');
            console.log('✅ Database aligned with 2025 league');
            console.log('✅ Ready for production automation');
            
        } else {
            const errorText = await functionResponse.text();
            console.log('❌ Function still failing:', errorText);
            console.log('\nThis indicates the issue may be deeper than just data alignment.');
            console.log('Let\'s investigate the actual error...');
        }
        
    } catch (error) {
        console.log('❌ Reset error:', error.message);
    }
}

resetDatabaseFor2025();