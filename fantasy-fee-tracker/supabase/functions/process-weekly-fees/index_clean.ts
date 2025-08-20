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
}

interface SeasonSummary {
  roster_id: number
  owner_name: string
  total_owed: number
  total_paid: number
  balance: number
  loss_count: number
  high_score_count: number
  transaction_count: number
  penalty_count: number
}

interface DiscordEmbed {
  title: string
  color: number
  fields: EmbedField[]
  footer: { text: string; icon_url: string }
  timestamp: string
}

interface EmbedField {
  name: string
  value: string
  inline: boolean
}

async function fetchSleeperData(leagueId: string, weekNumber: number) {
  try {
    const [matchupsResponse, transactionsResponse] = await Promise.all([
      fetch(`https://api.sleeper.app/v1/league/${leagueId}/matchups/${weekNumber}`),
      fetch(`https://api.sleeper.app/v1/league/${leagueId}/transactions/${weekNumber}`)
    ])
    
    const matchups = await matchupsResponse.json()
    const transactions = await transactionsResponse.json()
    
    return { matchups, transactions }
  } catch (error) {
    console.error('Error fetching Sleeper data:', error)
    throw error
  }
}

async function createUserMappings(supabase: any, sleeperLeagueId: string, leagueId: string): Promise<UserMapping[]> {
  try {
    // Fetch users and rosters from Sleeper API
    const [usersResponse, rostersResponse] = await Promise.all([
      fetch(`https://api.sleeper.app/v1/league/${sleeperLeagueId}/users`),
      fetch(`https://api.sleeper.app/v1/league/${sleeperLeagueId}/rosters`)
    ])
    
    const users = await usersResponse.json()
    const rosters = await rostersResponse.json()
    
    const mappings: UserMapping[] = []
    
    // Create mapping between rosters and users
    rosters.forEach((roster: any) => {
      const user = users.find((u: any) => u.user_id === roster.owner_id)
      if (user) {
        mappings.push({
          roster_id: roster.roster_id,
          sleeper_user_id: user.user_id,
          display_name: user.display_name || user.username || `Team ${roster.roster_id}`
        })
      }
    })
    
    // Store/update user mappings in database
    for (const mapping of mappings) {
      await supabase.from('users').upsert({
        league_id: leagueId,
        sleeper_user_id: mapping.sleeper_user_id,
        roster_id: mapping.roster_id,
        display_name: mapping.display_name
      }, { onConflict: 'league_id,sleeper_user_id' })
    }
    
    return mappings
  } catch (error) {
    console.error('Error creating user mappings:', error)
    return []
  }
}

async function getTransactionStats(supabase: any, leagueId: string, freeTransactionsPerSeason: number): Promise<TransactionStats[]> {
  try {
    // Get all rosters for this league
    const { data: users } = await supabase
      .from('users')
      .select('roster_id')
      .eq('league_id', leagueId)
    
    if (!users) return []
    
    // Get transaction counts for each roster
    const { data: transactionCounts } = await supabase
      .from('transactions')
      .select('roster_id, count(*)')
      .eq('league_id', leagueId)
      .group('roster_id')
    
    // Get penalty counts to check mulligan usage
    const { data: penaltyCounts } = await supabase
      .from('inactive_penalties')
      .select('roster_id, count(*)')
      .eq('league_id', leagueId)
      .eq('fee_amount', 0) // Mulligan penalties have 0 fee
      .group('roster_id')
    
    const stats: TransactionStats[] = []
    
    users.forEach((user: any) => {
      const transactionCount = transactionCounts?.find((tc: any) => tc.roster_id === user.roster_id)?.count || 0
      const mulliganCount = penaltyCounts?.find((pc: any) => pc.roster_id === user.roster_id)?.count || 0
      
      stats.push({
        roster_id: user.roster_id,
        free_transactions_per_season: freeTransactionsPerSeason,
        free_remaining: Math.max(0, freeTransactionsPerSeason - transactionCount),
        mulligan_used: mulliganCount > 0
      })
    })
    
    return stats
  } catch (error) {
    console.error('Error getting transaction stats:', error)
    return []
  }
}

async function processMatchupsAndFees(
  supabase: any, 
  league: any, 
  sleeperData: any, 
  weekNumber: number, 
  userMappings: UserMapping[],
  transactionStats: TransactionStats[]
) {
  const fees: FeeData[] = []
  const { matchups, transactions } = sleeperData
  
  // Create user mapping lookup
  const userMap = new Map()
  userMappings.forEach(mapping => {
    userMap.set(mapping.roster_id, mapping.display_name)
  })
  
  // Create transaction stats lookup
  const statsMap = new Map()
  transactionStats.forEach(stat => {
    statsMap.set(stat.roster_id, stat)
  })
  
  try {
    // Process each matchup
    for (const matchup of matchups) {
      const ownerName = userMap.get(matchup.roster_id) || `Team ${matchup.roster_id}`
      
      // Find opponent
      const opponent = matchups.find((m: any) => 
        m.matchup_id === matchup.matchup_id && m.roster_id !== matchup.roster_id
      )
      
      const isWinner = opponent ? matchup.points > opponent.points : false
      
      // Store matchup
      await supabase.from('matchups').upsert({
        league_id: league.id,
        week_number: weekNumber,
        roster_id: matchup.roster_id,
        opponent_roster_id: opponent?.roster_id,
        points: matchup.points || 0,
        opponent_points: opponent?.points || 0,
        is_winner: isWinner,
        loss_fee_applied: !isWinner,
        processed_at: new Date().toISOString()
      }, { onConflict: 'league_id,week_number,roster_id' })
      
      // Apply loss fee
      if (!isWinner && opponent) {
        fees.push({
          roster_id: matchup.roster_id,
          type: 'loss_fee',
          amount: league.loss_fee,
          description: `Week ${weekNumber} loss (${matchup.points} vs ${opponent.points})`,
          owner_name: ownerName
        })
      }
      
      // Check for inactive players with mulligan logic
      const inactivePlayers = checkInactivePlayers(matchup)
      const stats = statsMap.get(matchup.roster_id)
      
      for (const player of inactivePlayers) {
        // Apply mulligan logic - first inactive player is free per roster per season
        if (stats && !stats.mulligan_used) {
          // First inactive player - use mulligan (no fee)
          await supabase.from('inactive_penalties').insert({
            league_id: league.id,
            roster_id: matchup.roster_id,
            week_number: weekNumber,
            player_name: player,
            fee_amount: 0 // Mulligan - no fee
          })
          
          fees.push({
            roster_id: matchup.roster_id,
            type: 'mulligan_used',
            amount: 0,
            description: `[MULLIGAN] Used for inactive player: ${player}`,
            owner_name: ownerName
          })
          
          // Update stats to reflect mulligan used
          stats.mulligan_used = true
        } else {
          // Apply normal penalty
          await supabase.from('inactive_penalties').insert({
            league_id: league.id,
            roster_id: matchup.roster_id,
            week_number: weekNumber,
            player_name: player,
            fee_amount: league.inactive_player_fee
          })
          
          fees.push({
            roster_id: matchup.roster_id,
            type: 'inactive_penalty',
            amount: league.inactive_player_fee,
            description: `Inactive player penalty: ${player}`,
            owner_name: ownerName
          })
        }
      }
    }
    
    // Find highest scorer
    const highScorer = matchups.reduce((max: any, m: any) => 
      (!max || m.points > max.points) ? m : max
    , null)
    
    if (highScorer) {
      await supabase.from('matchups')
        .update({ is_high_scorer: true })
        .eq('league_id', league.id)
        .eq('week_number', weekNumber)
        .eq('roster_id', highScorer.roster_id)
      
      const ownerName = userMap.get(highScorer.roster_id) || `Team ${highScorer.roster_id}`
      fees.push({
        roster_id: highScorer.roster_id,
        type: 'high_score_bonus',
        amount: -Math.abs(league.high_score_bonus || 5),
        description: `[HIGH SCORER] High scorer bonus (${highScorer.points} pts)`,
        owner_name: ownerName
      })
    }
    
    // Process transactions with free transaction logic
    for (const transaction of transactions || []) {
      if (['waiver', 'free_agent', 'trade'].includes(transaction.type)) {
        const rosterId = transaction.roster_ids?.[0]
        const ownerName = userMap.get(rosterId) || `Team ${rosterId}`
        const stats = statsMap.get(rosterId)
        
        // Check if this roster has free transactions remaining
        const shouldApplyFee = !stats || stats.free_remaining <= 0
        const feeAmount = shouldApplyFee ? league.transaction_fee : 0
        
        await supabase.from('transactions').upsert({
          league_id: league.id,
          sleeper_transaction_id: transaction.transaction_id,
          roster_id: rosterId,
          type: transaction.type,
          week_number: weekNumber,
          fee_amount: feeAmount,
          processed: true
        }, { onConflict: 'sleeper_transaction_id' })
        
        if (shouldApplyFee) {
          fees.push({
            roster_id: rosterId,
            type: 'transaction_fee',
            amount: feeAmount,
            description: `${transaction.type} transaction`,
            owner_name: ownerName
          })
        } else {
          fees.push({
            roster_id: rosterId,
            type: 'free_transaction',
            amount: 0,
            description: `[FREE] ${transaction.type} (${stats?.free_remaining || 0} remaining)`,
            owner_name: ownerName
          })
          
          // Update remaining count
          if (stats) stats.free_remaining--
        }
      }
    }
    
    // Update fee summaries
    for (const fee of fees) {
      if (fee.amount !== 0) {
        await updateFeeSummary(supabase, league.id, fee.roster_id, fee.amount)
      }
    }
    
    return { fees, highScorer }
  } catch (error) {
    console.error('Error processing matchups and fees:', error)
    throw error
  }
}

function checkInactivePlayers(matchup: any): string[] {
  const inactivePlayers: string[] = []
  
  try {
    // Check if any starters scored 0 points
    if (matchup.starters_points) {
      matchup.starters_points.forEach((points: number, index: number) => {
        if (points === 0 && matchup.starters[index]) {
          // Use player ID as name for now - could enhance with player name lookup
          inactivePlayers.push(matchup.starters[index])
        }
      })
    }
  } catch (error) {
    console.error('Error checking inactive players:', error)
  }
  
  return inactivePlayers
}

async function updateFeeSummary(supabase: any, leagueId: string, rosterId: number, amount: number) {
  try {
    const { data: existing } = await supabase
      .from('fee_summary')
      .select('*')
      .eq('league_id', leagueId)
      .eq('roster_id', rosterId)
      .single()
    
    if (existing) {
      await supabase.from('fee_summary')
        .update({
          total_owed: existing.total_owed + amount,
          balance: existing.balance + amount,
          last_updated: new Date().toISOString()
        })
        .eq('id', existing.id)
    } else {
      await supabase.from('fee_summary').insert({
        league_id: leagueId,
        roster_id: rosterId,
        total_owed: amount,
        balance: amount
      })
    }
  } catch (error) {
    console.error('Error updating fee summary:', error)
  }
}

async function getSeasonSummaries(supabase: any, leagueId: string, userMappings: UserMapping[]): Promise<SeasonSummary[]> {
  try {
    // Get fee summaries
    const { data: feeSummaries } = await supabase
      .from('fee_summary')
      .select('*')
      .eq('league_id', leagueId)
    
    // Get matchup stats
    const { data: matchupStats } = await supabase
      .from('matchups')
      .select('roster_id, is_winner, is_high_scorer')
      .eq('league_id', leagueId)
    
    // Get transaction counts
    const { data: transactionCounts } = await supabase
      .from('transactions')
      .select('roster_id, count(*)')
      .eq('league_id', leagueId)
      .group('roster_id')
    
    // Get penalty counts
    const { data: penaltyCounts } = await supabase
      .from('inactive_penalties')
      .select('roster_id, count(*)')
      .eq('league_id', leagueId)
      .group('roster_id')
    
    const summaries: SeasonSummary[] = []
    
    // Create user mapping lookup
    const userMap = new Map()
    userMappings.forEach(mapping => {
      userMap.set(mapping.roster_id, mapping.display_name)
    })
    
    // Process each fee summary
    feeSummaries?.forEach((fs: any) => {
      const matchups = matchupStats?.filter((ms: any) => ms.roster_id === fs.roster_id) || []
      const transactionCount = transactionCounts?.find((tc: any) => tc.roster_id === fs.roster_id)?.count || 0
      const penaltyCount = penaltyCounts?.find((pc: any) => pc.roster_id === fs.roster_id)?.count || 0
      
      summaries.push({
        roster_id: fs.roster_id,
        owner_name: userMap.get(fs.roster_id) || `Team ${fs.roster_id}`,
        total_owed: fs.total_owed || 0,
        total_paid: fs.total_paid || 0,
        balance: fs.balance || 0,
        loss_count: matchups.filter(m => !m.is_winner).length,
        high_score_count: matchups.filter(m => m.is_high_scorer).length,
        transaction_count: transactionCount,
        penalty_count: penaltyCount
      })
    })
    
    return summaries.sort((a, b) => b.balance - a.balance) // Sort by balance descending
  } catch (error) {
    console.error('Error getting season summaries:', error)
    return []
  }
}

async function sendEnhancedDiscordNotification(
  league: any, 
  weekNumber: number, 
  fees: FeeData[], 
  highScorer: any, 
  userMappings: UserMapping[],
  seasonSummaries: SeasonSummary[]
) {
  if (!league.discord_webhook_url) {
    console.log('No Discord webhook URL configured')
    return
  }
  
  try {
    // Create user mapping lookup
    const userMap = new Map()
    userMappings.forEach(mapping => {
      userMap.set(mapping.roster_id, mapping.display_name)
    })
    
    // Group fees by roster
    const feesByRoster = new Map()
    fees.forEach(fee => {
      if (!feesByRoster.has(fee.roster_id)) {
        feesByRoster.set(fee.roster_id, [])
      }
      feesByRoster.get(fee.roster_id).push(fee)
    })
    
    // Build main embed fields
    const fields = []
    
    // Weekly fee summary
    if (feesByRoster.size > 0) {
      let feeText = ''
      for (const [rosterId, rosterFees] of feesByRoster) {
        const ownerName = userMap.get(rosterId) || `Team ${rosterId}`
        const totalFees = rosterFees.reduce((sum, fee) => sum + fee.amount, 0)
        
        if (totalFees !== 0) {
          feeText += `**${ownerName}**: $${Math.abs(totalFees)}${totalFees < 0 ? ' (bonus)' : ''}\n`
          
          // Add fee details
          rosterFees.forEach(fee => {
            if (fee.type === 'mulligan_used' || fee.type === 'free_transaction') {
              feeText += `  -> ${fee.description}\n`
            } else if (fee.amount !== 0) {
              feeText += `  -> ${fee.description} ($${Math.abs(fee.amount)})\n`
            }
          })
        }
      }
      
      if (feeText) {
        fields.push({
          name: `Week ${weekNumber} Fees`,
          value: feeText.slice(0, 1024), // Discord limit
          inline: false
        })
      }
    }
    
    // High scorer
    if (highScorer) {
      const ownerName = userMap.get(highScorer.roster_id) || `Team ${highScorer.roster_id}`
      fields.push({
        name: 'High Scorer',
        value: `**${ownerName}** (${highScorer.points} points)`,
        inline: true
      })
    }
    
    // Season standings (top 5)
    if (seasonSummaries.length > 0) {
      let standingsText = ''
      seasonSummaries.slice(0, 5).forEach((summary, index) => {
        const position = index + 1
        standingsText += `${position}. **${summary.owner_name}**: $${Math.abs(summary.balance)}${summary.balance < 0 ? ' (ahead)' : ' owed'}\n`
      })
      
      fields.push({
        name: 'Season Standings (Top 5)',
        value: standingsText,
        inline: false
      })
    }
    
    // Calculate total fees for the week
    const totalWeeklyFees = fees.reduce((sum, fee) => sum + Math.max(0, fee.amount), 0)
    
    const embed: DiscordEmbed = {
      title: `Fantasy Football - Week ${weekNumber} Results`,
      color: 0x1DB954, // Spotify green
      fields: fields,
      footer: {
        text: `Total weekly fees: $${totalWeeklyFees} | Enhanced processing with owner names`,
        icon_url: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/scoreboard/fantasy.png'
      },
      timestamp: new Date().toISOString()
    }
    
    const payload = {
      embeds: [embed],
      username: 'Fantasy Fee Tracker',
      avatar_url: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/scoreboard/fantasy.png'
    }
    
    const response = await fetch(league.discord_webhook_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    
    if (!response.ok) {
      console.error('Discord webhook failed:', response.status, await response.text())
    } else {
      console.log('Enhanced Discord notification sent successfully')
    }
  } catch (error) {
    console.error('Error sending enhanced Discord notification:', error)
  }
}

// Main enhanced handler function
export default async function handler(req: Request): Promise<Response> {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  }
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  
  try {
    const { week_number, league_id } = await req.json()
    
    if (!week_number || !league_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: week_number and league_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    console.log(`Starting enhanced fee processing for league ${league_id}, week ${week_number}`)
    
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    
    // Get league configuration
    const { data: league, error: leagueError } = await supabase
      .from('leagues')
      .select('*')
      .eq('id', league_id)
      .single()
    
    if (leagueError || !league) {
      return new Response(
        JSON.stringify({ error: 'League not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Fetch data from Sleeper API
    const sleeperData = await fetchSleeperData(league.sleeper_league_id, week_number)
    
    // Create user mappings (owner names)
    const userMappings = await createUserMappings(supabase, league.sleeper_league_id, league.id)
    
    // Get transaction stats for free transaction logic
    const transactionStats = await getTransactionStats(supabase, league.id, league.free_transactions_per_season || 0)
    
    // Process matchups and fees with enhanced logic
    const { fees, highScorer } = await processMatchupsAndFees(
      supabase,
      league,
      sleeperData,
      week_number,
      userMappings,
      transactionStats
    )
    
    // Get season summaries for Discord
    const seasonSummaries = await getSeasonSummaries(supabase, league.id, userMappings)
    
    // Send enhanced Discord notification
    await sendEnhancedDiscordNotification(
      league,
      week_number,
      fees,
      highScorer,
      userMappings,
      seasonSummaries
    )
    
    const response = {
      success: true,
      league_id,
      week_number,
      fees_processed: fees.length,
      total_fees: fees.reduce((sum, fee) => sum + Math.max(0, fee.amount), 0),
      high_scorer: highScorer ? {
        roster_id: highScorer.roster_id,
        owner_name: userMappings.find(m => m.roster_id === highScorer.roster_id)?.display_name || `Team ${highScorer.roster_id}`,
        points: highScorer.points
      } : null,
      enhancements_active: {
        owner_names: true,
        free_transactions: true,
        mulligan_system: true,
        season_summaries: true
      }
    }
    
    console.log('Enhanced fee processing completed successfully:', response)
    
    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Enhanced fee processing error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Enhanced fee processing failed', 
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}
