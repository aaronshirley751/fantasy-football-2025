// Test the new infrastructure test function
const SUPABASE_URL = "https://jfeuobfjgqownybluvje.supabase.co";

// You'll need to paste your anon key when prompted
console.log("🚀 Testing new test-infrastructure function...");

async function testInfrastructureFunction() {
  const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqZXVvYmZqZ3FvdzAn1ibHV2amUiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTcyNzE5NDc3OSwiZXhwIjoyMDQyNzcwNzc5fQ.xq9SoFzEXWLt8QGFNkJJGsG7ykUU3W0rKyb-tXCWFnA"; // Replace with your anon key

  try {
    console.log("⏰ Starting request...");
    const startTime = Date.now();
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/test-infrastructure`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ test: true })
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`⏰ Request completed in ${duration}ms`);
    
    if (response.ok) {
      const data = await response.json();
      console.log("✅ SUCCESS:");
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.log(`❌ ERROR: ${response.status} - ${response.statusText}`);
      const text = await response.text();
      console.log("Response body:", text);
    }
    
  } catch (error) {
    console.log("❌ FETCH ERROR:", error.message);
  }
}

testInfrastructureFunction();
