// Supabase configuration - Updated with working credentials
const supabaseUrl = 'https://jfeuobfjgqownybluvje.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmZXVvYmZqZ3Fvd255Ymx1dmplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1NTI1ODUsImV4cCI6MjA3MTEyODU4NX0.7qu0h_cKNpdW1ZENZ3652LE75MC6VQp9Ahu5SSDypuY';

const LEAGUE_ID = '1249067741470539776';
const DRAFT_CUTOFF = new Date('2025-08-24T00:00:00Z').getTime();

async function getAllApiTransactions() {
    console.log('🔍 Fetching all transactions from Sleeper API...');
    let allTransactions = [];
    let week = 1;
    
    while (week <= 17) { // NFL regular season weeks
        try {
            const response = await fetch(`https://api.sleeper.app/v1/league/${LEAGUE_ID}/transactions/${week}`);
            if (!response.ok) {
                console.log(`❌ Failed to fetch week ${week}: ${response.status}`);
                week++;
                continue;
            }
            
            const weekTransactions = await response.json();
            if (weekTransactions && weekTransactions.length > 0) {
                console.log(`📅 Week ${week}: ${weekTransactions.length} transactions`);
                allTransactions.push(...weekTransactions);
            }
            week++;
        } catch (error) {
            console.error(`❌ Error fetching week ${week}:`, error.message);
            week++;
        }
    }
    
    // Filter for valid transaction types after draft cutoff
    const validTransactions = allTransactions.filter(t => 
        t.created >= DRAFT_CUTOFF && 
        ['waiver', 'free_agent'].includes(t.type)
    );
    
    console.log(`✅ Total API transactions: ${allTransactions.length}`);
    console.log(`✅ Valid transactions (post-draft, waiver/free_agent): ${validTransactions.length}`);
    
    return validTransactions;
}

async function getAllDatabaseTransactions() {
    console.log('🔍 Fetching all transactions from database...');
    
    try {
        const response = await fetch(`${supabaseUrl}/rest/v1/transactions?select=*&order=created.asc`, {
            headers: {
                'apikey': supabaseServiceKey,
                'Authorization': `Bearer ${supabaseServiceKey}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            console.error(`❌ Error fetching database transactions: ${response.status} ${response.statusText}`);
            return [];
        }
        
        const transactions = await response.json();
        console.log(`✅ Database transactions: ${transactions.length}`);
        return transactions;
        
    } catch (error) {
        console.error('❌ Error fetching database transactions:', error);
        return [];
    }
}

async function getRosterMappings() {
    console.log('🔍 Fetching roster mappings...');
    
    const response = await fetch(`https://api.sleeper.app/v1/league/${LEAGUE_ID}/rosters`);
    const rosters = await response.json();
    
    const userResponse = await fetch(`https://api.sleeper.app/v1/league/${LEAGUE_ID}/users`);
    const users = await userResponse.json();
    
    const mapping = {};
    rosters.forEach(roster => {
        const user = users.find(u => u.user_id === roster.owner_id);
        mapping[roster.roster_id] = {
            owner_name: user ? user.display_name : `Team ${roster.roster_id}`,
            roster_id: roster.roster_id
        };
    });
    
    console.log(`✅ Roster mappings: ${Object.keys(mapping).length} rosters`);
    return mapping;
}

function groupTransactionsByRoster(transactions) {
    const byRoster = {};
    
    transactions.forEach(transaction => {
        // Handle both API format (adds/drops arrays) and database format (roster_id field)
        let rosterIds = [];
        
        if (transaction.roster_id) {
            // Database format
            rosterIds = [transaction.roster_id];
        } else if (transaction.adds || transaction.drops) {
            // API format - extract roster IDs from adds/drops
            const addRosters = transaction.adds ? Object.values(transaction.adds) : [];
            const dropRosters = transaction.drops ? Object.values(transaction.drops) : [];
            rosterIds = [...new Set([...addRosters, ...dropRosters])];
        }
        
        rosterIds.forEach(rosterId => {
            if (!byRoster[rosterId]) {
                byRoster[rosterId] = [];
            }
            byRoster[rosterId].push(transaction);
        });
    });
    
    return byRoster;
}

async function compareRosterTransactions(apiTransactions, dbTransactions, rosterMappings) {
    console.log('\n🔍 COMPREHENSIVE ROSTER AUDIT');
    console.log('=' .repeat(80));
    
    const apiByRoster = groupTransactionsByRoster(apiTransactions);
    const dbByRoster = groupTransactionsByRoster(dbTransactions);
    
    const allRosterIds = new Set([
        ...Object.keys(apiByRoster),
        ...Object.keys(dbByRoster)
    ]);
    
    const auditResults = {};
    let totalMissing = 0;
    let totalMissingFees = 0;
    
    for (const rosterId of allRosterIds) {
        const rosterIdNum = parseInt(rosterId);
        const owner = rosterMappings[rosterIdNum] || { owner_name: `Team ${rosterId}` };
        
        const apiTxns = apiByRoster[rosterId] || [];
        const dbTxns = dbByRoster[rosterId] || [];
        
        console.log(`\n👤 ${owner.owner_name} (Roster ${rosterId})`);
        console.log('-'.repeat(60));
        
        // Create lookup of database transactions by transaction_id
        const dbTxnIds = new Set(dbTxns.map(t => t.transaction_id || t.sleeper_transaction_id));
        
        // Find missing transactions
        const missingTransactions = apiTxns.filter(apiTxn => 
            !dbTxnIds.has(apiTxn.transaction_id)
        );
        
        console.log(`📊 API Transactions: ${apiTxns.length}`);
        console.log(`📊 Database Transactions: ${dbTxns.length}`);
        console.log(`❌ Missing Transactions: ${missingTransactions.length}`);
        
        if (missingTransactions.length > 0) {
            console.log('\n📋 Missing Transaction Details:');
            missingTransactions.forEach((txn, index) => {
                const date = new Date(txn.created).toLocaleDateString();
                const time = new Date(txn.created).toLocaleTimeString();
                console.log(`  ${index + 1}. ID: ${txn.transaction_id}`);
                console.log(`     Date: ${date} ${time}`);
                console.log(`     Type: ${txn.type}`);
                
                // Show adds/drops
                if (txn.adds) {
                    Object.entries(txn.adds).forEach(([playerId, rosterId]) => {
                        console.log(`     ADD: Player ${playerId} to Roster ${rosterId}`);
                    });
                }
                if (txn.drops) {
                    Object.entries(txn.drops).forEach(([playerId, rosterId]) => {
                        console.log(`     DROP: Player ${playerId} from Roster ${rosterId}`);
                    });
                }
                console.log('');
            });
            
            totalMissing += missingTransactions.length;
        }
        
        // Calculate fee impact
        const totalApiTxns = apiTxns.length;
        const totalDbTxns = dbTxns.length;
        const expectedFees = Math.max(0, totalApiTxns - 10) * 2;
        const actualFees = Math.max(0, totalDbTxns - 10) * 2;
        const missingFees = expectedFees - actualFees;
        
        console.log(`💰 Expected Fees: $${expectedFees} (${totalApiTxns} txns - 10 free = ${Math.max(0, totalApiTxns - 10)} × $2)`);
        console.log(`💰 Actual Fees: $${actualFees} (${totalDbTxns} txns - 10 free = ${Math.max(0, totalDbTxns - 10)} × $2)`);
        console.log(`🚨 Missing Fees: $${missingFees}`);
        
        if (missingFees > 0) {
            totalMissingFees += missingFees;
        }
        
        auditResults[rosterId] = {
            owner_name: owner.owner_name,
            api_count: totalApiTxns,
            db_count: totalDbTxns,
            missing_count: missingTransactions.length,
            missing_transactions: missingTransactions,
            expected_fees: expectedFees,
            actual_fees: actualFees,
            missing_fees: missingFees
        };
    }
    
    // Summary
    console.log('\n' + '='.repeat(80));
    console.log('📊 AUDIT SUMMARY');
    console.log('=' .repeat(80));
    console.log(`🚨 Total Missing Transactions: ${totalMissing}`);
    console.log(`💰 Total Missing Fees: $${totalMissingFees}`);
    
    if (totalMissing > 0) {
        console.log('\n🔧 Rosters Requiring Backfill:');
        Object.entries(auditResults).forEach(([rosterId, results]) => {
            if (results.missing_count > 0) {
                console.log(`  ${results.owner_name}: ${results.missing_count} transactions, $${results.missing_fees} fees`);
            }
        });
    }
    
    return auditResults;
}

async function main() {
    try {
        console.log('🚀 Starting Comprehensive All-Rosters Transaction Audit');
        console.log(`📅 Date: ${new Date().toLocaleString()}`);
        console.log(`🏈 League: ${LEAGUE_ID}`);
        console.log(`📆 Draft Cutoff: ${new Date(DRAFT_CUTOFF).toLocaleDateString()}`);
        console.log('=' .repeat(80));
        
        // Fetch all data
        const [apiTransactions, dbTransactions, rosterMappings] = await Promise.all([
            getAllApiTransactions(),
            getAllDatabaseTransactions(),
            getRosterMappings()
        ]);
        
        // Run comparison
        const auditResults = await compareRosterTransactions(
            apiTransactions, 
            dbTransactions, 
            rosterMappings
        );
        
        // Save results to file for backfill script
        const resultsSummary = {
            audit_date: new Date().toISOString(),
            league_id: LEAGUE_ID,
            draft_cutoff: DRAFT_CUTOFF,
            total_api_transactions: apiTransactions.length,
            total_db_transactions: dbTransactions.length,
            audit_results: auditResults
        };
        
        const fs = require('fs');
        fs.writeFileSync(
            'comprehensive_audit_results.json',
            JSON.stringify(resultsSummary, null, 2)
        );
        
        console.log('\n✅ Audit complete! Results saved to comprehensive_audit_results.json');
        console.log('🔧 Ready to create backfill script with these results.');
        
    } catch (error) {
        console.error('❌ Audit failed:', error);
    }
}

main();