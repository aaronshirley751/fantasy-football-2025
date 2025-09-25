// Simple Node.js script to process Week 1 backfill
// This will help us get around authentication issues

const processWeek1 = async () => {
  try {
    // Try with different endpoints to find one that works
    console.log('Processing Week 1 backfill...')
    
    // Option 1: Try the process-weekly-fees endpoint
    console.log('Attempting direct Edge Function call...')
    
    const response = await fetch('https://jfeuobfjgqownybluvje.supabase.co/functions/v1/process-weekly-fees', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpldW9iZmpncW93bnlibHV2amUiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTcyNTAyNjQ0MSwiZXhwIjoyMDQwNjAyNDQxfQ.7J7I6WLdEg73fBQQQNa7PV9ZOXdPu2L6e3fBHRZrDgQ'
      },
      body: JSON.stringify({
        week_number: 1,
        league_id: 'a7d65b53-2ec5-4b38-94ee-7fcb97160989',
        disable_discord: true,
        audit_mode: true,
        retro_free_fix: true
      })
    })
    
    if (!response.ok) {
      console.log('Response status:', response.status)
      console.log('Response text:', await response.text())
      return
    }
    
    const result = await response.json()
    console.log('Week 1 processing result:')
    console.log(JSON.stringify(result, null, 2))
    
    // Process Week 2 if Week 1 succeeds
    console.log('\nProcessing Week 2 backfill...')
    
    const week2Response = await fetch('https://jfeuobfjgqownybluvje.supabase.co/functions/v1/process-weekly-fees', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpldW9iZmpncW93bnlibHV2amUiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTcyNTAyNjQ0MSwiZXhwIjoyMDQwNjAyNDQxfQ.7J7I6WLdEg73fBQQQNa7PV9ZOXdPu2L6e3fBHRZrDgQ'
      },
      body: JSON.stringify({
        week_number: 2,
        league_id: 'a7d65b53-2ec5-4b38-94ee-7fcb97160989',
        disable_discord: true,
        audit_mode: true,
        retro_free_fix: true
      })
    })
    
    if (week2Response.ok) {
      const week2Result = await week2Response.json()
      console.log('\nWeek 2 processing result:')
      console.log(JSON.stringify(week2Result, null, 2))
    } else {
      console.log('Week 2 failed:', week2Response.status, await week2Response.text())
    }
    
  } catch (error) {
    console.error('Error processing weeks:', error)
  }
}

processWeek1()
