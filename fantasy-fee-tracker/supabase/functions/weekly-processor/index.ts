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
    
    console.log(`🚀 PRODUCTION INCREMENTAL PROCESSOR - Week ${week || 'TBD'}`);
    console.log(`📊 Database League ID: ${databaseLeagueId}`);
    console.log(`🧪 Test Mode: ${test_mode || false}`);

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get league configuration from database
    console.log('🏆 Fetching league configuration from database...');
    const { data: leagueConfig, error: leagueError } = await supabase
      .from('leagues')
      .select('*')
      .eq('id', databaseLeagueId)
      .single();
    
    if (leagueError || !leagueConfig) {
      throw new Error(`League not found in database: ${databaseLeagueId}`);
    }
    
    const sleeperLeagueId = leagueConfig.sleeper_league_id;
    console.log(`🌐 Sleeper League ID: ${sleeperLeagueId}`);

    // Fetch league data from Sleeper API
    const fetchStart = Date.now();
    console.log('🌐 Fetching data from Sleeper API...');
    
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

    const actualWeek = week || sleeperLeague?.settings?.leg || 1;
    console.log(`📅 Processing Week ${actualWeek}`);

    // Create user mappings
    const userMappings = rosters?.map((roster: any) => {
      const user = users?.find((u: any) => u.user_id === roster.owner_id);
      return {
        roster_id: roster.roster_id,
        sleeper_user_id: roster.owner_id,
        display_name: user?.display_name || user?.username || `Team ${roster.roster_id}`
      };
    }) || [];

    const fetchTime = Date.now() - fetchStart;
    console.log(`✅ Sleeper data fetched in ${fetchTime}ms`);

    // ========== INCREMENTAL TRANSACTION PROCESSING ==========
    console.log(`🔄 INCREMENTAL: Fetching Week ${actualWeek} transactions...`);
    
    // Get existing transactions from database to avoid duplicates
    const { data: existingTransactions } = await supabase
      .from('transactions')
      .select('sleeper_transaction_id')
      .eq('league_id', databaseLeagueId);
    
    const existingTransactionIds = new Set(existingTransactions?.map((t: any) => t.sleeper_transaction_id) || []);
    console.log(`📋 Found ${existingTransactionIds.size} existing transactions in database`);

    // Fetch Week transactions from Sleeper
    const weekTransactionsUrl = `https://api.sleeper.app/v1/league/${sleeperLeagueId}/transactions/${actualWeek}`;
    const weekTransactionsResponse = await fetch(weekTransactionsUrl);
    const weekTransactions = await weekTransactionsResponse.json();
    
    console.log(`📊 Week ${actualWeek} Sleeper API: ${weekTransactions?.length || 0} transactions`);

    const fees: FeeData[] = [];
    let newTransactionsProcessed = 0;

    if (weekTransactions && weekTransactions.length > 0) {
      // Filter for valid new transactions
      const draftCutoff = new Date('2025-08-24T00:00:00Z').getTime();
      
      const newTransactions = weekTransactions.filter((t: any) => {
        const isAfterCutoff = t.created >= draftCutoff;
        const isCountableType = ['waiver', 'free_agent'].includes(t.type);
        const isComplete = t.status === 'complete';
        const isNew = !existingTransactionIds.has(t.transaction_id);
        const hasRoster = t.roster_ids && t.roster_ids.length > 0;
        
        return isAfterCutoff && isCountableType && isComplete && isNew && hasRoster;
      });
      
      console.log(`✨ NEW transactions to process: ${newTransactions.length}`);
      
      // Get current paid transaction counts from database (manual counting)
      console.log('📊 Loading current season transaction stats...');
      const { data: allTransactions } = await supabase
        .from('transactions')
        .select('roster_id, fee_amount')
        .eq('league_id', databaseLeagueId);
      
      const paidTransactionCounts = new Map();
      allTransactions?.forEach((t: any) => {
        if (t.fee_amount > 0) {
          paidTransactionCounts.set(t.roster_id, (paidTransactionCounts.get(t.roster_id) || 0) + 1);
        }
      });

      // Process each new transaction
      for (const transaction of newTransactions) {
        const rosterId = transaction.roster_ids[0];
        const ownerName = userMappings.find((um: any) => um.roster_id === rosterId)?.display_name || `Team ${rosterId}`;
        
        // Get current paid transaction count for this roster  
        const currentPaidCount = paidTransactionCounts.get(rosterId) || 0;
        const freeRemaining = Math.max(0, 10 - currentPaidCount);
        
        // Determine if this transaction should have a fee
        const shouldApplyFee = freeRemaining <= 0;
        const feeAmount = shouldApplyFee ? (leagueConfig.transaction_fee || 2) : 0;
        
        // Store transaction in database
        await supabase.from('transactions').insert({
          league_id: databaseLeagueId,
          sleeper_transaction_id: transaction.transaction_id,
          roster_id: rosterId,
          type: transaction.type,
          week_number: actualWeek,
          fee_amount: feeAmount,
          processed: true
        });
        
        if (shouldApplyFee) {
          fees.push({
            roster_id: rosterId,
            type: 'transaction_fee',
            amount: feeAmount,
            description: `${transaction.type} transaction`,
            owner_name: ownerName
          });
          
          // Update paid count for subsequent transactions this week
          paidTransactionCounts.set(rosterId, (paidTransactionCounts.get(rosterId) || 0) + 1);
          
          console.log(`💰 ${ownerName}: PAID transaction ($${feeAmount}) - now ${paidTransactionCounts.get(rosterId)} total paid`);
        } else {
          console.log(`🆓 ${ownerName}: FREE transaction (${freeRemaining - 1} free remaining)`);
        }
        
        newTransactionsProcessed++;
      }
    }

    // Update fee summaries for any new fees
    for (const fee of fees) {
      if (fee.amount > 0) {
        const { data: existing } = await supabase
          .from('fee_summary')
          .select('*')
          .eq('league_id', databaseLeagueId)
          .eq('roster_id', fee.roster_id)
          .single();
        
        if (existing) {
          await supabase.from('fee_summary')
            .update({
              total_owed: existing.total_owed + fee.amount,
              balance: existing.balance + fee.amount,
              last_updated: new Date().toISOString()
            })
            .eq('id', existing.id);
        } else {
          await supabase.from('fee_summary').insert({
            league_id: databaseLeagueId,
            roster_id: fee.roster_id,
            total_owed: fee.amount,
            balance: fee.amount,
            last_updated: new Date().toISOString()
          });
        }
      }
    }

    const totalFees = fees.reduce((sum, fee) => sum + fee.amount, 0);
    const executionTime = Date.now() - startTime;
    
    console.log(`💰 Processed ${newTransactionsProcessed} new transactions, ${fees.length} fees totaling $${totalFees}`);

    // ========== DISCORD NOTIFICATION ==========
    let discordMessage = `🎉 WEEKLY PROCESSING - Week ${actualWeek}\n`;
    
    if (fees.length > 0) {
      discordMessage += `💰 New Transaction Fees This Week:\n`;
      fees.forEach(fee => {
        discordMessage += `${fee.owner_name}: $${fee.amount} (${fee.description})\n`;
      });
      discordMessage += `Week ${actualWeek} New Fees: $${totalFees.toFixed(2)}\n\n`;
    } else if (newTransactionsProcessed > 0) {
      discordMessage += `🆓 ${newTransactionsProcessed} new transactions processed - all within free limits!\n\n`;
    } else {
      discordMessage += `📭 No new transactions this week.\n\n`;
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
      new_transactions_processed: newTransactionsProcessed,
      discord_notification: discordMessage,
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