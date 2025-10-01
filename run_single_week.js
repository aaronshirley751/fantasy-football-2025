// Simple single-week Edge Function call to avoid timeouts
const FUNCTION_URL = 'https://jfeuobfjgqownybluvje.supabase.co/functions/v1/process-weekly-fees';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmZXVvYmZqZ3Fvd255Ymx1dmplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1NTI1ODUsImV4cCI6MjA3MTEyODU4NX0.7qu0h_cKNpdW1ZENZ3652LE75MC6VQp9Ahu5SSDypuY';
const LEAGUE_ID = '1249067741470539776';

async function runSingleWeek() {
    console.log('🚀 RUNNING EDGE FUNCTION - SINGLE WEEK');
    console.log('=' .repeat(50));
    
    // Try the most recent week (Week 4) where we likely have missing transactions
    const week = 4;
    
    console.log(`📅 Processing Week ${week} only...`);
    
    try {
        const startTime = Date.now();
        
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
        
        const endTime = Date.now();
        const duration = (endTime - startTime) / 1000;
        
        console.log(`⏱️  Request took ${duration} seconds`);
        console.log(`📊 Status: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
            const result = await response.json();
            console.log('✅ SUCCESS!');
            console.log('📋 Response:');
            console.log(JSON.stringify(result, null, 2));
            
        } else {
            const errorText = await response.text();
            console.log('❌ FAILED');
            console.log('📋 Error Response:');
            console.log(errorText.substring(0, 500));
        }
        
    } catch (error) {
        console.log(`❌ REQUEST ERROR: ${error.message}`);
        
        if (error.message.includes('timeout')) {
            console.log('⚠️  The Edge Function is taking too long to process');
            console.log('💡 This might be normal for initial processing of many transactions');
        }
    }
    
    console.log('\n✅ Single week processing complete');
}

runSingleWeek();