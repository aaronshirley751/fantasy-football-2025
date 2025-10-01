// Test the full function and display in approved format
async function runFunctionAndDisplayResults() {
    console.log('🧪 Running full function for Week 4 processing...')
    
    try {
        // Since we can't authenticate directly, let me simulate the function call
        // by fetching the same data the function would process
        
        const LEAGUE_ID = '1249067741470539776'
        const WEEK_NUMBER = 4
        const AUGUST_24_CUTOFF = new Date('2025-08-24T00:00:00Z').getTime()
        
        // Fetch all the data the function would use
        const [usersResponse, rostersResponse, matchupsResponse] = await Promise.all([
            fetch(`https://api.sleeper.app/v1/league/${LEAGUE_ID}/users`),
            fetch(`https://api.sleeper.app/v1/league/${LEAGUE_ID}/rosters`),
            fetch(`https://api.sleeper.app/v1/league/${LEAGUE_ID}/matchups/${WEEK_NUMBER}`)
        ])
        
        const [users, rosters, matchups] = await Promise.all([
            usersResponse.json(),
            rostersResponse.json(),
            matchupsResponse.json()
        ])
        
        // Fetch ALL transactions from all weeks (as the function now does)
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
        
        // Create user mapping
        const userMap = new Map()
        users.forEach(user => {
            const roster = rosters.find(r => r.owner_id === user.user_id)
            if (roster) {
                userMap.set(roster.roster_id, user)
            }
        })
        
        // Process Week 4 matchups to find losers and high scorer
        const sortedMatchups = matchups.sort((a, b) => (b.points || 0) - (a.points || 0))
        const highScorer = sortedMatchups[0]
        
        // Find week 4 losers
        const week4Fees = []
        const matchupPairs = new Map()
        matchups.forEach(m => {
            if (!matchupPairs.has(m.matchup_id)) {
                matchupPairs.set(m.matchup_id, [])
            }
            matchupPairs.get(m.matchup_id).push(m)
        })
        
        matchupPairs.forEach(pair => {
            if (pair.length === 2) {
                const [team1, team2] = pair
                const loser = team1.points < team2.points ? team1 : team2
                const user = userMap.get(loser.roster_id)
                const ownerName = user?.display_name || `Team ${loser.roster_id}`
                
                week4Fees.push({
                    roster_id: loser.roster_id,
                    type: "loss_fee",
                    amount: 5,
                    description: "Week 4 loss fee",
                    owner_name: ownerName
                })
            }
        })
        
        // Add high scorer bonus
        if (highScorer) {
            const user = userMap.get(highScorer.roster_id)
            const ownerName = user?.display_name || `Team ${highScorer.roster_id}`
            
            week4Fees.push({
                roster_id: highScorer.roster_id,
                type: "high_score_bonus",
                amount: -5,
                description: "High scorer bonus - Week 4",
                owner_name: ownerName
            })
        }
        
        // Calculate season transaction totals for ALL rosters
        const seasonSummary = []
        
        // First, calculate season-to-date losses, inactives, and bonuses by fetching ALL weeks
        const seasonLossesAndInactives = new Map()
        const seasonHighScorerBonuses = new Map()
        
        // Fetch matchups for all weeks to calculate season losses and bonuses
        for (let week = 1; week <= WEEK_NUMBER; week++) {
            try {
                const weekMatchupsResponse = await fetch(`https://api.sleeper.app/v1/league/${LEAGUE_ID}/matchups/${week}`)
                if (weekMatchupsResponse.ok) {
                    const weekMatchups = await weekMatchupsResponse.json()
                    if (weekMatchups && weekMatchups.length > 0) {
                        // Process this week's losses
                        const weekMatchupPairs = new Map()
                        weekMatchups.forEach(m => {
                            if (!weekMatchupPairs.has(m.matchup_id)) {
                                weekMatchupPairs.set(m.matchup_id, [])
                            }
                            weekMatchupPairs.get(m.matchup_id).push(m)
                        })
                        
                        weekMatchupPairs.forEach(pair => {
                            if (pair.length === 2) {
                                const [team1, team2] = pair
                                const loser = team1.points < team2.points ? team1 : team2
                                const current = seasonLossesAndInactives.get(loser.roster_id) || 0
                                seasonLossesAndInactives.set(loser.roster_id, current + 5) // $5 per loss
                            }
                        })
                        
                        // Find high scorer for this week (gets -$5 bonus) - track separately
                        const sortedWeekMatchups = weekMatchups.sort((a, b) => (b.points || 0) - (a.points || 0))
                        if (sortedWeekMatchups.length > 0) {
                            const weekHighScorer = sortedWeekMatchups[0]
                            const currentBonuses = seasonHighScorerBonuses.get(weekHighScorer.roster_id) || 0
                            seasonHighScorerBonuses.set(weekHighScorer.roster_id, currentBonuses - 5) // -$5 bonus
                        }
                    }
                }
            } catch (error) {
                console.log(`Could not fetch matchups for week ${week}`)
            }
        }
        
        console.log(`✅ Calculated season losses/bonuses for weeks 1-${WEEK_NUMBER}`)
        
        rosters.forEach(roster => {
            const user = userMap.get(roster.roster_id)
            const ownerName = user?.display_name || `Team ${roster.roster_id}`
            
            // Count transactions for this roster (after Aug 24 cutoff)
            const rosterTransactions = allTransactions.filter(t => {
                return t.roster_ids && 
                       t.roster_ids.includes(roster.roster_id) &&
                       t.created >= AUGUST_24_CUTOFF &&
                       ['waiver', 'free_agent', 'trade'].includes(t.type)
            })
            
            const transactionCount = rosterTransactions.length
            const freeTransactions = Math.min(transactionCount, 10)
            const paidTransactions = Math.max(0, transactionCount - 10)
            const transactionFees = paidTransactions * 2
            
            // Get season-to-date losses/inactives and bonuses separately
            const seasonLossesInactives = seasonLossesAndInactives.get(roster.roster_id) || 0
            const seasonBonuses = seasonHighScorerBonuses.get(roster.roster_id) || 0
            
            seasonSummary.push({
                roster_id: roster.roster_id,
                owner_name: ownerName,
                season_total: transactionFees + seasonLossesInactives + seasonBonuses,
                transaction_fees: transactionFees,
                losses_inactive_fees: seasonLossesInactives,
                high_scorer_bonuses: seasonBonuses,
                transactions_used: transactionCount,
                free_remaining: Math.max(0, 10 - transactionCount)
            })
        })
        
        // Sort by roster_id for consistency
        seasonSummary.sort((a, b) => a.roster_id - b.roster_id)
        
        // Calculate totals
        const weekTotal = week4Fees.reduce((sum, fee) => sum + fee.amount, 0)
        const grandTotal = seasonSummary.reduce((sum, team) => sum + team.season_total, 0)
        const highScorerName = userMap.get(highScorer?.roster_id)?.display_name || 'Unknown'
        const highScorerPoints = highScorer?.points || 0
        
        // Display in APPROVED FORMAT
        console.log(`📊 Week ${WEEK_NUMBER} Fantasy Football Fees`)
        console.log("🏆 Highest Scorer")
        console.log(`${highScorerName}: ${highScorerPoints} pts (-$5 bonus)`)
        console.log("🆕 THIS WEEK'S ACTIVITY")
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━")
        
        // Individual fee lines with bullet points
        week4Fees.forEach(fee => {
            if (fee.type === 'loss_fee') {
                console.log(`• ${fee.owner_name}: Loss ($5) = $${fee.amount.toFixed(2)}`)
            } else if (fee.type === 'high_score_bonus') {
                console.log(`• ${fee.owner_name}: Bonus (-$5) = $${fee.amount.toFixed(2)}`)
            } else if (fee.type === 'transaction_fee') {
                console.log(`• ${fee.owner_name}: Transaction ($2) = $${fee.amount.toFixed(2)}`)
            } else if (fee.type === 'inactive_fee') {
                console.log(`• ${fee.owner_name}: Inactive ($5) = $${fee.amount.toFixed(2)}`)
            }
        })
        
        console.log("💰 Week Total")
        console.log(`$${Math.abs(weekTotal).toFixed(2)}`)
        console.log("📈 SEASON TOTALS (All Teams)")
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━")
        
        // Real season totals with transaction tracking - SIMPLIFIED CLEAN FORMAT
        seasonSummary.forEach(team => {
            const paidCount = team.transactions_used > 10 ? team.transactions_used - 10 : 0
            
            // Build the fee breakdown dynamically
            const feeBreakdown = []
            
            if (team.transaction_fees > 0) {
                feeBreakdown.push(`$${team.transaction_fees.toFixed(2)} transactions`)
            }
            
            if (team.losses_inactive_fees > 0) {
                feeBreakdown.push(`$${team.losses_inactive_fees.toFixed(2)} losses/inactive`)
            }
            
            if (team.high_scorer_bonuses < 0) {
                feeBreakdown.push(`$${team.high_scorer_bonuses.toFixed(2)} high scorer bonus`)
            }
            
            // Simple, consistent total formatting
            const totalFormatted = `$${team.season_total.toFixed(2)}`
            
            // Format the line based on what fees exist
            if (feeBreakdown.length > 0) {
                const feeText = feeBreakdown.join(', ')
                if (team.transaction_fees > 0) {
                    console.log(`• ${team.owner_name}: ${totalFormatted} total (${feeText}), ${team.free_remaining}/10 free remaining (${paidCount} paid)`)
                } else {
                    console.log(`• ${team.owner_name}: ${totalFormatted} total (${feeText}), ${team.free_remaining}/10 free remaining`)
                }
            } else {
                // No fees at all
                console.log(`• ${team.owner_name}: ${totalFormatted} total, ${team.free_remaining}/10 free remaining`)
            }
        })
        
        console.log("🏦 Season Grand Total")
        console.log(`$${grandTotal.toFixed(2)} across all teams`)
        
        console.log("ℹ️ Transaction Rules")
        console.log("First 10 waiver/free agent claims per season are free ($2 each after)")
        
        console.log("")
        console.log(`Fantasy Fee Tracker | Powered by Sleeper API•${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`)
        
        console.log("\n" + "=".repeat(60))
        console.log("✅ FULL FUNCTION SIMULATION COMPLETE:")
        console.log("=".repeat(60))
        console.log(`• Fetched ${allTransactions.length} total transactions from all weeks`)
        console.log(`• Applied August 24 cutoff rule to all ${rosters.length} rosters`)
        console.log("• Shows current live transaction data from Sleeper API")
        console.log("• All rosters processed with 10 free transaction rule")
        
    } catch (error) {
        console.error('❌ Error running function simulation:', error)
    }
}

runFunctionAndDisplayResults()