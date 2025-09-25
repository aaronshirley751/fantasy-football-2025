// Quick production test
const testSingle = async () => {
  console.log('🧪 SINGLE WEEK TEST');
  
  const response = await fetch(
    'https://jfeuobfjgqownybluvje.supabase.co/functions/v1/weekly-processor',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmZXVvYmZqZ3Fvd255Ymx1dmplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjM4NjE1NjUsImV4cCI6MjAzOTQzNzU2NX0.WVXR-F9oQV3Wmc4twgH0pPL96MQJZQW8QUdtc5-mZOg'
      },
      body: JSON.stringify({
        league_id: 'a7d65b53-2ec5-4b38-94ee-7fcb97160989',
        week: 1
      })
    }
  );

  console.log('Status:', response.status);
  console.log('OK:', response.ok);
  
  const text = await response.text();
  console.log('Raw response:', text);
  
  try {
    const data = JSON.parse(text);
    console.log('Parsed:', JSON.stringify(data, null, 2));
  } catch (e) {
    console.log('Parse error:', e.message);
  }
};

testSingle().catch(console.error);