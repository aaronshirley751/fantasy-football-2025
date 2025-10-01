#!/usr/bin/env node

(async () => {
  const fetch = (await import('node-fetch')).default;

  const SUPABASE_URL = 'https://jfeuobfjgqownybluvje.supabase.co';
  const ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmZXVvYmZqZ3Fvd255Ymx1dmplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1NTI1ODUsImV4cCI6MjA3MTEyODU4NX0.7qu0h_cKNpdW1ZENZ3652LE75MC6VQp9Ahu5SSDypuY';
  const DATABASE_LEAGUE_ID = process.env.DATABASE_LEAGUE_ID || process.argv[2] || 'a7d65b53-2ec5-4b38-94ee-7fcb97160989';

  const headers = {
    'apikey': ANON_KEY,
    'Authorization': `Bearer ${ANON_KEY}`,
    'Content-Type': 'application/json'
  };

  const toCurrency = (value) => Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;

  try {
    console.log('🧮 BACKFILLING FEE SUMMARIES');
    console.log(`📊 Database League ID: ${DATABASE_LEAGUE_ID}`);

  const leagueRes = await fetch(`${SUPABASE_URL}/rest/v1/leagues?id=eq.${DATABASE_LEAGUE_ID}&select=*`, { headers });
    if (!leagueRes.ok) {
      throw new Error(`Failed to load league configuration: ${leagueRes.status} ${await leagueRes.text()}`);
    }
    const [league] = await leagueRes.json();
    if (!league) {
      throw new Error('League configuration not found');
    }

    const sleeperLeagueId = league.sleeper_league_id;
  const freeAllowance = Number((league.free_transactions_per_season !== undefined ? league.free_transactions_per_season : 10));
    console.log(`🌐 Sleeper League ID: ${sleeperLeagueId}`);

  const users = await loadUsers(fetch, SUPABASE_URL, headers, DATABASE_LEAGUE_ID, sleeperLeagueId);

    const [matchupsRes, transactionsRes, inactiveRes, existingSummariesRes] = await Promise.all([
      fetch(`${SUPABASE_URL}/rest/v1/matchups?league_id=eq.${DATABASE_LEAGUE_ID}&select=roster_id,loss_fee_applied,is_high_scorer`, { headers }),
      fetch(`${SUPABASE_URL}/rest/v1/transactions?league_id=eq.${DATABASE_LEAGUE_ID}&select=roster_id,fee_amount,type`, { headers }),
      fetch(`${SUPABASE_URL}/rest/v1/inactive_penalties?league_id=eq.${DATABASE_LEAGUE_ID}&select=roster_id,fee_amount`, { headers }),
      fetch(`${SUPABASE_URL}/rest/v1/fee_summaries?league_id=eq.${DATABASE_LEAGUE_ID}&select=*`, { headers })
    ]);

    const tableMissing = existingSummariesRes.status === 404;

    if (!matchupsRes.ok || !transactionsRes.ok || !inactiveRes.ok || (!existingSummariesRes.ok && !tableMissing)) {
      console.error('⚠️  Dataset statuses:', {
        matchups: matchupsRes.status,
        transactions: transactionsRes.status,
        inactive: inactiveRes.status,
        summaries: existingSummariesRes.status
      });
      if (!matchupsRes.ok) {
        console.error('   matchups ->', await matchupsRes.text());
      }
      if (!transactionsRes.ok) {
        console.error('   transactions ->', await transactionsRes.text());
      }
      if (!inactiveRes.ok) {
        console.error('   inactive_penalties ->', await inactiveRes.text());
      }
      if (!existingSummariesRes.ok) {
        console.error('   fee_summaries ->', await existingSummariesRes.text());
      }
      throw new Error('Failed to load one or more datasets needed for aggregation');
    }

    const matchups = await matchupsRes.json();
    const transactions = await transactionsRes.json();
    const inactivePenalties = await inactiveRes.json();
    const existingSummaries = tableMissing ? [] : await existingSummariesRes.json();

    const ownerMap = new Map();
    users.forEach((user) => {
      ownerMap.set(Number(user.roster_id), user.display_name);
    });

    const summaryMap = new Map();
    const ensureAccumulator = (rosterId) => {
      const id = Number(rosterId);
      if (!summaryMap.has(id)) {
        summaryMap.set(id, {
          roster_id: id,
          owner_name: ownerMap.get(id) || `Team ${id}`,
          loss_fees: 0,
          transaction_fees: 0,
          inactive_fees: 0,
          high_score_credits: 0,
          other_fees: 0,
          total_transactions: 0,
          paid_transactions: 0,
          mulligan_used: false
        });
      }
      return summaryMap.get(id);
    };

    matchups.forEach((matchup) => {
      const acc = ensureAccumulator(matchup.roster_id);
      if (matchup.loss_fee_applied) {
        acc.loss_fees += Number(league.loss_fee || 0);
      }
      if (matchup.is_high_scorer) {
        acc.high_score_credits += Number(league.high_score_bonus || 0);
      }
    });

    transactions.forEach((tx) => {
      const acc = ensureAccumulator(tx.roster_id);
      const amount = Number(tx.fee_amount || 0);
      const type = tx.type || '';
      const isCountable = ['waiver', 'free_agent'].includes(type);
      if (isCountable) {
        acc.total_transactions += 1;
      }
      if (amount > 0) {
        if (isCountable) {
          acc.transaction_fees += amount;
          acc.paid_transactions += 1;
        } else {
          acc.other_fees += amount;
        }
      }
    });

    inactivePenalties.forEach((penalty) => {
      const acc = ensureAccumulator(penalty.roster_id);
      const amount = Number(penalty.fee_amount || 0);
      if (amount > 0) {
        acc.inactive_fees += amount;
      } else {
        acc.mulligan_used = true;
      }
    });

    existingSummaries.forEach((row) => {
      const acc = ensureAccumulator(row.roster_id);
      if (!acc.owner_name && row.owner_name) {
        acc.owner_name = row.owner_name;
      }
    });

    const results = Array.from(summaryMap.values()).map((acc) => {
      const existing = existingSummaries.find((row) => Number(row.roster_id) === acc.roster_id) || {};
      const totalPaid = toCurrency(existing.total_paid || 0);
      const lossFees = toCurrency(acc.loss_fees);
      const transactionFees = toCurrency(acc.transaction_fees);
      const inactiveFees = toCurrency(acc.inactive_fees);
      const otherFees = toCurrency(acc.other_fees);
      const highScoreCredits = toCurrency(acc.high_score_credits);
      const totalOwed = toCurrency(lossFees + transactionFees + inactiveFees + otherFees - highScoreCredits);
      const balance = toCurrency(totalOwed - totalPaid);
      const freeRemaining = Math.max(0, freeAllowance - acc.total_transactions);

      return {
        league_id: DATABASE_LEAGUE_ID,
        roster_id: acc.roster_id,
        owner_name: acc.owner_name,
        loss_fees: lossFees,
        transaction_fees: transactionFees,
        inactive_fees: inactiveFees,
        high_score_credits: highScoreCredits,
        other_fees: otherFees,
        total_owed: totalOwed,
        total_paid: totalPaid,
        balance,
        free_transactions_remaining: freeRemaining,
        total_transactions: acc.total_transactions,
        paid_transactions: acc.paid_transactions,
        mulligan_used: acc.mulligan_used,
        updated_week: existing.updated_week || null,
        last_updated: new Date().toISOString()
      };
    });

    if (results.length === 0) {
      console.log('⚠️  No rosters found to backfill.');
      return;
    }

    if (tableMissing) {
      console.error('⚠️  fee_summaries table not found. Run the Supabase migration before backfilling.');
      process.exit(1);
    }

    const upsertRes = await fetch(`${SUPABASE_URL}/rest/v1/fee_summaries`, {
      method: 'POST',
      headers: {
        ...headers,
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify(results)
    });

    if (!upsertRes.ok) {
      throw new Error(`Failed to upsert fee summaries: ${upsertRes.status} ${await upsertRes.text()}`);
    }

    console.log('✅ Fee summaries updated successfully!\n');
    results.forEach((row) => {
      console.log(`${row.owner_name}: $${row.total_owed.toFixed(2)} (Tx: $${row.transaction_fees.toFixed(2)}, Loss: $${row.loss_fees.toFixed(2)}, Inactive: $${row.inactive_fees.toFixed(2)}, Credits: -$${row.high_score_credits.toFixed(2)})`);
    });

  } catch (error) {
    console.error('❌ Backfill error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
})();

async function loadUsers(fetchImpl, baseUrl, headers, databaseLeagueId, sleeperLeagueId) {
  const byDatabase = await fetchImpl(`${baseUrl}/rest/v1/users?league_id=eq.${databaseLeagueId}&select=roster_id,display_name`, { headers });
  if (byDatabase.ok) {
    const result = await byDatabase.json();
    if (Array.isArray(result) && result.length > 0) {
      return result;
    }
  }

  const bySleeper = await fetchImpl(`${baseUrl}/rest/v1/users?league_id=eq.${sleeperLeagueId}&select=roster_id,display_name`, { headers });
  if (bySleeper.ok) {
    const result = await bySleeper.json();
    if (Array.isArray(result) && result.length > 0) {
      return result;
    }
  }

  console.warn('⚠️  User roster mapping not found via database or Sleeper league IDs. Defaulting to roster numbers.');
  return [];
}
