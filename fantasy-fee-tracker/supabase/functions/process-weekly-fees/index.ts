/// <reference path="./types.d.ts" />
// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Define types for better type safety
interface FeeData {
  roster_id: number;
  type: string;
  amount: number;
  description: string;
  owner_name?: string; // Enhanced: Add owner name
}

interface UserMapping {
  roster_id: number;
  sleeper_user_id: string;
  display_name: string;
}

interface TransactionStats {
  roster_id: number;
  transactions_used: number;
  free_transactions_remaining: number;
  mulligan_used: boolean;
}

interface FeeSummary {
  total: number;
  items: FeeData[];
}

interface EmbedField {
  name: string;
  value: string;
  inline: boolean;
}

interface DiscordEmbed {
  title: string;
  color: number;
  fields: EmbedField[];
  footer: {
    text: string;
    icon_url: string;
  };
  timestamp: string;
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get request data
    const { week_number, league_id } = await req.json()
    
    // Get league configuration
    const { data: league } = await supabase
      .from('leagues')
      .select('*')
      .eq('id', league_id)
      .single()

    if (!league) {
      throw new Error('League not found')
    }

    console.log('League configuration:', league)

    console.log('League fees configuration:', {
        loss_fee: league.loss_fee,
        inactive_player_fee: league.inactive_player_fee,
        high_score_bonus: league.high_score_bonus,
        free_transactions_per_season: league.free_transactions_per_season
    })

    // Return the league configuration for debugging
    if (req.headers.get('debug') === 'true') {
      return new Response(
        JSON.stringify({ league_config: league, sleeper_league_id: league.sleeper_league_id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch data from Sleeper API
    const sleeperData = await fetchSleeperData(league.sleeper_league_id, week_number)
    
    // Create user mappings for owner names
    const userMappings = await createUserMappings(supabase, sleeperData, league_id)
    
    // Get transaction stats for free transaction logic
    const transactionStats = await getTransactionStats(supabase, league_id, league.free_transactions_per_season || 5)
    
    // Process matchups and calculate fees
    const fees = await processMatchupsAndFees(supabase, league, sleeperData, week_number, userMappings, transactionStats)
    
    // Send Discord notification
    await sendDiscordNotification(league.discord_webhook_url, fees, week_number)

    return new Response(
      JSON.stringify({ success: true, fees }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})

async function fetchSleeperData(leagueId: string, weekNumber: number) {
  const baseUrl = 'https://api.sleeper.app/v1'
  
  console.log(`Fetching Sleeper data for league: ${leagueId}, week: ${weekNumber}`)
  
  // Fetch matchups
  const matchupsRes = await fetch(`${baseUrl}/league/${leagueId}/matchups/${weekNumber}`)
  const matchups = await matchupsRes.json()
  console.log(`Matchups response (${matchupsRes.status}):`, matchups)
  
  // Fetch rosters
  const rostersRes = await fetch(`${baseUrl}/league/${leagueId}/rosters`)
  const rosters = await rostersRes.json()
  console.log(`Rosters response (${rostersRes.status}):`, rosters)
  
  // Fetch users
  const usersRes = await fetch(`${baseUrl}/league/${leagueId}/users`)
  const users = await usersRes.json()
  console.log(`Users response (${usersRes.status}):`, users)
  
  // Fetch transactions
  const transactionsRes = await fetch(`${baseUrl}/league/${leagueId}/transactions/${weekNumber}`)
  const transactions = await transactionsRes.json()
  console.log(`Transactions response (${transactionsRes.status}):`, transactions)
  
  return { matchups, rosters, users, transactions }
}

async function createUserMappings(supabase: any, sleeperData: any, leagueId: string): Promise<UserMapping[]> {
  const { users, rosters } = sleeperData
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
    try {
      await supabase.from('users').upsert({
        league_id: leagueId,
        sleeper_user_id: mapping.sleeper_user_id,
        roster_id: mapping.roster_id,
        display_name: mapping.display_name
      }, { onConflict: 'league_id,sleeper_user_id' })
    } catch (error) {
      console.error('Error storing user mapping:', error)
    }
  }
  
  return mappings
}

async function getTransactionStats(supabase: any, leagueId: string, freeTransactionsPerSeason: number): Promise<TransactionStats[]> {
  try {
    // Get all rosters for this league
    const { data: users } = await supabase
      .from('users')
      .select('roster_id')
      .eq('league_id', leagueId)
    
    if (!users) return []
    
    // Get transaction counts for each roster this season
    const { data: transactionCounts } = await supabase
      .from('transactions')
      .select('roster_id, count(*)')
      .eq('league_id', leagueId)
      .group('roster_id')
    
    // Get mulligan status (inactive penalties with 0 fee indicate mulligan used)
    const { data: mulliganUsage } = await supabase
      .from('inactive_penalties')
      .select('roster_id, count(*)')
      .eq('league_id', leagueId)
      .eq('fee_amount', 0)
      .group('roster_id')
    
    const stats: TransactionStats[] = []
    
    users.forEach((user: any) => {
      const transactionCount = transactionCounts?.find((tc: any) => tc.roster_id === user.roster_id)?.count || 0
      const mulliganCount = mulliganUsage?.find((mu: any) => mu.roster_id === user.roster_id)?.count || 0
      
      stats.push({
        roster_id: user.roster_id,
        transactions_used: transactionCount,
        free_transactions_remaining: Math.max(0, freeTransactionsPerSeason - transactionCount),
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
  const { matchups, rosters, users, transactions } = sleeperData
  
  // Create user mapping lookup for quick access
  const userMap = new Map()
  userMappings.forEach(mapping => {
    userMap.set(mapping.roster_id, mapping.display_name)
  })
  
  // Create transaction stats lookup
  const statsMap = new Map()
  transactionStats.forEach(stat => {
    statsMap.set(stat.roster_id, stat)
  })
  
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
        description: `Week ${weekNumber} loss fee`,
        owner_name: ownerName
      })
    }
    
    // Check for inactive players with mulligan logic
    const inactivePlayers = checkInactivePlayers(matchup)
    const rosterStats = statsMap.get(matchup.roster_id)
    
    for (const player of inactivePlayers) {
      // Apply mulligan logic - first inactive player is free per roster per season
      if (rosterStats && !rosterStats.mulligan_used) {
        // Use mulligan - no fee for first inactive player
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
          description: `[MULLIGAN] Free inactive player: ${player}`,
          owner_name: ownerName
        })
        
        // Update stats to reflect mulligan used
        rosterStats.mulligan_used = true
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
          description: `Inactive player: ${player}`,
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
  }
  
  // Process transactions with free transaction logic
  for (const transaction of transactions || []) {
    if (['waiver', 'free_agent', 'trade'].includes(transaction.type)) {
      const rosterId = transaction.roster_ids?.[0]
      const ownerName = userMap.get(rosterId) || `Team ${rosterId}`
      const rosterStats = statsMap.get(rosterId)
      
      // Check if this roster has free transactions remaining
      const hasFreeRemaining = rosterStats && rosterStats.free_transactions_remaining > 0
      const feeAmount = hasFreeRemaining ? 0 : league.transaction_fee
      
      await supabase.from('transactions').upsert({
        league_id: league.id,
        sleeper_transaction_id: transaction.transaction_id,
        roster_id: rosterId,
        type: transaction.type,
        week_number: weekNumber,
        fee_amount: feeAmount,
        processed: true
      }, { onConflict: 'sleeper_transaction_id' })
      
      if (hasFreeRemaining) {
        fees.push({
          roster_id: rosterId,
          type: 'free_transaction',
          amount: 0,
          description: `[FREE] ${transaction.type} (${rosterStats.free_transactions_remaining - 1} remaining)`,
          owner_name: ownerName
        })
        
        // Update remaining count
        rosterStats.free_transactions_remaining--
      } else {
        fees.push({
          roster_id: rosterId,
          type: 'transaction_fee',
          amount: league.transaction_fee,
          description: `${transaction.type} transaction`,
          owner_name: ownerName
        })
      }
    }
  }
  
  // Update fee summaries (only for actual fees, not free transactions)
  for (const fee of fees) {
    if (fee.amount > 0) {
      await updateFeeSummary(supabase, league.id, fee.roster_id, fee.amount)
    }
  }
  
  return { fees, highScorer }
}

function checkInactivePlayers(matchup: any): string[] {
  const inactivePlayers: string[] = []
  
  // Check if any starters scored 0 points
  if (matchup.starters_points) {
    matchup.starters_points.forEach((points: number, index: number) => {
      if (points === 0 && matchup.starters[index]) {
        inactivePlayers.push(matchup.starters[index])
      }
    })
  }
  
  return inactivePlayers
}

async function updateFeeSummary(supabase: any, leagueId: string, rosterId: number, amount: number) {
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
}

async function sendDiscordNotification(webhookUrl: string, data: any, weekNumber: number) {
  const { fees, highScorer } = data
  
  // Group fees by roster
  const feesByRoster: Record<string, FeeSummary> = fees.reduce((acc: Record<string, FeeSummary>, fee: FeeData) => {
    const rosterId = fee.roster_id.toString()
    if (!acc[rosterId]) {
      acc[rosterId] = { total: 0, items: [] }
    }
    acc[rosterId].total += fee.amount
    acc[rosterId].items.push(fee)
    return acc
  }, {})
  
  // Create Discord embed
  const embed: DiscordEmbed = {
    title: `📊 Week ${weekNumber} Fee Summary`,
    color: 0x5865F2,
    fields: [],
    footer: {
      text: 'Fantasy Fee Tracker | Powered by Sleeper API',
      icon_url: 'https://play-lh.googleusercontent.com/Gc1fceG8T5P6XqaFLTwFfq66OkreFWWUMpfIDT2UKmayMlJaXnTkgTpH1w1uEIlPhoo'
    },
    timestamp: new Date().toISOString()
  }
  
  // Add high scorer
  if (highScorer) {
    // Find owner name for high scorer
    const highScorerFee = fees.find((f: FeeData) => f.roster_id === highScorer.roster_id)
    const highScorerName = highScorerFee?.owner_name || `Team ${highScorer.roster_id}`
    
    embed.fields.push({
      name: '🏆 Highest Scorer',
      value: `${highScorerName}: ${highScorer.points} pts\n+$${data.highScoreBonus || 5} bonus`,
      inline: false
    })
  }
  
  // Add fees summary with owner names
  let totalWeekFees = 0
  for (const [rosterId, feeData] of Object.entries(feesByRoster) as [string, FeeSummary][]) {
    totalWeekFees += feeData.total
    // Get owner name from first fee item
    const ownerName = feeData.items[0]?.owner_name || `Team ${rosterId}`
    
    embed.fields.push({
      name: `${ownerName}`,
      value: `Fees: $${feeData.total.toFixed(2)}`,
      inline: true
    })
  }
  
  embed.fields.push({
    name: '💰 Total Week Fees',
    value: `$${totalWeekFees.toFixed(2)}`,
    inline: false
  })
  
  // Send to Discord
  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'Fantasy Fee Tracker',
      embeds: [embed]
    })
  })
}
