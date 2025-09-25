// Test ultra-minimal function
console.log("🧪 TESTING ULTRA-MINIMAL FUNCTION");

async function testMinimal() {
  try {
    console.log("📡 Calling ultra-minimal test function...");
    
    const response = await fetch('https://jfeuobfjgqownybluvje.supabase.co/functions/v1/process-weekly-fees', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmZXVvYmZqZ3Fvd255Ymx1dmplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1NTI1ODUsImV4cCI6MjA3MTEyODU4NX0.7qu0h_cKNpdW1ZENZ3652LE75MC6VQp9Ahu5SSDypuY',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        week_number: 16,
        league_id: 'd06f0672-2848-4b5d-86f5-9ab559605b4f'
      })
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log("✅ SUCCESS: Ultra-minimal function works!");
      console.log("📊 Response:", JSON.stringify(result, null, 2));
      console.log("🎯 This confirms the runtime environment is working");
      console.log("❌ The issue is with the complex function code, not the infrastructure");
    } else {
      console.log("❌ FAILED:", response.status, response.statusText);
      console.log("Error:", result);
    }
    
  } catch (error) {
    console.log("❌ ERROR:", error.message);
  }
}

testMinimal();
