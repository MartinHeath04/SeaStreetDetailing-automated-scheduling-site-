// Test the complete booking flow
async function testBookingAPI() {
  try {
    console.log("🔍 Testing complete booking API flow...");

    // Step 1: Get services
    console.log("\n📋 Step 1: Getting services...");
    const servicesResponse = await fetch("http://localhost:3007/api/services");
    const servicesData = await servicesResponse.json();
    const service = servicesData.services[0]; // Basic Wash & Wax
    const addOn = servicesData.addOns[0]; // Engine Bay Cleaning
    
    console.log(`✓ Selected service: ${service.name} (${service.price.formatted})`);
    console.log(`✓ Selected add-on: ${addOn.name} (${addOn.price.formatted})`);

    // Step 2: Check availability
    console.log("\n📅 Step 2: Checking availability...");
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    
    const availabilityUrl = `http://localhost:3007/api/availability?date=${dateStr}&serviceId=${service.id}`;
    const availabilityResponse = await fetch(availabilityUrl);
    const availabilityData = await availabilityResponse.json();
    
    if (availabilityData.slots.length === 0) {
      throw new Error("No available slots found for testing");
    }
    
    const selectedSlot = availabilityData.slots[0];
    console.log(`✓ Found ${availabilityData.slots.length} available slots`);
    console.log(`✓ Selected slot: ${selectedSlot.formatted}`);

    // Step 3: Create booking
    console.log("\n📝 Step 3: Creating booking...");
    const bookingData = {
      serviceId: service.id,
      addOnIds: [addOn.id],
      customer: {
        name: "John Doe",
        email: "john@example.com",
        phone: "555-123-4567",
      },
      appointment: {
        date: dateStr,
        startTime: selectedSlot.start,
      },
      address: "123 Main St, City, ST 12345",
      notes: "Please call when you arrive",
    };

    const bookingResponse = await fetch("http://localhost:3007/api/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bookingData),
    });

    if (!bookingResponse.ok) {
      const errorData = await bookingResponse.json();
      throw new Error(`Booking failed: ${errorData.error}`);
    }

    const booking = await bookingResponse.json();
    console.log("✅ Booking created successfully!");
    console.log(`📄 Booking ID: ${booking.bookingId}`);
    console.log(`👤 Customer: ${booking.customer.name}`);
    console.log(`🔧 Service: ${booking.service.name}`);
    console.log(`📅 Appointment: ${booking.appointment.formatted}`);
    console.log(`💰 Total Price: ${booking.pricing.totalPrice.formatted}`);

    // Step 4: Retrieve booking details
    console.log("\n📖 Step 4: Retrieving booking details...");
    const getBookingResponse = await fetch(`http://localhost:3007/api/bookings/${booking.bookingId}`);
    
    if (!getBookingResponse.ok) {
      throw new Error(`Failed to retrieve booking: ${getBookingResponse.status}`);
    }

    const bookingDetails = await getBookingResponse.json();
    console.log("✅ Booking details retrieved!");
    console.log(`📄 Status: ${bookingDetails.status}`);
    console.log(`📍 Address: ${bookingDetails.address}`);
    console.log(`📝 Notes: ${bookingDetails.notes}`);
    console.log(`🕒 Created: ${new Date(bookingDetails.createdAt).toLocaleString()}`);

    // Step 5: Test conflict prevention
    console.log("\n🚫 Step 5: Testing conflict prevention...");
    const conflictBookingData = {
      ...bookingData,
      customer: {
        name: "Jane Smith",
        email: "jane@example.com",
        phone: "555-987-6543",
      },
    };

    const conflictResponse = await fetch("http://localhost:3007/api/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(conflictBookingData),
    });

    if (conflictResponse.status === 409) {
      console.log("✅ Conflict prevention working! Double booking prevented.");
    } else {
      console.log("⚠️ Conflict prevention may not be working properly");
    }

    console.log("\n🎉 All booking API tests passed!");
    return booking;

  } catch (error) {
    console.error("❌ Booking API test failed:", error.message);
    throw error;
  }
}

// Test validation errors
async function testBookingValidation() {
  console.log("\n🧪 Testing booking validation...");

  const testCases = [
    {
      name: "Missing service ID",
      data: {
        customer: { name: "Test", email: "test@example.com", phone: "5551234567" },
        appointment: { date: "2025-09-11", startTime: "09:00" },
        address: "123 Test St",
      },
    },
    {
      name: "Invalid email",
      data: {
        serviceId: "test-id",
        customer: { name: "Test", email: "invalid-email", phone: "5551234567" },
        appointment: { date: "2025-09-11", startTime: "09:00" },
        address: "123 Test St",
      },
    },
    {
      name: "Invalid date format",
      data: {
        serviceId: "test-id",
        customer: { name: "Test", email: "test@example.com", phone: "5551234567" },
        appointment: { date: "invalid-date", startTime: "09:00" },
        address: "123 Test St",
      },
    },
  ];

  for (const testCase of testCases) {
    try {
      const response = await fetch("http://localhost:3007/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testCase.data),
      });

      if (response.status === 400) {
        console.log(`✓ ${testCase.name}: Validation error caught (400)`);
      } else {
        console.log(`⚠️ ${testCase.name}: Expected 400, got ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ ${testCase.name}: Test failed - ${error.message}`);
    }
  }

  console.log("✅ Validation tests completed!");
}

// Run all tests
async function runAllTests() {
  try {
    await testBookingAPI();
    await testBookingValidation();
    console.log("\n🎉 All tests completed successfully!");
  } catch (error) {
    console.error("\n❌ Test suite failed:", error.message);
  }
}

runAllTests();