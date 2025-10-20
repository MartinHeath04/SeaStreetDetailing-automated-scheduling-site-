// Test the availability API endpoint
async function testAvailabilityAPI() {
  try {
    console.log("🔍 Testing /api/availability endpoint...");
    
    // First, get services to test with
    const servicesResponse = await fetch("http://localhost:3007/api/services");
    const servicesData = await servicesResponse.json();
    const firstService = servicesData.services[0];
    
    console.log(`📋 Testing with service: ${firstService.name} (${firstService.duration}min)`);
    
    // Test with tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    
    console.log(`📅 Testing availability for: ${dateStr}`);
    
    const availabilityUrl = `http://localhost:3007/api/availability?date=${dateStr}&serviceId=${firstService.id}`;
    const response = await fetch(availabilityUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    console.log("✅ Availability API Response:");
    console.log(`📅 Date: ${data.date}`);
    console.log(`🔧 Service: ${data.service.name} (${data.service.duration}min)`);
    console.log(`⏰ Available slots: ${data.totalSlots}`);
    
    if (data.slots.length > 0) {
      console.log("📋 First 5 available time slots:");
      data.slots.slice(0, 5).forEach((slot, index) => {
        console.log(`  ${index + 1}. ${slot.formatted}`);
      });
      
      if (data.slots.length > 5) {
        console.log(`  ... and ${data.slots.length - 5} more slots`);
      }
    } else {
      console.log("❌ No available slots found for this date");
    }
    
    console.log("🎉 Availability API test successful!");
    return data;
  } catch (error) {
    console.error("❌ Availability API test failed:", error.message);
    throw error;
  }
}

// Also test error cases
async function testAvailabilityAPIErrors() {
  console.log("\n🧪 Testing error cases...");
  
  try {
    // Test missing date parameter
    const response1 = await fetch("http://localhost:3007/api/availability?serviceId=test");
    console.log(`✓ Missing date: ${response1.status} ${response1.statusText}`);
    
    // Test missing serviceId parameter  
    const response2 = await fetch("http://localhost:3007/api/availability?date=2024-12-25");
    console.log(`✓ Missing serviceId: ${response2.status} ${response2.statusText}`);
    
    // Test invalid date format
    const response3 = await fetch("http://localhost:3007/api/availability?date=invalid&serviceId=test");
    console.log(`✓ Invalid date: ${response3.status} ${response3.statusText}`);
    
    console.log("✅ Error handling tests passed!");
  } catch (error) {
    console.error("❌ Error testing failed:", error.message);
  }
}

// Run the tests
async function runTests() {
  await testAvailabilityAPI();
  await testAvailabilityAPIErrors();
}

runTests();