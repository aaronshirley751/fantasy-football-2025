// Test script for new Supabase credentials
async function testCredentials() {
    console.log('🔐 TESTING NEW SUPABASE CREDENTIALS');
    console.log('=' .repeat(50));
    
    // Fresh credentials from user
    const supabaseUrl = 'https://jfeuobfjgqownybluvje.supabase.co';
    const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmZXVvYmZqZ3Fvd255Ymx1dmplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1NTI1ODUsImV4cCI6MjA3MTEyODU4NX0.7qu0h_cKNpdW1ZENZ3652LE75MC6VQp9Ahu5SSDypuY';
    const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmZXVvYmZqZ3Fvd255Ymx1dmplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNDE5NzI5NiwiZXhwIjoyMDM5NzczMjk2fQ.vJv1aNlJ48875yKTkKVZ3o-YCtBhH1MZtPzV5_8ZJj8'; // From test_credentials.js
    
    console.log('📋 Please provide the following credentials:');
    console.log('1. Supabase Anon Key (for general API access)');
    console.log('2. Supabase Service Role Key (for admin operations)');
    console.log();
    
    // Test both keys
    const tests = [
        {
            name: 'Anon Key - Read Access',
            key: anonKey,
            test: async (key) => {
                const response = await fetch(`${supabaseUrl}/rest/v1/transactions?select=count()&limit=1`, {
                    headers: {
                        'apikey': key,
                        'Authorization': `Bearer ${key}`,
                        'Content-Type': 'application/json'
                    }
                });
                return { ok: response.ok, status: response.status, text: await response.text() };
            }
        },
        {
            name: 'Service Role Key - Write Access',
            key: serviceRoleKey,
            test: async (key) => {
                // Test with a dummy transaction (won't actually insert due to validation)
                const response = await fetch(`${supabaseUrl}/rest/v1/transactions`, {
                    method: 'POST',
                    headers: {
                        'apikey': key,
                        'Authorization': `Bearer ${key}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=minimal'
                    },
                    body: JSON.stringify({
                        league_id: 'test',
                        roster_id: 999,
                        sleeper_transaction_id: 'test-' + Date.now(),
                        transaction_type: 'test',
                        created: new Date().toISOString(),
                        description: 'Test transaction',
                        owner_name: 'Test User'
                    })
                });
                return { ok: response.ok, status: response.status, text: await response.text() };
            }
        },
        {
            name: 'Edge Function Access',
            key: anonKey,
            test: async (key) => {
                const response = await fetch(`${supabaseUrl}/functions/v1/process-weekly-fees`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${key}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        week_number: 1,
                        league_id: '1249067741470539776',
                        test_mode: true // Prevent actual processing
                    })
                });
                return { ok: response.ok, status: response.status, text: await response.text() };
            }
        }
    ];
    
    for (const test of tests) {
        console.log(`\n🔍 Testing: ${test.name}`);
        console.log('-'.repeat(40));
        
        if (test.key === 'PASTE_ANON_KEY_HERE' || test.key === 'PASTE_SERVICE_ROLE_KEY_HERE') {
            console.log('⏳ Waiting for credentials to be provided...');
            continue;
        }
        
        try {
            const result = await test.test(test.key);
            
            if (result.ok) {
                console.log('✅ SUCCESS - Authentication working');
            } else {
                console.log(`❌ FAILED - Status: ${result.status}`);
                console.log(`Response: ${result.text.substring(0, 200)}...`);
            }
        } catch (error) {
            console.log(`❌ ERROR - ${error.message}`);
        }
    }
    
    console.log('\n📋 NEXT STEPS:');
    console.log('1. Replace PASTE_ANON_KEY_HERE with your anon key');
    console.log('2. Replace PASTE_SERVICE_ROLE_KEY_HERE with your service role key');
    console.log('3. Run this script again to test the credentials');
    console.log('4. Once both keys work, we can proceed with the backfill');
}

testCredentials();