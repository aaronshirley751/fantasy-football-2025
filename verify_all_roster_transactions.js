// Verify transaction counting is applied to ALL rosters
const LEAGUE_ID = '1249067741470539776'
const AUGUST_24_CUTOFF = new Date('2025-08-24T00:00:00Z').getTime()

async function verifyAllRosterTransactions() {
    console.log('🔍 Verifying transaction counting for ALL rosters...')
    
    try {
        // Get users and rosters
        const [usersResponse, rostersResponse] = await Promise.all([
            fetch(`https://api.sleeper.app/v1/league/${LEAGUE_ID}/users`),
            fetch(`https://api.sleeper.app/v1/league/${LEAGUE_ID}/rosters`)
        ])
        
        const [users, rosters] = await Promise.all([
            usersResponse.json(),
            rostersResponse.json()
        ])
        
        // Create user mapping
        const userMap = new Map()
        users.forEach(user => {
            const roster = rosters.find(r => r.owner_id === user.user_id)
            if (roster) {
                userMap.set(roster.roster_id, user)
            }
        })
        
        console.log(`✅ Found ${userMap.size} roster-to-user mappings`)
        
        // Fetch ALL transactions from all weeks
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
        
        // Count transactions per roster
        const rosterTransactionCounts = new Map()
        
        allTransactions.forEach(transaction => {
            if (transaction.roster_ids && 
                transaction.created >= AUGUST_24_CUTOFF &&
                ['waiver', 'free_agent', 'trade'].includes(transaction.type)) {
                
                transaction.roster_ids.forEach(rosterId => {
                    const current = rosterTransactionCounts.get(rosterId) || 0
                    rosterTransactionCounts.set(rosterId, current + 1)
                })
            }
        })
        
        console.log('\n📊 TRANSACTION COUNTS FOR ALL ROSTERS:')
        console.log('==========================================')
        
        // Sort by roster_id for consistent output
        const sortedRosters = Array.from(rosterTransactionCounts.entries()).sort((a, b) => a[0] - b[0])
        
        sortedRosters.forEach(([rosterId, count]) => {
            const user = userMap.get(rosterId)
            const ownerName = user?.display_name || `Team ${rosterId}`
            
            // Calculate fees based on 10 free transactions rule
            const freeTransactions = Math.min(count, 10)
            const paidTransactions = Math.max(0, count - 10)
            const transactionFees = paidTransactions * 2
            
            console.log(`• ${ownerName} (Roster ${rosterId}): ${count} transactions`)
            console.log(`  └─ Free: ${freeTransactions}, Paid: ${paidTransactions}, Fees: $${transactionFees}`)
        })
        
        // Also show rosters with zero transactions
        console.log('\n📊 ROSTERS WITH ZERO TRANSACTIONS:')
        console.log('==================================')
        
        rosters.forEach(roster => {
            if (!rosterTransactionCounts.has(roster.roster_id)) {
                const user = userMap.get(roster.roster_id)
                const ownerName = user?.display_name || `Team ${roster.roster_id}`
                console.log(`• ${ownerName} (Roster ${roster.roster_id}): 0 transactions`)
                console.log(`  └─ Free: 0, Paid: 0, Fees: $0`)
            }
        })
        
        // Summary
        const totalRosters = rosters.length
        const rostersWithTransactions = rosterTransactionCounts.size
        const rostersWithoutTransactions = totalRosters - rostersWithTransactions
        
        console.log('\n📈 SUMMARY:')
        console.log(`Total rosters: ${totalRosters}`)
        console.log(`Rosters with transactions: ${rostersWithTransactions}`)
        console.log(`Rosters without transactions: ${rostersWithoutTransactions}`)
        
        // Verify the specific cases you mentioned
        const watts52Count = rosterTransactionCounts.get(6) || 0  // Watts52 is roster 6
        const tscottyCount = rosterTransactionCounts.get(7) || 0  // tscotty85 is roster 7
        
        console.log('\n🎯 SPECIFIC VERIFICATION:')
        console.log(`Watts52 (Roster 6): ${watts52Count} transactions`)
        console.log(`tscotty85 (Roster 7): ${tscottyCount} transactions`)
        
        if (watts52Count === 15 && tscottyCount === 27) {
            console.log('✅ Both match our expected counts!')
        } else {
            console.log('❌ Counts don\'t match expected values')
        }
        
    } catch (error) {
        console.error('❌ Error verifying transactions:', error)
    }
}

verifyAllRosterTransactions()