// Enable Discord webhook for testing the approved format
const supabaseUrl = 'https://jfeuobfjgqownybluvje.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmZXVvYmZqZ3Fvd255Ymx1dmplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTU1MjU4NSwiZXhwIjoyMDcxMTI4NTg1fQ.TYZBL4UNLEJN6ovM6HQS5wxm2zkbZHBYtmQYALHDkqQ';
const DATABASE_LEAGUE_UUID = 'a7d65b53-2ec5-4b38-94ee-7fcb97160989';

async function enableDiscordForTesting() {
    console.log('🔧 ENABLING DISCORD WEBHOOK FOR APPROVED FORMAT TEST');
    console.log('Using test webhook URL for validation');
    
    // Use a test webhook URL - replace with actual when ready
    const testWebhookUrl = 'https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN';
    
    const response = await fetch(`${supabaseUrl}/rest/v1/leagues?id=eq.${DATABASE_LEAGUE_UUID}`, {
        method: 'PATCH',
        headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            discord_webhook_url: testWebhookUrl
        })
    });
    
    if (response.ok) {
        console.log('✅ Discord webhook configured for testing');
    } else {
        console.log('❌ Failed to configure Discord webhook');
    }
}

// For now, just test without actually enabling Discord
console.log('⚠️  Discord webhook NOT enabled - testing function output only');
console.log('The function will show what the Discord message would look like');