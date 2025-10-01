// Backfill using Edge Function approach
// This will process all weeks sequentially to populate the database

const LEAGUE_ID = '1249067741470539776';
const FUNCTION_URL = 'https://jfeuobfjgqownybluvje.supabase.co/functions/v1/process-weekly-fees';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmZXVvYmZqZ3Fvd255Ymx1dmplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1NTI1ODUsImV4cCI6MjA3MTEyODU4NX0.7qu0h_cKNpdW1ZENZ3652LE75MC6VQp9Ahu5SSDypuY';

async function processWeek(weekNumber) {
    console.log(`\n📅 Processing Week ${weekNumber}...`);
    console.log('-'.repeat(40));
    
    try {
        const response = await fetch(FUNCTION_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${ANON_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                week_number: weekNumber,
                league_id: LEAGUE_ID
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ Week ${weekNumber} failed: ${response.status} ${response.statusText}`);
            console.error('Response:', errorText);
            return false;
        }
        
        const result = await response.json();
        console.log(`✅ Week ${weekNumber} processed successfully`);
        
        // Show summary if available
        if (result.fees_processed !== undefined) {
            console.log(`💰 Fees processed: $${result.fees_processed}`);
        }
        if (result.transactions_processed !== undefined) {
            console.log(`📊 Transactions processed: ${result.transactions_processed}`);
        }
        if (result.summary) {
            console.log(`📋 Summary: ${result.summary}`);
        }
        
        return true;
        
    } catch (error) {
        console.error(`❌ Error processing week ${weekNumber}:`, error.message);
        return false;
    }
}

async function checkCurrentDatabase() {
    console.log('🔍 Checking current database state...');
    
    try {
        const response = await fetch('https://jfeuobfjgqownybluvje.supabase.co/rest/v1/transactions?select=count()', {
            headers: {
                'apikey': ANON_KEY,
                'Authorization': `Bearer ${ANON_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const result = await response.json();
            const count = result[0]?.count || 0;
            console.log(`📊 Current transactions in database: ${count}`);
            return count;
        } else {
            console.log('❌ Could not check database state');
            return 0;
        }
    } catch (error) {
        console.log('❌ Error checking database:', error.message);
        return 0;
    }
}

async function main() {
    console.log('🚀 Starting Edge Function Backfill');
    console.log(`📅 Date: ${new Date().toLocaleString()}`);
    console.log(`🏈 League: ${LEAGUE_ID}`);
    console.log('=' .repeat(80));
    
    // Check initial state
    const initialCount = await checkCurrentDatabase();
    
    console.log('\n🔧 PROCESSING ALL WEEKS TO POPULATE DATABASE');
    console.log('This will call the Edge Function for each week to properly populate transactions');
    console.log('=' .repeat(80));
    
    let successCount = 0;
    let failCount = 0;
    
    // Process weeks 1-4 (current season weeks with transactions)
    for (let week = 1; week <= 4; week++) {
        const success = await processWeek(week);
        if (success) {
            successCount++;
        } else {
            failCount++;
        }
        
        // Small delay between weeks
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 BACKFILL SUMMARY');
    console.log('=' .repeat(80));
    console.log(`✅ Successful weeks: ${successCount}`);
    console.log(`❌ Failed weeks: ${failCount}`);
    
    // Check final state
    const finalCount = await checkCurrentDatabase();
    console.log(`📊 Transactions before: ${initialCount}`);
    console.log(`📊 Transactions after: ${finalCount}`);
    console.log(`📈 Transactions added: ${finalCount - initialCount}`);
    
    if (finalCount > initialCount) {
        console.log('\n🎉 BACKFILL SUCCESSFUL!');
        console.log('🔧 Database should now have all transactions properly populated');
        console.log('💰 Fee calculations should be accurate in future processing');
    } else {
        console.log('\n⚠️  Backfill may have failed - no new transactions added');
        console.log('🔧 Check the Edge Function logs for detailed error information');
    }
}

main();