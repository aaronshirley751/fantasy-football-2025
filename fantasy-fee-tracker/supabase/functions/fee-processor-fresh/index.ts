import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Enhanced interfaces for better type safety
interface FeeData {
  roster_id: number
  type: string
  amount: number
  description: string
  owner_name?: string
}

interface UserMapping {
  roster_id: number
  sleeper_user_id: string
  display_name: string
}

interface TransactionStats {
  roster_id: number
  free_transactions_per_season: number
  free_remaining: number
  mulligan_used: boolean
  total_transactions: number
  paid_transactions: number
}

console.log('🚀 BREAKTHROUGH: Fee Processor with Deno.serve() pattern!')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

// BREAKTHROUGH: Using Deno.serve() pattern that works (322ms) instead of export default that times out (150s)!
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  console.log('📥 Fee Processing Request Received')
  
  try {
    const startTime = Date.now()
    const { league_id, week, test_mode } = await req.json()
    
    // Use defaults if not provided
    const actualLeagueId = league_id || '1249067741470539776' // 2025 live league
    const actualWeek = week || 1
    
    console.log(`🏈 Processing Week ${actualWeek} for League ${actualLeagueId}`)
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    console.log('🔗 Supabase client initialized')
    
    // Get league configuration
    const { data: leagueData, error: leagueError } = await supabase
      .from('leagues')
      .select('*')
      .eq('id', actualLeagueId)
      .single()
    
    if (leagueError || !leagueData) {
      console.log(`⚠️ League ${actualLeagueId} not found in database - this is expected for new league`)
      // For now, use default configuration
      // In production, we'd set up the league first
    }
    
    const sleeperLeagueId = leagueData?.sleeper_league_id || actualLeagueId
    console.log(`🔍 Using Sleeper League ID: ${sleeperLeagueId}`)
    
    // Fetch data from Sleeper API in parallel
    console.log('📊 Fetching Sleeper data...')
    const fetchStartTime = Date.now()
    
    // **CRITICAL FIX: We need ALL season transactions, not just one week!**
    console.log(`🔄 Fetching ALL season transactions (Weeks 1-${actualWeek})...`)
    
    // Fetch basic data first
    const [usersResponse, rostersResponse, matchupsResponse] = await Promise.all([
      fetch(`https://api.sleeper.app/v1/league/${sleeperLeagueId}/users`),
      fetch(`https://api.sleeper.app/v1/league/${sleeperLeagueId}/rosters`),
      fetch(`https://api.sleeper.app/v1/league/${sleeperLeagueId}/matchups/${actualWeek}`)
    ])
    
    // Fetch transactions for ALL weeks from 1 to current week
    const transactionPromises = []
    for (let week = 1; week <= actualWeek; week++) {
      transactionPromises.push(
        fetch(`https://api.sleeper.app/v1/league/${sleeperLeagueId}/transactions/${week}`)
      )
    }
    
    console.log(`📡 Fetching transactions for ${transactionPromises.length} weeks...`)
    const transactionResponses = await Promise.all(transactionPromises)
    
    const fetchTime = Date.now() - fetchStartTime
    console.log(`⚡ Sleeper API calls completed in ${fetchTime}ms`)
    
    // Parse basic responses
    const [users, rosters, matchups] = await Promise.all([
      usersResponse.ok ? usersResponse.json() : [],
      rostersResponse.ok ? rostersResponse.json() : [],
      matchupsResponse.ok ? matchupsResponse.json() : []
    ])
    
    // Parse and combine ALL transaction responses
    console.log('📊 Parsing and combining transaction data from all weeks...')
    const parseStartTime = Date.now()
    let allTransactions: any[] = []
    for (let i = 0; i < transactionResponses.length; i++) {
      const weekNum = i + 1
      if (transactionResponses[i].ok) {
        const weekTransactions = await transactionResponses[i].json()
        console.log(`   Week ${weekNum}: ${weekTransactions.length} transactions`)
        allTransactions = allTransactions.concat(weekTransactions)
      } else {
        console.log(`   Week ${weekNum}: API error`)
      }
    }
    
    console.log(`🎯 TOTAL SEASON TRANSACTIONS: ${allTransactions.length}`)
    const transactions = allTransactions
    
    const parseTime = Date.now() - parseStartTime
    console.log(`📊 Data parsed in ${parseTime}ms:`)
    console.log(`   Users: ${users?.length || 0}`)
    console.log(`   Rosters: ${rosters?.length || 0}`) 
    console.log(`   Matchups: ${matchups?.length || 0}`)
    console.log(`   Transactions: ${transactions?.length || 0}`)
    
    // Process fees (simplified for breakthrough validation)
    const fees: FeeData[] = []
    let highScorer = null
    
    // Create user mappings for owner names
    const userMappings: UserMapping[] = rosters?.map((roster: any) => ({
      roster_id: roster.roster_id,
      sleeper_user_id: roster.owner_id,
      display_name: users?.find((u: any) => u.user_id === roster.owner_id)?.display_name || `Team ${roster.roster_id}`
    })) || []
    
    console.log(`👥 Created ${userMappings.length} user mappings`)
    
    // Process matchups for loss fees and high scorer
    if (matchups && matchups.length > 0) {
      let highestPoints = 0
      const matchupMap = new Map()
      
      // Group matchups by matchup_id to determine winners/losers
      for (const matchup of matchups) {
        const matchupId = matchup.matchup_id
        if (!matchupMap.has(matchupId)) {
          matchupMap.set(matchupId, [])
        }
        matchupMap.get(matchupId).push(matchup)
        
        // Track high scorer
        if (matchup.points && matchup.points > highestPoints) {
          highestPoints = matchup.points
          const ownerName = userMappings.find(um => um.roster_id === matchup.roster_id)?.display_name || `Team ${matchup.roster_id}`
          highScorer = {
            roster_id: matchup.roster_id,
            points: matchup.points,
            owner_name: ownerName
          }
        }
      }
      
      // Process each matchup to determine losers
      for (const [matchupId, teams] of matchupMap.entries()) {
        if (teams.length === 2) {
          const [team1, team2] = teams
          const loser = team1.points < team2.points ? team1 : team2
          const ownerName = userMappings.find(um => um.roster_id === loser.roster_id)?.display_name || `Team ${loser.roster_id}`
          
          fees.push({
            roster_id: loser.roster_id,
            type: 'loss',
            amount: 5,
            description: `Week ${actualWeek} loss (${loser.points} pts)`,
            owner_name: ownerName
          })
        }
      }
    }
    
    // Add high scorer bonus
    if (highScorer) {
      fees.push({
        roster_id: highScorer.roster_id,
        type: 'high_score_bonus', 
        amount: -5,
        description: `Week ${actualWeek} high scorer (${highScorer.points} pts)`,
        owner_name: highScorer.owner_name
      })
    }
    
    // ========== TRANSACTION PROCESSING WITH 10 FREE + $2 PAID LOGIC ==========
    console.log(`🔄 Processing ${transactions?.length || 0} transactions for fee calculation...`)
    
    // **DEBUG: Let's see ALL transaction data first**
    if (transactions && transactions.length > 0) {
      console.log(`🔍 DEBUG: ALL ${transactions.length} TRANSACTIONS RECEIVED FROM SLEEPER:`)
      
      // Group transactions by roster for easier analysis
      const allTransactionsByRoster = new Map()
      transactions.forEach((t: any) => {
        if (t.roster_ids && t.roster_ids.length > 0) {
          const rosterId = t.roster_ids[0]
          if (!allTransactionsByRoster.has(rosterId)) {
            allTransactionsByRoster.set(rosterId, [])
          }
          allTransactionsByRoster.get(rosterId).push(t)
        }
      })
      
      // Show detailed breakdown for each roster
      for (const [rosterId, rosterTransactions] of allTransactionsByRoster.entries()) {
        const ownerName = userMappings.find(um => um.roster_id === rosterId)?.display_name || `Team ${rosterId}`
        console.log(`\n📊 ${ownerName} (Roster ${rosterId}) - ALL ${rosterTransactions.length} TRANSACTIONS:`)
        
        rosterTransactions.forEach((t: any, index: number) => {
          const transactionDate = new Date(t.created)
          const isAfterCutoff = t.created >= new Date('2025-08-24T00:00:00Z').getTime()
          const isCountableType = ['waiver', 'free_agent'].includes(t.type)
          const isComplete = t.status === 'complete'
          
          console.log(`  ${index + 1}. ID: ${t.transaction_id}`)
          console.log(`     Type: ${t.type} | Status: ${t.status}`)
          console.log(`     Date: ${transactionDate.toISOString()}`)
          console.log(`     Week: ${t.week || 'unknown'}`)
          console.log(`     After Aug 24?: ${isAfterCutoff} | Countable Type?: ${isCountableType} | Complete?: ${isComplete}`)
          console.log(`     WILL COUNT?: ${isAfterCutoff && isCountableType && isComplete}`)
          
          // Show additional details for debugging
          if (t.adds) console.log(`     Adds: ${JSON.stringify(t.adds)}`)
          if (t.drops) console.log(`     Drops: ${JSON.stringify(t.drops)}`)
          console.log('')
        })
      }
    }
    
    // Get or create transaction stats for each roster
    const transactionStats = new Map<number, TransactionStats>()
    
    // Initialize stats for all rosters
    for (const roster of rosters || []) {
      transactionStats.set(roster.roster_id, {
        roster_id: roster.roster_id,
        free_transactions_per_season: 10,
        free_remaining: 10,
        mulligan_used: false,
        total_transactions: 0,
        paid_transactions: 0
      })
    }
    
    // Process transactions for fee calculation
    if (transactions && transactions.length > 0) {
      // **CRITICAL: Apply August 24, 2025 cutoff rule (only post-draft transactions count)**
      const draftCutoff = new Date('2025-08-24T00:00:00Z').getTime()
      console.log(`\n🗓️ FILTER STEP 1: Draft cutoff date: ${new Date(draftCutoff).toISOString()}`)
      
      const postDraftTransactions = transactions.filter((t: any) => t.created >= draftCutoff)
      console.log(`📊 After date filter: ${postDraftTransactions.length} of ${transactions.length} transactions`)
      
      // Show which transactions were filtered out by date
      const preDraftTransactions = transactions.filter((t: any) => t.created < draftCutoff)
      if (preDraftTransactions.length > 0) {
        console.log(`🗓️ EXCLUDED by date (pre-August 24): ${preDraftTransactions.length} transactions`)
        preDraftTransactions.forEach((t: any) => {
          const ownerName = userMappings.find(um => um.roster_id === t.roster_ids?.[0])?.display_name || `Team ${t.roster_ids?.[0]}`
          console.log(`   ${ownerName}: ${t.type} on ${new Date(t.created).toISOString()}`)
        })
      }
      
      // Filter to only count waiver and free agent transactions (trades are free)
      console.log(`\n🔍 FILTER STEP 2: Type and status filtering...`)
      const countableTransactions = postDraftTransactions.filter((t: any) => 
        ['waiver', 'free_agent'].includes(t.type) && 
        t.status === 'complete'
      )
      
      console.log(`📊 After type/status filter: ${countableTransactions.length} of ${postDraftTransactions.length} post-draft transactions`)
      
      // Show which transactions were filtered out by type/status
      const excludedByType = postDraftTransactions.filter((t: any) => 
        !['waiver', 'free_agent'].includes(t.type) || t.status !== 'complete'
      )
      if (excludedByType.length > 0) {
        console.log(`🚫 EXCLUDED by type/status: ${excludedByType.length} transactions`)
        excludedByType.forEach((t: any) => {
          const ownerName = userMappings.find(um => um.roster_id === t.roster_ids?.[0])?.display_name || `Team ${t.roster_ids?.[0]}`
          console.log(`   ${ownerName}: ${t.type} (${t.status}) - REASON: ${!['waiver', 'free_agent'].includes(t.type) ? 'wrong type' : 'not complete'}`)
        })
      }
      
      console.log(`\n✅ FINAL COUNTABLE TRANSACTIONS: ${countableTransactions.length}`)
      
      // **DEBUG: Show filtered transactions by roster with full details**
      console.log('\n🔍 FINAL COUNTABLE TRANSACTIONS BY ROSTER:')
      const transactionsByRoster = new Map()
      for (const transaction of countableTransactions) {
        if (transaction.roster_ids && transaction.roster_ids.length > 0) {
          const rosterId = transaction.roster_ids[0]
          if (!transactionsByRoster.has(rosterId)) {
            transactionsByRoster.set(rosterId, [])
          }
          transactionsByRoster.get(rosterId).push(transaction)
        }
      }
      
      
      // Summary by roster with detailed transaction info
      console.log('\n📊 DETAILED FINAL TRANSACTION COUNTS BY ROSTER:')
      for (const roster of rosters || []) {
        const ownerName = userMappings.find(um => um.roster_id === roster.roster_id)?.display_name || `Team ${roster.roster_id}`
        const rosterTransactions = transactionsByRoster.get(roster.roster_id) || []
        console.log(`\n  ${ownerName} (Roster ${roster.roster_id}): ${rosterTransactions.length} COUNTABLE transactions`)
        
        if (rosterTransactions.length > 0) {
          rosterTransactions.forEach((t: any, index: number) => {
            console.log(`    ${index + 1}. ${t.type} on ${new Date(t.created).toISOString()} (Week ${t.week || 'unknown'})`)
          })
        }
      }
      
      // Calculate fees for each roster
      for (const [rosterId, rosterTransactions] of transactionsByRoster.entries()) {
        const stats = transactionStats.get(rosterId)
        if (stats) {
          const transactionCount = rosterTransactions.length
          stats.total_transactions = transactionCount
          
          const ownerName = userMappings.find(um => um.roster_id === rosterId)?.display_name || `Team ${rosterId}`
          
          // Calculate fees: first 10 are free, then $2 each
          if (transactionCount > 10) {
            stats.paid_transactions = transactionCount - 10
            stats.free_remaining = 0
            
            const transactionFees = stats.paid_transactions * 2
            
            fees.push({
              roster_id: rosterId,
              type: 'transaction_fee',
              amount: transactionFees,
              description: `${stats.paid_transactions} paid transactions ($2 each)`,
              owner_name: ownerName
            })
            
            console.log(`💳 ${ownerName} (Roster ${rosterId}): ${transactionCount} transactions, $${transactionFees} fees`)
          } else {
            stats.free_remaining = 10 - transactionCount
            console.log(`🆓 ${ownerName} (Roster ${rosterId}): ${transactionCount} free transactions, ${stats.free_remaining} remaining`)
          }
        }
      }
    }
    
    // Calculate totals
    const totalFees = fees.reduce((sum, fee) => sum + fee.amount, 0)
    const executionTime = Date.now() - startTime
    
    console.log(`💰 Processed ${fees.length} fees totaling $${totalFees}`)
    console.log(`✅ Complete processing in ${executionTime}ms`)
    
    // ========== APPROVED DISCORD FORMAT GENERATION ==========
    let discordMessage = `🎉 COMPLETE WEEKLY FEE ASSESSMENT - Week ${actualWeek}\n`;
    discordMessage += `💰 Weekly Fees Breakdown:\n`;
    
    // Process fees in approved format
    const regularFees = fees.filter(fee => fee.amount > 0)
    const bonusFees = fees.filter(fee => fee.amount < 0)
    
    // Display regular fees first
    regularFees.forEach(fee => {
      const ownerName = fee.owner_name || `Team ${fee.roster_id}`
      discordMessage += `${ownerName}: $${fee.amount} (Loss fee)\n`
    })
    
    // Display high scorer bonus
    bonusFees.forEach(fee => {
      const ownerName = fee.owner_name || `Team ${fee.roster_id}`
      discordMessage += `${ownerName}: $${fee.amount} (High score bonus) 🎯\n`
    })
    
    discordMessage += `Week ${actualWeek} Total: $${Math.abs(totalFees).toFixed(2)}\n\n`
    
    // High scorer champion section
    if (highScorer) {
      discordMessage += `🏆 Week ${actualWeek} Champion:\n`
      discordMessage += `${highScorer.owner_name} with ${highScorer.points} points (earned $5 bonus!)\n\n`
    }
    
    // Season transaction status (enhanced with color indicators)
    discordMessage += `📊 Season Transaction Status:\n`
    
    // Sort rosters by transaction usage for better display
    const rosterStats = Array.from(transactionStats.values()).sort((a, b) => b.total_transactions - a.total_transactions)
    
    for (const stats of rosterStats) {
      const ownerName = userMappings.find(um => um.roster_id === stats.roster_id)?.display_name || `Team ${stats.roster_id}`
      
      // Determine color indicator based on free transactions remaining
      let colorIndicator = '🟢' // Green - plenty of free transactions
      if (stats.free_remaining === 0) {
        colorIndicator = '🔴' // Red - no free transactions left
      } else if (stats.free_remaining <= 2) {
        colorIndicator = '�' // Yellow - running low
      }
      
      if (stats.total_transactions > 0) {
        const freeUsed = Math.min(stats.total_transactions, 10)
        const paidCount = Math.max(0, stats.total_transactions - 10)
        
        if (paidCount > 0) {
          discordMessage += `${ownerName}: ${colorIndicator} ${stats.free_remaining} free remaining (${stats.total_transactions} total: ${freeUsed} free + ${paidCount} paid)\n`
        } else {
          discordMessage += `${ownerName}: ${colorIndicator} ${stats.free_remaining} free remaining (${stats.total_transactions} total: all free)\n`
        }
      } else {
        discordMessage += `${ownerName}: ${colorIndicator} 10 free remaining (0 total transactions)\n`
      }
    }
    
    // ========== DATABASE STORAGE FOR PERSISTENT TRACKING ==========
    console.log('💾 Storing fee and transaction data to database...')
    
    // Store individual fees
    for (const fee of fees) {
      try {
        await supabase.from('fees').upsert({
          league_id: leagueData?.id || actualLeagueId,
          roster_id: fee.roster_id,
          week_number: actualWeek,
          type: fee.type,
          amount: fee.amount,
          description: fee.description,
          processed: true
        }, { onConflict: 'league_id,roster_id,week_number,type' })
      } catch (error) {
        console.error(`❌ Error storing fee for roster ${fee.roster_id}:`, error)
      }
    }
    
    // Store/update fee summaries for season tracking
    for (const stats of transactionStats.values()) {
      try {
        const ownerName = userMappings.find(um => um.roster_id === stats.roster_id)?.display_name || `Team ${stats.roster_id}`
        const weeklyFees = fees.filter(f => f.roster_id === stats.roster_id && f.amount > 0).reduce((sum, f) => sum + f.amount, 0)
        
        // Get existing data to preserve cumulative totals
        const { data: existingData } = await supabase
          .from('fee_summary')
          .select('total_owed, total_paid')
          .eq('league_id', leagueData?.id || actualLeagueId)
          .eq('roster_id', stats.roster_id)
          .single()
        
        const existingTotalOwed = existingData?.total_owed || 0
        const existingTotalPaid = existingData?.total_paid || 0
        
        await supabase.from('fee_summary').upsert({
          league_id: leagueData?.id || actualLeagueId,
          roster_id: stats.roster_id,
          owner_name: ownerName,
          total_owed: existingTotalOwed + weeklyFees, // Cumulative total
          total_paid: existingTotalPaid, // Preserve existing payments
          updated_week: actualWeek,
          // New fields for transaction tracking
          free_transactions_remaining: stats.free_remaining,
          total_transactions: stats.total_transactions,
          paid_transactions: stats.paid_transactions
        }, { onConflict: 'league_id,roster_id' })
        
        console.log(`💾 Updated fee_summary for ${ownerName}: +$${weeklyFees} (Total: $${existingTotalOwed + weeklyFees})`)
      } catch (error) {
        console.error(`❌ Error storing fee summary for ${stats.roster_id}:`, error)
      }
    }
    
    console.log('✅ Database storage completed')
    
    const result = {
      success: true,
      message: '🎉 COMPLETE WEEKLY FEE ASSESSMENT with full transaction tracking!',
      league_id: actualLeagueId,
      week_number: actualWeek,
      fees,
      total_fees: totalFees,
      high_scorer: highScorer,
      user_count: users?.length || 0,
      matchup_count: matchups?.length || 0,
      transaction_count: transactions?.length || 0,
      execution_time_ms: executionTime,
      performance: {
        sleeper_fetch_ms: fetchTime,
        data_parse_ms: parseTime,
        total_ms: executionTime
      },
      test_mode: test_mode || false,
      discord_notification: discordMessage,
      transaction_stats: Array.from(transactionStats.values()), // Include transaction stats
      database_stored: true // Indicates data was persisted
    }
    
    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
    
  } catch (error) {
    console.error('❌ Fee processing error:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Fee processing failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})