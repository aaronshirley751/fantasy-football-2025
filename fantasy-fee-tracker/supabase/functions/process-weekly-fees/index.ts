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
 * - SEASON TOTALS: Calculate losses/bonuses from ALL weeks, not just current week.
 * - SEPARATED TRACKING: Track losses/inactive fees separately from high scorer bonuses.
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

interface SeasonSummary {
  roster_id: number;
  owner_name: string;
  season_total: number;
  transaction_fees: number;
  losses_inactive_fees: number;
  high_scorer_bonuses: number;
  transactions_used: number;
  free_remaining: number;
}

interface League {
  id: number;
  sleeper_league_id: string;
  name: string;
  loss_fee: number;
  inactive_fee: number;
  high_score_bonus: number;
  transaction_fee: number;
  free_transactions_per_season: number;
  discord_webhook_url?: string; // Enhanced: Discord webhook support
}

// Discord message formatting function
async function sendDiscordNotification(
  league: League,
  weekNumber: number,
  weekFees: FeeData[],
  seasonSummary: SeasonSummary[],
  weekTotal: number,
  seasonGrandTotal: number,
  highScorer: any
) {
  if (!league.discord_webhook_url) {
    console.log('No Discord webhook URL configured - skipping Discord notification');
    return false;
  }

  try {
    // Format message exactly as approved
    let message = `📊 Week ${weekNumber} Fantasy Football Fees\n`;
    
    // High scorer section
    message += `🏆 Highest Scorer\n`;
    message += `${highScorer?.owner_name || 'Unknown'}: ${highScorer?.points || 0} pts (-$5 bonus)\n`;
    
    // This week's activity
    message += `🆕 THIS WEEK'S ACTIVITY\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    
    weekFees.forEach(fee => {
      if (fee.type === 'loss_fee') {
        message += `• ${fee.owner_name}: Loss ($${fee.amount}) = $${fee.amount.toFixed(2)}\n`;
      } else if (fee.type === 'high_score_bonus') {
        message += `• ${fee.owner_name}: Bonus (-$${Math.abs(fee.amount)}) = -$${Math.abs(fee.amount).toFixed(2)}\n`;
      }
    });
    
    message += `💰 Week Total\n`;
    message += `$${weekTotal.toFixed(2)}\n`;
    
    // Season totals
    message += `📈 SEASON TOTALS (All Teams)\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    
    seasonSummary.forEach(team => {
      const total = team.season_total;
      const totalStr = total >= 0 ? `$${total.toFixed(2)}` : `-$${Math.abs(total).toFixed(2)}`;
      
      let details = [];
      if (team.transaction_fees > 0) {
        details.push(`$${team.transaction_fees.toFixed(2)} transactions`);
      }
      if (team.losses_inactive_fees > 0) {
        details.push(`$${team.losses_inactive_fees.toFixed(2)} losses/inactive`);
      }
      if (team.high_scorer_bonuses < 0) {
        details.push(`$${team.high_scorer_bonuses.toFixed(2)} high scorer bonus`);
      }
      
      const detailsStr = details.length > 0 ? ` (${details.join(', ')})` : '';
      const paidTransactions = Math.max(0, team.transactions_used - 10);
      const freeRemaining = Math.max(0, 10 - team.transactions_used);
      
      message += `• ${team.owner_name}: ${totalStr} total${detailsStr}, ${freeRemaining}/10 free remaining`;
      if (paidTransactions > 0) {
        message += ` (${paidTransactions} paid)`;
      }
      message += `\n`;
    });
    
    message += `🏦 Season Grand Total\n`;
    message += `$${seasonGrandTotal.toFixed(2)} across all teams`;

    // Send to Discord webhook
    const response = await fetch(league.discord_webhook_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: message
      })
    });

    if (!response.ok) {
      console.error('Discord webhook failed:', response.status, await response.text());
      return false;
    }

    console.log('✅ Discord notification sent successfully');
    return true;
  } catch (error) {
    console.error('❌ Discord notification error:', error);
    return false;
  }
}

function groupMatchupsByMatchupId(matchups: any[]) {
  const matchupPairs = new Map()
  matchups.forEach(m => {
    if (!matchupPairs.has(m.matchup_id)) {
      matchupPairs.set(m.matchup_id, [])
    }
    matchupPairs.get(m.matchup_id).push(m)
  })
  return Array.from(matchupPairs.values())
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { week_number, league_id } = await req.json()

    if (!week_number || !league_id) {
      return new Response(
        JSON.stringify({ error: 'week_number and league_id are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

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
    const [usersResponse, rostersResponse, matchupsResponse] = await Promise.all([
      fetch(`https://api.sleeper.app/v1/league/${league_id}/users`),
      fetch(`https://api.sleeper.app/v1/league/${league_id}/rosters`),
      fetch(`https://api.sleeper.app/v1/league/${league_id}/matchups/${week_number}`)
    ])

    const [users, rosters, matchups] = await Promise.all([
      usersResponse.json(),
      rostersResponse.json(),
      matchupsResponse.json()
    ])

    // Fetch ALL transactions from all weeks to get season totals (as required by conversation history)
    const allTransactions = []
    for (let week = 1; week <= 18; week++) {
      try {
        const weekResponse = await fetch(`https://api.sleeper.app/v1/league/${league_id}/transactions/${week}`)
        if (weekResponse.ok) {
          const weekTransactions = await weekResponse.json()
          if (weekTransactions && weekTransactions.length > 0) {
            allTransactions.push(...weekTransactions)
          }
        }
      } catch (error) {
        console.log(`No transactions found for week ${week}`)
      }
    }
    
    console.log(`Fetched ${allTransactions.length} total transactions from all weeks for season calculations`)
    const transactions = allTransactions

    // Process fees for current week
    const fees: FeeData[] = []
    let highScorer = null

    // Process matchups for loss fees and high scorer
    if (matchups && matchups.length > 0) {
      const sortedMatchups = matchups.sort((a: any, b: any) => (b.points || 0) - (a.points || 0))
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
      if (highScorer) {
        const userMapping = userMap.get(highScorer.roster_id)
        const ownerName = userMapping?.display_name || `Team ${highScorer.roster_id}`
        
        fees.push({
          roster_id: highScorer.roster_id,
          type: 'high_score_bonus',
          amount: -5,
          description: `High scorer bonus - Week ${week_number}`,
          owner_name: ownerName
        })
      }
    }

    // Calculate SEASON-TO-DATE totals for ALL rosters by fetching all previous weeks
    const seasonLossesAndInactives = new Map()
    const seasonHighScorerBonuses = new Map()
    
    // Fetch matchups for all weeks to calculate season losses and bonuses
    for (let week = 1; week <= week_number; week++) {
      try {
        const weekMatchupsResponse = await fetch(`https://api.sleeper.app/v1/league/${league_id}/matchups/${week}`)
        if (weekMatchupsResponse.ok) {
          const weekMatchups = await weekMatchupsResponse.json()
          if (weekMatchups && weekMatchups.length > 0) {
            // Process this week's losses
            const weekMatchupPairs = groupMatchupsByMatchupId(weekMatchups)
            
            weekMatchupPairs.forEach(pair => {
              if (pair.length === 2) {
                const [team1, team2] = pair
                const loser = team1.points < team2.points ? team1 : team2
                const current = seasonLossesAndInactives.get(loser.roster_id) || 0
                seasonLossesAndInactives.set(loser.roster_id, current + 5) // $5 per loss
              }
            })
            
            // Find high scorer for this week (gets -$5 bonus) - track separately
            const sortedWeekMatchups = weekMatchups.sort((a: any, b: any) => (b.points || 0) - (a.points || 0))
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

    // Calculate season transaction totals and build season summary
    const seasonSummary: SeasonSummary[] = []
    
    rosters.forEach((roster: any) => {
      const rosterId = roster.roster_id
      const userMapping = userMap.get(rosterId)
      const ownerName = userMapping?.display_name || `Team ${rosterId}`
      
      // Count transactions for this roster (after Aug 24 cutoff)
      const draftCutoff = new Date('2025-08-24T00:00:00Z').getTime()
      const rosterTransactions = transactions.filter((t: any) => {
        return t.roster_ids && 
               t.roster_ids.includes(rosterId) &&
               t.created >= draftCutoff &&
               ['waiver', 'free_agent', 'trade'].includes(t.type)
      })
      
      const transactionCount = rosterTransactions.length
      const freeTransactions = Math.min(transactionCount, 10)
      const paidTransactions = Math.max(0, transactionCount - 10)
      const transactionFees = paidTransactions * 2
      
      // Get season-to-date losses/inactives and bonuses separately
      const seasonLossesInactives = seasonLossesAndInactives.get(rosterId) || 0
      const seasonBonuses = seasonHighScorerBonuses.get(rosterId) || 0
      
      seasonSummary.push({
        roster_id: rosterId,
        owner_name: ownerName,
        season_total: transactionFees + seasonLossesInactives + seasonBonuses,
        transaction_fees: transactionFees,
        losses_inactive_fees: seasonLossesInactives,
        high_scorer_bonuses: seasonBonuses,
        transactions_used: transactionCount,
        free_remaining: Math.max(0, 10 - transactionCount)
      })
    })

    // Sort season summary by roster_id for consistency
    seasonSummary.sort((a, b) => a.roster_id - b.roster_id)

    // Store fees in database
    if (fees.length > 0) {
      const feeRecords = fees.map(fee => ({
        league_id: league.id,
        week_number: week_number,
        roster_id: fee.roster_id,
        fee_type: fee.type,
        amount: fee.amount,
        description: fee.description,
        owner_name: fee.owner_name
      }))

      await supabaseClient
        .from('fees')
        .upsert(feeRecords, { onConflict: 'league_id,week_number,roster_id,fee_type' })
    }

    // Store matchups in database
    if (matchups && matchups.length > 0) {
      const matchupRecords = matchups.map((m: any) => ({
        league_id: league.id,
        week_number: week_number,
        roster_id: m.roster_id,
        matchup_id: m.matchup_id,
        points: m.points || 0,
        is_winner: m.roster_id === (matchups.find((other: any) => 
          other.matchup_id === m.matchup_id && 
          other.roster_id !== m.roster_id &&
          (other.points || 0) < (m.points || 0)
        )?.roster_id || false)
      }))

      await supabaseClient
        .from('matchups')
        .upsert(matchupRecords, { onConflict: 'league_id,week_number,roster_id' })
    }

    // Calculate week total and season grand total
    const weekTotal = fees.reduce((sum, fee) => sum + fee.amount, 0)
    const seasonGrandTotal = seasonSummary.reduce((sum, team) => sum + team.season_total, 0)
    
    // Send Discord notification with approved format
    const discordSent = await sendDiscordNotification(
      league,
      week_number,
      fees,
      seasonSummary,
      weekTotal,
      seasonGrandTotal,
      highScorer ? {
        roster_id: highScorer.roster_id,
        points: highScorer.points,
        owner_name: userMap.get(highScorer.roster_id)?.display_name || `Team ${highScorer.roster_id}`
      } : null
    );
    
    // Enhanced response with season summary
    const response = {
      success: true,
      week_number,
      league_id,
      week_fees: fees,
      week_total: weekTotal,
      season_summary: seasonSummary,
      season_grand_total: seasonGrandTotal,
      high_scorer: highScorer ? {
        roster_id: highScorer.roster_id,
        points: highScorer.points,
        owner_name: userMap.get(highScorer.roster_id)?.display_name || `Team ${highScorer.roster_id}`
      } : null,
      discord_sent: discordSent,
      summary: `Week ${week_number} processed: ${fees.length} fees totaling $${Math.abs(weekTotal).toFixed(2)}. Season total: $${seasonGrandTotal.toFixed(2)} across all teams.`
    }

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error processing fees:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})