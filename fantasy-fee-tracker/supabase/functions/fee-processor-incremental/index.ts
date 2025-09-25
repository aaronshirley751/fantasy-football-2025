/// <reference path="./types.d.ts" />

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const startTime = Date.now();
    const { league_id: databaseLeagueId, week, test_mode } = await req.json();
    
    console.log(`🚀 INCREMENTAL FEE PROCESSOR STARTING - Week ${week || 'TBD'}`);
    console.log(`📊 Database League ID: ${databaseLeagueId}`);
    console.log(`🧪 Test Mode: ${test_mode || false}`);

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get league configuration from database
    console.log('🏆 Fetching league configuration from database...');
    const { data: leagueData, error: leagueError } = await supabase
      .from('leagues')
      .select('*')
      .eq('id', databaseLeagueId)
      .single();
    
    if (leagueError || !leagueData) {
      throw new Error(`League not found in database: ${databaseLeagueId}`);
    }
    
    const sleeperLeagueId = leagueData.sleeper_league_id;
    console.log(`🌐 Sleeper League ID: ${sleeperLeagueId}`);

    // Fetch basic league data from Sleeper
    const fetchStart = Date.now();
    console.log('🌐 Fetching league data from Sleeper API...');
    
    const [sleeperResponse, rosterResponse, userResponse] = await Promise.all([
      fetch(`https://api.sleeper.app/v1/league/${sleeperLeagueId}`),
      fetch(`https://api.sleeper.app/v1/league/${sleeperLeagueId}/rosters`),
      fetch(`https://api.sleeper.app/v1/league/${sleeperLeagueId}/users`)
    ]);

    const [sleeperLeague, rosters, users] = await Promise.all([
      sleeperResponse.json(),
      rosterResponse.json(), 
      userResponse.json()
    ]);

    // Determine current week
    const actualWeek = week || sleeperLeague?.settings?.leg || 1;
    console.log(`📅 Processing for Week ${actualWeek}`);

    // Create user mappings
    const userMappings = rosters?.map((roster: any) => {
      const user = users?.find((u: any) => u.user_id === roster.owner_id);
      return {
        roster_id: roster.roster_id,
        sleeper_user_id: roster.owner_id,
        display_name: user?.display_name || user?.username || `Team ${roster.roster_id}`
      };
    }) || [];

    console.log(`👥 Created ${userMappings.length} user mappings`);

    const fetchTime = Date.now() - fetchStart;

    // ========== INCREMENTAL TRANSACTION PROCESSING ==========
    console.log(`🔄 INCREMENTAL: Loading existing transaction data...`);
    
    // Get existing cumulative transaction data from database
    const { data: existingData } = await supabase
      .from('fee_summary')
      .select('roster_id, owner_name, total_transactions, paid_transactions, free_transactions_remaining, total_owed, total_paid')
      .eq('league_id', databaseLeagueId);

    // Initialize transaction stats from existing data or defaults
    const transactionStats = new Map<number, TransactionStats>();
    const fees: FeeData[] = [];

    for (const roster of rosters || []) {
      const existing = existingData?.find((e: any) => e.roster_id === roster.roster_id);
      const ownerName = userMappings.find((um: any) => um.roster_id === roster.roster_id)?.display_name || `Team ${roster.roster_id}`;
      
      transactionStats.set(roster.roster_id, {
        roster_id: roster.roster_id,
        free_transactions_per_season: 10,
        // Use existing data or defaults
        total_transactions: existing?.total_transactions || 0,
        paid_transactions: existing?.paid_transactions || 0,
        free_remaining: existing?.free_transactions_remaining !== undefined ? existing.free_transactions_remaining : 10,
        mulligan_used: false
      });
      
      if (existing) {
        console.log(`📋 ${ownerName}: Loaded ${existing.total_transactions} total transactions, ${existing.free_transactions_remaining} free remaining`);
      } else {
        console.log(`🆕 ${ownerName}: New roster, starting with 10 free transactions`);
      }
    }

    // Fetch ONLY current week's transactions for incremental processing
    console.log(`🌐 Fetching Week ${actualWeek} transactions from Sleeper API...`);
    const weekTransactionsUrl = `https://api.sleeper.app/v1/league/${sleeperLeagueId}/transactions/${actualWeek}`;
    const weekTransactionsResponse = await fetch(weekTransactionsUrl);
    const weekTransactions = await weekTransactionsResponse.json();
    
    console.log(`📊 Week ${actualWeek} API Response: ${weekTransactions?.length || 0} transactions`);

    if (weekTransactions && weekTransactions.length > 0) {
      // Filter for valid transactions (waiver/free_agent, complete status, post-draft)
      const draftCutoff = new Date('2025-08-24T00:00:00Z').getTime();
      
      const validWeekTransactions = weekTransactions.filter((t: any) => {
        const isAfterCutoff = t.created >= draftCutoff;
        const isCountableType = ['waiver', 'free_agent'].includes(t.type);
        const isComplete = t.status === 'complete';
        return isAfterCutoff && isCountableType && isComplete && t.roster_ids && t.roster_ids.length > 0;
      });
      
      console.log(`✅ Week ${actualWeek} Valid Transactions: ${validWeekTransactions.length} (after filtering)`);
      
      // Process new transactions for each roster
      validWeekTransactions.forEach((t: any) => {
        const rosterId = t.roster_ids[0];
        const stats = transactionStats.get(rosterId);
        const ownerName = userMappings.find((um: any) => um.roster_id === rosterId)?.display_name || `Team ${rosterId}`;
        
        if (stats) {
          // Increment total transactions
          stats.total_transactions += 1;
          
          // Calculate if this transaction costs money
          if (stats.free_remaining > 0) {
            // Still have free transactions
            stats.free_remaining -= 1;
            console.log(`🆓 ${ownerName}: FREE transaction #${stats.total_transactions} (${stats.free_remaining} free remaining)`);
          } else {
            // This is a paid transaction
            stats.paid_transactions += 1;
            
            // Add transaction fee
            fees.push({
              roster_id: rosterId,
              type: 'transaction_fee',
              amount: 2,
              description: `Transaction fee (${stats.paid_transactions} paid transactions)`,
              owner_name: ownerName
            });
            
            console.log(`💰 ${ownerName}: PAID transaction #${stats.total_transactions} (${stats.paid_transactions} total paid = $${stats.paid_transactions * 2})`);
          }
        }
      });
    } else {
      console.log(`📭 No new transactions found for Week ${actualWeek}`);
    }

    // TODO: Add weekly matchup fees and high scorer bonus processing here

    // Calculate totals
    const totalFees = fees.reduce((sum, fee) => sum + fee.amount, 0);
    const executionTime = Date.now() - startTime;
    
    console.log(`💰 Processed ${fees.length} transaction fees totaling $${totalFees}`);
    
    // ========== DATABASE STORAGE (INCREMENTAL UPDATES) ==========
    console.log(`💾 Updating database with incremental changes...`);
    
    for (const stats of transactionStats.values()) {
      try {
        const ownerName = userMappings.find((um: any) => um.roster_id === stats.roster_id)?.display_name || `Team ${stats.roster_id}`;
        const weeklyTransactionFees = fees.filter(f => f.roster_id === stats.roster_id && f.type === 'transaction_fee').reduce((sum, f) => sum + f.amount, 0);
        
        // Get existing total owed to add to
        const existing = existingData?.find((e: any) => e.roster_id === stats.roster_id);
        const existingTotalOwed = existing?.total_owed || 0;
        const existingTotalPaid = existing?.total_paid || 0;
        
        await supabase.from('fee_summary').upsert({
          league_id: databaseLeagueId,
          roster_id: stats.roster_id,
          owner_name: ownerName,
          total_owed: existingTotalOwed + weeklyTransactionFees, // Accumulate fees
          total_paid: existingTotalPaid, // Preserve existing payments
          updated_week: actualWeek,
          // Transaction tracking fields
          free_transactions_remaining: stats.free_remaining,
          total_transactions: stats.total_transactions,
          paid_transactions: stats.paid_transactions
        }, { onConflict: 'league_id,roster_id' });
        
        console.log(`💾 Updated ${ownerName}: ${stats.total_transactions} total transactions, ${stats.free_remaining} free remaining, +$${weeklyTransactionFees} this week`);
      } catch (error) {
        console.error(`❌ Error storing data for roster ${stats.roster_id}:`, error);
      }
    }

    // ========== DISCORD NOTIFICATION ==========
    let discordMessage = `🎉 INCREMENTAL WEEKLY PROCESSING - Week ${actualWeek}\n`;
    
    if (fees.length > 0) {
      discordMessage += `💰 New Transaction Fees This Week:\n`;
      fees.forEach(fee => {
        discordMessage += `${fee.owner_name}: $${fee.amount} (${fee.description})\n`;
      });
      discordMessage += `Week ${actualWeek} Transaction Fees: $${totalFees.toFixed(2)}\n\n`;
    } else {
      discordMessage += `🆓 No new transaction fees this week!\n\n`;
    }

    // Show current season transaction status
    discordMessage += `📊 Season Transaction Status:\n`;
    
    const sortedStats = Array.from(transactionStats.values())
      .filter(s => s.total_transactions > 0 || s.paid_transactions > 0)
      .sort((a, b) => b.total_transactions - a.total_transactions);

    for (const stats of sortedStats) {
      const ownerName = userMappings.find((um: any) => um.roster_id === stats.roster_id)?.display_name || `Team ${stats.roster_id}`;
      const statusIcon = stats.free_remaining === 0 ? '🔴' : stats.free_remaining <= 3 ? '🟡' : '🟢';
      
      discordMessage += `${ownerName}: ${statusIcon} ${stats.free_remaining} free remaining (${stats.total_transactions} total: ${Math.min(stats.total_transactions, 10)} free + ${stats.paid_transactions} paid)\n`;
    }

    console.log('✅ Incremental processing completed');

    const result = {
      success: true,
      message: '🎉 INCREMENTAL WEEKLY PROCESSING completed!',
      league_id: databaseLeagueId,
      week_number: actualWeek,
      fees,
      total_fees: totalFees,
      execution_time_ms: executionTime,
      processing_mode: 'incremental',
      new_transactions_processed: weekTransactions?.length || 0,
      discord_notification: discordMessage,
      transaction_stats: Array.from(transactionStats.values()),
      database_updated: true
    };

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('❌ Incremental processing error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Incremental processing failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});