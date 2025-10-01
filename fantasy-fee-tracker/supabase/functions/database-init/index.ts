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
    const { league_id: actualLeagueId, current_week } = await req.json();
    
  console.log(`🎯 INITIALIZING DATABASE for 2025 SEASON`);
  console.log(`📊 Sleeper League ID: ${actualLeagueId}`);
    console.log(`📅 Current Week: ${current_week || 'TBD'}`);

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch basic league data
    console.log('🌐 Fetching league data from Sleeper API...');
    
    const [leagueResponse, rosterResponse, userResponse] = await Promise.all([
      fetch(`https://api.sleeper.app/v1/league/${actualLeagueId}`),
      fetch(`https://api.sleeper.app/v1/league/${actualLeagueId}/rosters`),
      fetch(`https://api.sleeper.app/v1/league/${actualLeagueId}/users`)
    ]);

    const [leagueData, rosters, users] = await Promise.all([
      leagueResponse.json(),
      rosterResponse.json(), 
      userResponse.json()
    ]);

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

    const { data: leagueRecord, error: leagueLookupError } = await supabase
      .from('leagues')
      .select('*')
      .eq('sleeper_league_id', actualLeagueId)
      .single();

    if (leagueLookupError || !leagueRecord) {
      throw new Error(`League configuration not found for Sleeper league ${actualLeagueId}`);
    }

    const databaseLeagueId = leagueRecord.id;

    // ========== FETCH ALL HISTORICAL TRANSACTIONS (WEEKS 1 TO CURRENT) ==========
    const actualCurrentWeek = current_week || leagueData?.settings?.leg || 3;
    console.log(`🔄 Fetching ALL historical transactions (Weeks 1-${actualCurrentWeek})...`);
    
    const allTransactions = [];
    const transactionStats = new Map<number, TransactionStats>();

    // Initialize stats for all rosters
    for (const roster of rosters || []) {
      transactionStats.set(roster.roster_id, {
        roster_id: roster.roster_id,
        free_transactions_per_season: 10,
        free_remaining: 10,
        mulligan_used: false,
        total_transactions: 0,
        paid_transactions: 0
      });
    }

    // Fetch transactions for each week
    for (let week = 1; week <= actualCurrentWeek; week++) {
      console.log(`📥 Fetching Week ${week} transactions...`);
      
      try {
        const weekTransactionsUrl = `https://api.sleeper.app/v1/league/${actualLeagueId}/transactions/${week}`;
        const weekResponse = await fetch(weekTransactionsUrl);
        const weekTransactions = await weekResponse.json();
        
        if (weekTransactions && Array.isArray(weekTransactions)) {
          allTransactions.push(...weekTransactions);
          console.log(`✅ Week ${week}: ${weekTransactions.length} transactions`);
        }
      } catch (error) {
        console.log(`⚠️ Week ${week}: Error fetching transactions`, error);
      }
    }

    console.log(`📊 TOTAL HISTORICAL TRANSACTIONS: ${allTransactions.length}`);

    // Process all historical transactions
    if (allTransactions.length > 0) {
      // Filter for valid transactions
      const draftCutoff = new Date('2025-08-24T00:00:00Z').getTime();
      
      const validTransactions = allTransactions.filter((t: any) => {
        const isAfterCutoff = t.created >= draftCutoff;
        const isCountableType = ['waiver', 'free_agent'].includes(t.type);
        const isComplete = t.status === 'complete';
        return isAfterCutoff && isCountableType && isComplete && t.roster_ids && t.roster_ids.length > 0;
      });
      
      console.log(`✅ Valid Transactions After Filtering: ${validTransactions.length}`);
      
      // Count transactions by roster
      const transactionsByRoster = new Map();
      validTransactions.forEach((t: any) => {
        const rosterId = t.roster_ids[0];
        if (!transactionsByRoster.has(rosterId)) {
          transactionsByRoster.set(rosterId, []);
        }
        transactionsByRoster.get(rosterId).push(t);
      });

      // Calculate final stats for each roster
      for (const [rosterId, rosterTransactions] of transactionsByRoster.entries()) {
        const stats = transactionStats.get(rosterId);
  const ownerName = userMappings.find((um: any) => um.roster_id === rosterId)?.display_name || `Team ${rosterId}`;
        
        if (stats) {
          stats.total_transactions = rosterTransactions.length;
          
          if (rosterTransactions.length > 10) {
            stats.paid_transactions = rosterTransactions.length - 10;
            stats.free_remaining = 0;
          } else {
            stats.free_remaining = 10 - rosterTransactions.length;
            stats.paid_transactions = 0;
          }
          
          console.log(`📊 ${ownerName}: ${stats.total_transactions} total transactions, ${stats.free_remaining} free remaining, ${stats.paid_transactions} paid`);
        }
      }
    }

    // ========== INITIALIZE DATABASE ==========
  console.log(`💾 Initializing fee_summaries table with historical data...`);
    
    // Clear existing data for this league first
    console.log(`🗑️ Clearing existing data for league ${actualLeagueId}...`);
    await supabase
      .from('fee_summaries')
      .delete()
      .eq('league_id', databaseLeagueId);

    // Insert initial data for each roster
    for (const stats of transactionStats.values()) {
      try {
  const ownerName = userMappings.find((um: any) => um.roster_id === stats.roster_id)?.display_name || `Team ${stats.roster_id}`;
        const transactionFees = stats.paid_transactions * 2;
        
        await supabase.from('fee_summaries').insert({
          league_id: databaseLeagueId,
          roster_id: stats.roster_id,
          owner_name: ownerName,
          loss_fees: 0,
          transaction_fees: transactionFees,
          inactive_fees: 0,
          high_score_credits: 0,
          other_fees: 0,
          total_owed: transactionFees,
          total_paid: 0,
          balance: transactionFees,
          updated_week: actualCurrentWeek,
          free_transactions_remaining: stats.free_remaining,
          total_transactions: stats.total_transactions,
          paid_transactions: stats.paid_transactions,
          mulligan_used: false
        });
        
        console.log(`💾 Initialized ${ownerName}: ${stats.total_transactions} transactions, ${stats.free_remaining} free remaining, $${transactionFees} transaction fees`);
      } catch (error) {
        console.error(`❌ Error initializing roster ${stats.roster_id}:`, error);
      }
    }

    const executionTime = Date.now() - startTime;
    console.log(`✅ DATABASE INITIALIZATION COMPLETE in ${executionTime}ms`);

    const result = {
      success: true,
      message: '🎉 DATABASE INITIALIZED with historical transaction data!',
      league_id: actualLeagueId,
      current_week: actualCurrentWeek,
      total_historical_transactions: allTransactions.length,
      valid_transactions: allTransactions.filter(t => {
        const isAfterCutoff = t.created >= new Date('2025-08-24T00:00:00Z').getTime();
        const isCountableType = ['waiver', 'free_agent'].includes(t.type);
        const isComplete = t.status === 'complete';
        return isAfterCutoff && isCountableType && isComplete;
      }).length,
      execution_time_ms: executionTime,
      transaction_stats: Array.from(transactionStats.values()),
      initialization_complete: true
    };

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('❌ Database initialization error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Database initialization failed',
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