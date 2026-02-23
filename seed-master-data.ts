import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const currentMachineSections = [
  'First Press',
  'Second Press',
  'First Group Dryer',
  'Second Group Dryer',
  'Dryer Section',
  'Bottom Wire',
  'Press Bottom Wire',
];

const currentEquipmentNames = [
  'Top Buyer',
  'Bottom Buyer',
  'First Press – Top',
  'First Press – Bottom',
  'First Press – Second Bottom',
  'Second Press – Top',
  'Second Press – Bottom',
  'First Group – Dryer',
  'First Group – Bottom',
  'Second Group – Dryer',
  'Dryer Section Parts',
];

const wireTypes = [
  'HEW-200 Primary',
  'SP-500 Bottom',
  'BW-900 Ultra',
];

const partyNames = [
  'Apex Vendors',
  'Global Wires Ltd',
];

async function main() {
  console.log('Seeding Master Data...');

  const data = [
    ...currentMachineSections.map(v => ({ category: 'MACHINE_SECTION', value: v })),
    ...currentEquipmentNames.map(v => ({ category: 'EQUIPMENT_NAME', value: v })),
    ...wireTypes.map(v => ({ category: 'WIRE_TYPE', value: v })),
    ...partyNames.map(v => ({ category: 'PARTY_NAME', value: v })),
  ];

  for (const item of data) {
    await prisma.masterData.create({
      data: item
    });
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
