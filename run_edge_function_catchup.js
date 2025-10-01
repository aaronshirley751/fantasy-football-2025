// Run Edge Function to catch up on remaining transactions
const FUNCTION_URL = 'https://jfeuobfjgqownybluvje.supabase.co/functions/v1/process-weekly-fees';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmZXVvYmZqZ3Fvd255Ymx1dmplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1NTI1ODUsImV4cCI6MjA3MTEyODU4NX0.7qu0h_cKNpdW1ZENZ3652LE75MC6VQp9Ahu5SSDypuY';
const LEAGUE_ID = '1249067741470539776';

async function runEdgeFunctionCatchup() {
    console.log('🚀 RUNNING EDGE FUNCTION CATCHUP');
    console.log('=' .repeat(50));
    console.log('Goal: Process remaining 8 transactions to reach full 63');
    console.log();
    
    // Run for current weeks to catch any missed transactions
    const weeks = [1, 2, 3, 4];
    
    for (const week of weeks) {
        console.log(`\n📅 Processing Week ${week}...`);
        console.log('-'.repeat(30));
        
        try {
            const response = await fetch(FUNCTION_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${ANON_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    week_number: week,
                    league_id: LEAGUE_ID
                })
            });
            
            console.log(`Status: ${response.status} ${response.statusText}`);
            
            if (response.ok) {
                const result = await response.json();
                console.log('✅ Success!');
                
                // Show any useful response data
                if (result.message) {
                    console.log(`Message: ${result.message}`);
                }
                if (result.fees_processed !== undefined) {
                    console.log(`Fees processed: $${result.fees_processed}`);
                }
                if (result.transactions_processed !== undefined) {
                    console.log(`Transactions: ${result.transactions_processed}`);
                }
                if (result.summary) {
                    console.log(`Summary: ${result.summary}`);
                }
                
                console.log('Response:', JSON.stringify(result, null, 2));
            } else {
                const errorText = await response.text();
                console.log('❌ Failed');
                console.log(`Error: ${errorText.substring(0, 200)}...`);
            }
            
        } catch (error) {
            console.log(`❌ Error: ${error.message}`);
        }
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n✅ Edge Function catchup complete!');
    console.log('🔍 Check transaction count again to see if we reached 63 transactions');
}

runEdgeFunctionCatchup();