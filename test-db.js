const { PrismaClient } = require('./generated/prisma');

const prisma = new PrismaClient();

async function testDb() {
  console.log("🔍 Testing database connection...");
  
  try {
    // Test services
    const services = await prisma.service.findMany();
    console.log(`✓ Found ${services.length} services:`);
    services.forEach(service => {
      console.log(`  - ${service.name}: $${(service.basePriceCents / 100).toFixed(2)} (${service.durationMin}min)`);
    });

    // Test add-ons
    const addOns = await prisma.addOn.findMany();
    console.log(`✓ Found ${addOns.length} add-ons:`);
    addOns.forEach(addOn => {
      console.log(`  - ${addOn.name}: $${(addOn.priceCents / 100).toFixed(2)} (+${addOn.durationMin}min)`);
    });

    console.log("🎉 Database test successful!");
  } catch (error) {
    console.error("❌ Database test failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

testDb();