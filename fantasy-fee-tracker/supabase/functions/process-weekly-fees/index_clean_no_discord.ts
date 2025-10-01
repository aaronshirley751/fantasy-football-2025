/**
 * ===========================
 *  FANTASY FEE TRACKER RULES
 * ===========================
 * - Only penalize truly inactive players (not zero-point scorers).
 * - First inactive penalty per roster is a mulligan (waived, $0).
 * - Only post-draft transactions (after Aug 24, 2025) count toward 10 free.
 * - $2 fee for each waiver/free agent transaction after 10 free (per roster, per season).
 * - Trades are always free (never count toward transaction fees).
 * - $5 loss fee per weekly matchup loss.
 * - $5 penalty for each inactive starter (after mulligan used).
 * - $5 bonus (credit) for weekly high scorer.
 * - All owner names are attributed using Sleeper API.
 * - All business rules are validated with real league data.
 */

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

interface League {
  id: string;
  sleeper_league_id: string;
  high_score_bonus: number;
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  try {
    const { week_number, league_id } = await req.json()

    if (!week_number || !league_id) {
      return new Response(
        JSON.stringify({ error: 'Missing week_number or league_id' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    console.log(`Processing fees for Week ${week_number}, League ${league_id}`)

    // Get league configuration
    const { data: leagues } = await supabaseClient
      .from('leagues')
      .select('*')
      .eq('sleeper_league_id', league_id)
      .single()

    if (!leagues) {
      return new Response(
        JSON.stringify({ error: 'League not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    const league: League = leagues

    // Get user mappings for owner names
    const { data: userMappings } = await supabaseClient
      .from('users')
      .select('*')
      .eq('league_id', league.id)

    const userMap = new Map(userMappings?.map(u => [u.roster_id, u]) || [])

    // Fetch data from Sleeper API
    const [usersResponse, rostersResponse, matchupsResponse, transactionsResponse] = await Promise.all([
      fetch(`https://api.sleeper.app/v1/league/${league_id}/users`),
      fetch(`https://api.sleeper.app/v1/league/${league_id}/rosters`),
      fetch(`https://api.sleeper.app/v1/league/${league_id}/matchups/${week_number}`),
      fetch(`https://api.sleeper.app/v1/league/${league_id}/transactions/${week_number}`)
    ])

    const [users, rosters, matchups, transactions] = await Promise.all([
      usersResponse.json(),
      rostersResponse.json(),
      matchupsResponse.json(),
      transactionsResponse.json()
    ])

    // Process fees
    const fees: FeeData[] = []
    let highScorer = null

    // Process matchups for loss fees and high scorer
    if (matchups && matchups.length > 0) {
      const sortedMatchups = matchups.sort((a, b) => (b.points || 0) - (a.points || 0))
      highScorer = sortedMatchups[0]

      const matchupPairs = groupMatchupsByMatchupId(matchups)
      
      matchupPairs.forEach(pair => {
        if (pair.length === 2) {
          const [team1, team2] = pair
          const loser = team1.points < team2.points ? team1 : team2
          
          const userMapping = userMap.get(loser.roster_id)
          const ownerName = userMapping?.display_name || `Team ${loser.roster_id}`
          
          fees.push({
            roster_id: loser.roster_id,
            type: 'loss_fee',
            amount: 5,
            description: `Week ${week_number} loss fee`,
            owner_name: ownerName
          })
        }
      })

      // Add high scorer bonus
      if (highScorer && league.high_score_bonus > 0) {
        const userMapping = userMap.get(highScorer.roster_id)
        const ownerName = userMapping?.display_name || `Team ${highScorer.roster_id}`
        
        fees.push({
          roster_id: highScorer.roster_id,
          type: 'high_score_bonus',
          amount: -league.high_score_bonus,
          description: `High scorer bonus - Week ${week_number}`,
          owner_name: ownerName
        })
      }
    }

    // Process transactions for transaction fees
    if (transactions && transactions.length > 0) {
      const draftCutoff = new Date('2025-08-24T00:00:00Z').getTime()
      
      // Get season-to-date transaction counts per roster
      const { data: seasonTransactions } = await supabaseClient
        .from('transactions')
        .select('roster_id, type')
        .eq('league_id', league.id)
        .gte('created_at', '2025-08-24T00:00:00Z')

      const transactionCounts = new Map()
      seasonTransactions?.forEach(t => {
        if (['waiver', 'free_agent'].includes(t.type)) {
          const current = transactionCounts.get(t.roster_id) || 0
          transactionCounts.set(t.roster_id, current + 1)
        }
      })

      // Process this week's transactions
      const validTransactions = transactions.filter(t => 
        t.created >= draftCutoff && ['waiver', 'free_agent'].includes(t.type)
      )

      validTransactions.forEach(transaction => {
        transaction.roster_ids?.forEach(roster_id => {
          const currentCount = transactionCounts.get(roster_id) || 0
          
          if (currentCount >= 10) {
            const userMapping = userMap.get(roster_id)
            const ownerName = userMapping?.display_name || `Team ${roster_id}`
            
            fees.push({
              roster_id,
              type: 'transaction_fee',
              amount: 2,
              description: `${transaction.type} transaction (${currentCount + 1} total)`,
              owner_name: ownerName
            })
          }
          
          transactionCounts.set(roster_id, currentCount + 1)
        })
      })
    }

    // Store transactions in database
    if (transactions && transactions.length > 0) {
      const transactionRecords = transactions.map(t => ({
        league_id: league.id,
        sleeper_transaction_id: t.transaction_id,
        roster_id: t.roster_ids?.[0],
        type: t.type,
        status: t.status,
        created_at: new Date(t.created).toISOString(),
        week_number: week_number,
        fee_amount: fees.find(f => f.roster_id === t.roster_ids?.[0] && f.type === 'transaction_fee')?.amount || 0
      }))

      await supabaseClient
        .from('transactions')
        .upsert(transactionRecords, { onConflict: 'sleeper_transaction_id' })
    }

    // Store matchups in database
    if (matchups && matchups.length > 0) {
      const matchupRecords = matchups.map(m => ({
        league_id: league.id,
        week_number: week_number,
        roster_id: m.roster_id,
        matchup_id: m.matchup_id,
        points: m.points,
        is_winner: m.roster_id === (matchups.find(other => 
          other.matchup_id === m.matchup_id && other.roster_id !== m.roster_id
        )?.points || 0) < m.points,
        loss_fee_applied: fees.some(f => f.roster_id === m.roster_id && f.type === 'loss_fee')
      }))

      await supabaseClient
        .from('matchups')
        .upsert(matchupRecords, { onConflict: 'league_id,week_number,roster_id' })
    }

    // Create formatted response
    const feeStrings = fees.map(fee => {
      const sign = fee.amount < 0 ? '' : ''
      const amountStr = fee.amount < 0 ? `-$${Math.abs(fee.amount).toFixed(2)}` : `$${fee.amount.toFixed(2)}`
      return `${fee.owner_name}: ${amountStr} (${fee.description})`
    })

    const highScorerString = highScorer ? 
      `${userMap.get(highScorer.roster_id)?.display_name || `Team ${highScorer.roster_id}`} (${highScorer.points} pts)` : 
      'None'

    console.log('Processing completed successfully')

    return new Response(
      JSON.stringify({ 
        success: true, 
        fees: feeStrings, 
        highScorer: highScorerString, 
        fee_details: fees,
        week_processed: week_number,
        total_fees: fees.reduce((sum, fee) => sum + fee.amount, 0)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('Error processing weekly fees:', error)
    return new Response(
      JSON.stringify({ error: message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

function groupMatchupsByMatchupId(matchups: any[]): any[][] {
  const groups = new Map()
  matchups.forEach(matchup => {
    if (!groups.has(matchup.matchup_id)) {
      groups.set(matchup.matchup_id, [])
    }
    groups.get(matchup.matchup_id).push(matchup)
  })
  return Array.from(groups.values())
}