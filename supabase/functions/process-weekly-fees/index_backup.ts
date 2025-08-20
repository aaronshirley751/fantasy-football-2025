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

    // Fetch data from Sleeper API
    const sleeperData = await fetchSleeperData(league.sleeper_league_id, week_number)
    
    // Process matchups and calculate fees
    const fees = await processMatchupsAndFees(supabase, league, sleeperData, week_number)
    
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
  
  // Fetch matchups
  const matchupsRes = await fetch(`${baseUrl}/league/${leagueId}/matchups/${weekNumber}`)
  const matchups = await matchupsRes.json()
  
  // Fetch rosters
  const rostersRes = await fetch(`${baseUrl}/league/${leagueId}/rosters`)
  const rosters = await rostersRes.json()
  
  // Fetch users
  const usersRes = await fetch(`${baseUrl}/league/${leagueId}/users`)
  const users = await usersRes.json()
  
  // Fetch transactions
  const transactionsRes = await fetch(`${baseUrl}/league/${leagueId}/transactions/${weekNumber}`)
  const transactions = await transactionsRes.json()
  
  return { matchups, rosters, users, transactions }
}

async function processMatchupsAndFees(supabase: any, league: any, sleeperData: any, weekNumber: number) {
  const fees: FeeData[] = []
  const { matchups, rosters, users, transactions } = sleeperData
  
  // Process each matchup
  for (const matchup of matchups) {
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
        description: `Week ${weekNumber} loss fee`
      })
    }
    
    // Check for inactive players
    const inactivePlayers = checkInactivePlayers(matchup)
    for (const player of inactivePlayers) {
      fees.push({
        roster_id: matchup.roster_id,
        type: 'inactive_penalty',
        amount: league.inactive_player_fee,
        description: `Inactive player: ${player}`
      })
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
  
  // Process transactions
  for (const transaction of transactions || []) {
    if (['waiver', 'free_agent', 'trade'].includes(transaction.type)) {
      await supabase.from('transactions').upsert({
        league_id: league.id,
        sleeper_transaction_id: transaction.transaction_id,
        roster_id: transaction.roster_ids?.[0],
        type: transaction.type,
        week_number: weekNumber,
        fee_amount: league.transaction_fee,
        processed: true
      }, { onConflict: 'sleeper_transaction_id' })
      
      fees.push({
        roster_id: transaction.roster_ids?.[0],
        type: 'transaction_fee',
        amount: league.transaction_fee,
        description: `${transaction.type} transaction`
      })
    }
  }
  
  // Update fee summaries
  for (const fee of fees) {
    await updateFeeSummary(supabase, league.id, fee.roster_id, fee.amount)
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
    embed.fields.push({
      name: '🏆 Highest Scorer',
      value: `Roster ${highScorer.roster_id}: ${highScorer.points} pts\n+$${data.highScoreBonus || 5} bonus`,
      inline: false
    })
  }
  
  // Add fees summary
  let totalWeekFees = 0
  for (const [rosterId, feeData] of Object.entries(feesByRoster) as [string, FeeSummary][]) {
    totalWeekFees += feeData.total
    embed.fields.push({
      name: `Team ${rosterId}`,
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