
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting Seeding ---');

  // 1. Clear existing data (optional, but good for a fresh start)
  await prisma.systemConfig.deleteMany();
  await prisma.masterData.deleteMany();
  await prisma.productionRecord.deleteMany();
  await prisma.dispatchRecord.deleteMany();
  await prisma.wireRecord.deleteMany();
  await prisma.equipmentRecord.deleteMany();

  // 2. Master Data
  const masterData = [
    { category: 'MACHINE_SECTION', value: 'WIRE SECTION', isActive: true },
    { category: 'MACHINE_SECTION', value: 'PRESS SECTION', isActive: true },
    { category: 'MACHINE_SECTION', value: 'DRYER SECTION', isActive: true },
    { category: 'WIRE_TYPE', value: 'BOTTOM WIRE', isActive: true },
    { category: 'WIRE_TYPE', value: 'TOP WIRE', isActive: true },
    { category: 'PARTY_NAME', value: 'INCO VENDOR X', isActive: true },
    { category: 'PARTY_NAME', value: 'VIBE SUPPLIERS', isActive: true },
    { category: 'EQUIPMENT_NAME', value: 'DRYER FABRIC', isActive: true },
    { category: 'EQUIPMENT_NAME', value: 'SUCTION COUCH', isActive: true },
    { category: 'EQUIPMENT_NAME', value: 'PRESS FELT', isActive: true },
  ];

  for (const item of masterData) {
    await prisma.masterData.create({ data: item });
  }

  // 3. System Config
  await prisma.systemConfig.create({ data: { key: 'machineStatus', value: 'RUNNING' } });
  await prisma.systemConfig.create({ data: { key: 'lowStockThreshold', value: '50' } });

  // 4. Sample Production & Dispatch (Past 7 days)
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const dateStr = new Date(today.getTime() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    await prisma.productionRecord.create({
      data: { date: dateStr, amount: Math.floor(Math.random() * 20) + 30 }
    });
    await prisma.dispatchRecord.create({
      data: { date: dateStr, amount: Math.floor(Math.random() * 15) + 25 }
    });
  }

  // 5. Sample Wire Record
  await prisma.wireRecord.create({
    data: {
      machineName: 'WIRE SECTION',
      wireType: 'BOTTOM WIRE',
      partyName: 'INCO VENDOR X',
      productionAtInstallation: 1250.0,
      productionAtRemoval: null,
      wireLifeMT: null,
      expectedLifeMT: 5000,
      wireCost: 45000,
      changeDate: new Date().toISOString().split('T')[0],
      remark: 'Fresh seeding entry'
    }
  });

  // 6. Sample Equipment Record
  await prisma.equipmentRecord.create({
    data: {
      groupName: 'DRYER SECTION',
      equipmentName: 'DRYER FABRIC',
      downtimeMinutes: 45,
      totalProduction: 5400,
      changeDate: new Date().toISOString().split('T')[0],
      productionImpact: 'Yes',
      downtimeCategory: 'Mechanical',
      maintenanceCost: 1200,
      sparePartUsed: 'Drive Belt',
      technicianName: 'Aqib Tech',
      remark: 'Scheduled checkup'
    }
  });

  console.log('--- Seeding Complete ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
