// Test the services API endpoint
async function testServicesAPI() {
  try {
    console.log("🔍 Testing /api/services endpoint...");
    
    const response = await fetch("http://localhost:3007/api/services");
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    console.log("✅ Services API Response:");
    console.log(`📋 Found ${data.services.length} services:`);
    data.services.forEach(service => {
      console.log(`  - ${service.name}: ${service.price.formatted} (${service.duration}min)`);
    });
    
    console.log(`🔧 Found ${data.addOns.length} add-ons:`);
    data.addOns.forEach(addOn => {
      console.log(`  - ${addOn.name}: ${addOn.price.formatted} (+${addOn.duration}min)`);
    });
    
    console.log("🎉 Services API test successful!");
    return data;
  } catch (error) {
    console.error("❌ Services API test failed:", error.message);
    throw error;
  }
}

// Run the test
testServicesAPI();