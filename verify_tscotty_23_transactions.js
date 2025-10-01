// Direct verification of tscotty85 transaction count using Sleeper API
const LEAGUE_ID = '1249067741470539776'
const AUGUST_24_CUTOFF = new Date('2025-08-24T00:00:00Z').getTime()

async function verifyTscottyTransactions() {
    console.log('🔍 Direct Sleeper API verification for tscotty85 transactions...')
    
    try {
        // Get users to find tscotty85's user_id  
        const usersResponse = await fetch(`https://api.sleeper.app/v1/league/${LEAGUE_ID}/users`)
        const users = await usersResponse.json()
        
        const tscottyUser = users.find(u => u.display_name === 'tscotty85')
        if (!tscottyUser) {
            console.error('❌ tscotty85 not found in users')
            return
        }
        
        console.log(`✅ Found tscotty85: ${tscottyUser.user_id}`)
        
        // Get rosters to find tscotty85's roster_id
        const rostersResponse = await fetch(`https://api.sleeper.app/v1/league/${LEAGUE_ID}/rosters`)
        const rosters = await rostersResponse.json()
        
        const tscottyRoster = rosters.find(r => r.owner_id === tscottyUser.user_id)
        if (!tscottyRoster) {
            console.error('❌ tscotty85 roster not found')
            return
        }
        
        console.log(`✅ tscotty85 roster_id: ${tscottyRoster.roster_id}`)
        
        // Fetch all transactions from all weeks
        const allTransactions = []
        for (let week = 1; week <= 18; week++) {
            try {
                const weekResponse = await fetch(`https://api.sleeper.app/v1/league/${LEAGUE_ID}/transactions/${week}`)
                if (weekResponse.ok) {
                    const weekTransactions = await weekResponse.json()
                    if (weekTransactions && weekTransactions.length > 0) {
                        allTransactions.push(...weekTransactions)
                    }
                }
            } catch (error) {
                // Week might not exist yet
            }
        }
        
        console.log(`✅ Total transactions fetched: ${allTransactions.length}`)
        
        // Filter for tscotty85's transactions after August 24 cutoff
        const tscottyTransactions = allTransactions.filter(t => {
            return t.roster_ids && 
                   t.roster_ids.includes(tscottyRoster.roster_id) &&
                   t.created >= AUGUST_24_CUTOFF &&
                   ['waiver', 'free_agent', 'trade'].includes(t.type)
        })
        
        console.log(`\n🎯 tscotty85 transaction analysis:`)
        console.log(`   Total transactions (after Aug 24): ${tscottyTransactions.length}`)
        
        // Break down by type
        const byType = {}
        tscottyTransactions.forEach(t => {
            byType[t.type] = (byType[t.type] || 0) + 1
        })
        
        console.log(`   Breakdown:`)
        Object.entries(byType).forEach(([type, count]) => {
            console.log(`     ${type}: ${count}`)
        })
        
        // Expected result check
        if (tscottyTransactions.length === 23) {
            console.log('\n✅ CORRECT! tscotty85 has exactly 23 transactions as per conversation history')
        } else {
            console.log(`\n❌ MISMATCH! Expected 23, found ${tscottyTransactions.length}`)
            console.log('This confirms the function logic needs more fixing')
        }
        
        // Show some example transactions
        console.log('\n📋 Sample transactions:')
        tscottyTransactions.slice(0, 3).forEach((t, i) => {
            const date = new Date(t.created).toLocaleDateString()
            console.log(`   ${i+1}. ${t.type} - ${date}`)
        })
        
    } catch (error) {
        console.error('❌ Error verifying transactions:', error)
    }
}

verifyTscottyTransactions()