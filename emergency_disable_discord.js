// URGENT: Check if Discord webhook is configured and disable it
const supabaseUrl = 'https://jfeuobfjgqownybluvje.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmZXVvYmZqZ3Fvd255Ymx1dmplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTU1MjU4NSwiZXhwIjoyMDcxMTI4NTg1fQ.TYZBL4UNLEJN6ovM6HQS5wxm2zkbZHBYtmQYALHDkqQ';
const DATABASE_LEAGUE_UUID = 'a7d65b53-2ec5-4b38-94ee-7fcb97160989';

async function emergencyDiscordCheck() {
    console.log('🚨 EMERGENCY: CHECKING DISCORD CONFIGURATION');
    console.log('=' .repeat(60));
    
    try {
        // Check if leagues table exists and has Discord webhook
        console.log('🔍 Checking leagues table for Discord webhook...');
        
        const leaguesResponse = await fetch(`${supabaseUrl}/rest/v1/leagues?select=*&id=eq.${DATABASE_LEAGUE_UUID}`, {
            headers: {
                'apikey': supabaseServiceKey,
                'Authorization': `Bearer ${supabaseServiceKey}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (leaguesResponse.ok) {
            const leagues = await leaguesResponse.json();
            console.log(`Found ${leagues.length} league records`);
            
            if (leagues.length > 0) {
                const league = leagues[0];
                console.log('\n🔍 LEAGUE CONFIGURATION:');
                console.log(`ID: ${league.id}`);
                console.log(`Discord Webhook URL: ${league.discord_webhook_url ? 'CONFIGURED' : 'NOT SET'}`);
                
                if (league.discord_webhook_url) {
                    console.log('\n🚨 CRITICAL: DISCORD WEBHOOK IS CONFIGURED!');
                    console.log('This means Discord message may have been sent during our test!');
                    
                    // Immediately disable it
                    console.log('\n🛑 DISABLING DISCORD WEBHOOK IMMEDIATELY...');
                    const disableResponse = await fetch(`${supabaseUrl}/rest/v1/leagues?id=eq.${DATABASE_LEAGUE_UUID}`, {
                        method: 'PATCH',
                        headers: {
                            'apikey': supabaseServiceKey,
                            'Authorization': `Bearer ${supabaseServiceKey}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            discord_webhook_url: null
                        })
                    });
                    
                    if (disableResponse.ok) {
                        console.log('✅ Discord webhook DISABLED');
                        console.log('No further unauthorized Discord messages can be sent');
                    } else {
                        console.log('❌ FAILED to disable Discord webhook');
                    }
                    
                } else {
                    console.log('✅ Discord webhook is NOT configured');
                    console.log('No Discord message was sent during our test');
                }
            }
            
        } else if (leaguesResponse.status === 404) {
            console.log('✅ No leagues table found - Discord not configured');
        } else {
            console.log(`⚠️  Leagues check returned status: ${leaguesResponse.status}`);
        }
        
        console.log('\n📋 NEXT STEPS:');
        console.log('1. Remove Discord functionality from function until approved');
        console.log('2. Verify the approved Discord message format');
        console.log('3. Only re-enable Discord after explicit user approval');
        
    } catch (error) {
        console.log('❌ Error checking Discord configuration:', error.message);
    }
}

emergencyDiscordCheck();