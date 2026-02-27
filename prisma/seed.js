const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Main seeding function to populate the database with initial master data 
 * and sample records for testing/demonstration.
 */
async function main() {
  console.log('--- Database Seeding: INITIALIZING ---');

  // 1. Data Cleanup
  // We clear existing records to ensure a clean state during development/testing.
  // CRITICAL: Be cautious with these in a shared production environment.
  await prisma.systemConfig.deleteMany();
  await prisma.masterData.deleteMany();
  await prisma.productionRecord.deleteMany();
  await prisma.dispatchRecord.deleteMany();
  await prisma.wireRecord.deleteMany();
  await prisma.equipmentRecord.deleteMany();

  console.log('--- Database Seeding: MASTER DATA ---');

  // 2. Master Data Definitions
  // These categories represent the core entities used throughout the application.
  const masterData = [
    { category: 'MACHINE_SECTION', value: 'WIRE SECTION', isActive: true },
    { category: 'MACHINE_SECTION', value: 'PRESS SECTION', isActive: true },
    { category: 'MACHINE_SECTION', value: 'DRYER SECTION', isActive: true },
    { category: 'WIRE_TYPE', value: 'BOTTOM WIRE', isActive: true },
    { category: 'WIRE_TYPE', value: 'TOP WIRE', isActive: true },
    { category: 'PARTY_NAME', value: 'RELIANCE FABRICS', isActive: true },
    { category: 'PARTY_NAME', value: 'INCO VENDORS', isActive: true },
    { category: 'EQUIPMENT_NAME', value: 'DRYER FABRIC', isActive: true },
    { category: 'EQUIPMENT_NAME', value: 'SUCTION COUCH', isActive: true },
    { category: 'EQUIPMENT_NAME', value: 'PRESS FELT', isActive: true },
  ];

  for (const item of masterData) {
    await prisma.masterData.create({ data: item });
  }

  // 3. System Configuration
  // Default settings for application behavior.
  await prisma.systemConfig.create({ 
    data: { key: 'machineStatus', value: 'RUNNING' } 
  });
  await prisma.systemConfig.create({ 
    data: { key: 'lowStockThreshold', value: '100' } 
  });

  console.log('--- Database Seeding: SAMPLE TELEMETRY ---');

  // 4. Sample Production & Dispatch Data
  // Generates data for the last 7 days to populate dashboard charts.
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const dateStr = new Date(today.getTime() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    await prisma.productionRecord.create({
      data: { 
        date: dateStr, 
        amount: parseFloat((Math.random() * 25 + 35).toFixed(2)) // 35 - 60 MT
      }
    });
    await prisma.dispatchRecord.create({
      data: { 
        date: dateStr, 
        amount: parseFloat((Math.random() * 20 + 30).toFixed(2)) // 30 - 50 MT
      }
    });
  }

  // 5. Initial Wire Lifecycle Record
  await prisma.wireRecord.create({
    data: {
      machineName: 'WIRE SECTION',
      wireType: 'BOTTOM WIRE',
      partyName: 'RELIANCE FABRICS',
      productionAtInstallation: 1000,
      productionAtRemoval: null,
      wireLifeMT: null,
      expectedLifeMT: 6000,
      wireCost: 55000,
      changeDate: new Date().toISOString().split('T')[0],
      remark: 'Initial production system wire'
    }
  });

  // 6. Initial Equipment Maintenance Record
  await prisma.equipmentRecord.create({
    data: {
      groupName: 'DRYER SECTION',
      equipmentName: 'DRYER FABRIC',
      downtimeMinutes: 30,
      totalProduction: 4500,
      changeDate: new Date().toISOString().split('T')[0],
      productionImpact: 'Minor',
      downtimeCategory: 'Maintenance',
      maintenanceCost: 800,
      sparePartUsed: 'None',
      technicianName: 'Plant Manager',
      remark: 'Routine system check'
    }
  });

  console.log('--- Database Seeding: COMPLETE ---');
}

main()
  .catch((e) => {
    console.error('Seeding Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
