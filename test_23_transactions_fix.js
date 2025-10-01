// Test the corrected function with proper authentication
const SUPABASE_URL = 'https://jfeuobfjgqownybluvje.supabase.co'
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmZXVvYmZqZ3Fvd255Ymx1dmplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNDM2OTYxMCwiZXhwIjoyMDM5OTQ1NjEwfQ.7RrpyOJxA9c82gQLn2VKKkgr8FjfaP7ksLWKXvpKFHI'

async function testCorrectedFunction() {
    console.log('🧪 Testing corrected function with all-weeks transaction fetching...')
    console.log('Expected: tscotty85 should have 23 transactions')
    
    try {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/process-weekly-fees`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                week_number: 4,
                league_id: '1249067741470539776'
            })
        })

        if (!response.ok) {
            console.error('❌ Function call failed:', response.status, response.statusText)
            const error = await response.text()
            console.error(error)
            return
        }

        const result = await response.json()
        console.log('\n✅ Function Response:', JSON.stringify(result, null, 2))
        
        // Look for tscotty85 specifically
        if (result.season_summary) {
            const tscotty = result.season_summary.find(s => s.owner_name === 'tscotty85')
            if (tscotty) {
                console.log('\n🎯 tscotty85 Results:')
                console.log(`   Transactions Used: ${tscotty.transactions_used}`)
                console.log(`   Transaction Fees: $${tscotty.transaction_fees}`)
                console.log(`   Free Remaining: ${tscotty.free_remaining}`)
                
                if (tscotty.transactions_used === 23) {
                    console.log('   ✅ CORRECT! Shows 23 transactions as per conversation history')
                } else {
                    console.log(`   ❌ WRONG! Should be 23, got ${tscotty.transactions_used}`)
                }
            } else {
                console.log('❌ tscotty85 not found in season summary')
            }
        }
        
    } catch (error) {
        console.error('❌ Error testing function:', error)
    }
}

testCorrectedFunction()