// FULL WEEK RANGE INVESTIGATION
// Check ALL weeks to see if transactions are distributed differently

async function fullWeekRangeInvestigation() {
  const fetch = (await import('node-fetch')).default;
  
  console.log('🔍 FULL WEEK RANGE INVESTIGATION');
  console.log('🎯 Checking weeks 1-18 to find ALL Watts52 transactions');
  console.log('=' .repeat(80));
  console.log('');
  
  const SLEEPER_LEAGUE_ID = '1249067741470539776';
  const WATTS52_ROSTER_ID = 6;
  
  let totalFound = 0;
  const allTransactions = [];
  
  try {
    // Check every single week
    for (let week = 1; week <= 18; week++) {
      const transRes = await fetch(`https://api.sleeper.app/v1/league/${SLEEPER_LEAGUE_ID}/transactions/${week}`);
      
      if (transRes.ok) {
        const weekTransactions = await transRes.json();
        const watts52WeekTrans = weekTransactions.filter(t => 
          t.roster_ids && t.roster_ids.includes(WATTS52_ROSTER_ID)
        );
        
        if (watts52WeekTrans.length > 0) {
          console.log(`Week ${week}: ${watts52WeekTrans.length} transactions`);
          totalFound += watts52WeekTrans.length;
          allTransactions.push(...watts52WeekTrans);
        }
      }
    }
    
    console.log('');
    console.log(`🎯 TOTAL TRANSACTIONS FOUND: ${totalFound}`);
    console.log('');
    
    if (totalFound < 20) {
      console.log('🔍 STILL MISSING TRANSACTIONS - INVESTIGATING FURTHER');
      console.log('-' .repeat(50));
      
      // Try week 0 and negative weeks
      console.log('Testing week 0 and pre-season weeks:');
      for (let week = -2; week <= 0; week++) {
        try {
          const transRes = await fetch(`https://api.sleeper.app/v1/league/${SLEEPER_LEAGUE_ID}/transactions/${week}`);
          if (transRes.ok) {
            const weekTransactions = await transRes.json();
            const watts52WeekTrans = weekTransactions.filter(t => 
              t.roster_ids && t.roster_ids.includes(WATTS52_ROSTER_ID)
            );
            
            if (watts52WeekTrans.length > 0) {
              console.log(`Week ${week}: ${watts52WeekTrans.length} transactions`);
              totalFound += watts52WeekTrans.length;
              allTransactions.push(...watts52WeekTrans);
            }
          }
        } catch (e) {
          // Silent continue
        }
      }
      
      console.log('');
      console.log(`Updated total: ${totalFound}`);
      console.log('');
    }
    
    // Analyze the chronological order
    console.log('🔍 CHRONOLOGICAL ANALYSIS:');
    console.log('-' .repeat(50));
    
    allTransactions.sort((a, b) => a.created - b.created);
    
    allTransactions.forEach((t, index) => {
      const date = new Date(t.created).toLocaleDateString();
      const time = new Date(t.created).toLocaleTimeString();
      console.log(`${String(index + 1).padStart(2, ' ')}. ${date} ${time} - ${t.type} (Week: ${t.week || 'N/A'})`);
    });
    
    console.log('');
    console.log('🎯 COMPARISON WITH SLEEPER CHAT:');
    console.log('-' .repeat(50));
    console.log(`API shows: ${totalFound} transactions`);
    console.log('Sleeper chat shows: 20 transactions');
    console.log(`Still missing: ${20 - totalFound} transactions`);
    
    if (totalFound < 20) {
      console.log('');
      console.log('🚨 POSSIBLE EXPLANATIONS:');
      console.log('1. Some transactions are in different weeks than expected');
      console.log('2. API has a hard limit on transactions returned');
      console.log('3. Some transactions might be "trade" type, not "free_agent"');
      console.log('4. Transactions might be distributed across multiple roster_ids');
      console.log('5. API might be missing recent transactions');
      console.log('6. Discord notifications might count multi-player moves as separate transactions');
    }
    
  } catch (error) {
    console.error('❌ Error in full range investigation:', error);
  }
}

fullWeekRangeInvestigation();