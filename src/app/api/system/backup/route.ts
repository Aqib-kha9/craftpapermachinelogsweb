import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const [wireRecords, equipmentRecords] = await Promise.all([
      prisma.wireRecord.findMany(),
      prisma.equipmentRecord.findMany(),
    ]);

    const backup = {
      timestamp: new Date().toISOString(),
      version: "1.0",
      data: {
        wireRecords,
        equipmentRecords,
      },
    };

    await prisma.$executeRaw`
      INSERT INTO "Notification" ("id", "type", "title", "message", "isRead", "createdAt")
      VALUES (${crypto.randomUUID()}, 'INFO', 'System Vault Export', ${`Database snapshot of ${wireRecords.length + equipmentRecords.length} records generated.`}, false, ${new Date().toISOString()}::timestamp)
    `;

    return NextResponse.json(backup);
  } catch (error) {
    console.error('Backup Error:', error);
    return NextResponse.json(
      { success: false, message: 'VAULT_EXPORT_FAILURE' },
      { status: 500 }
    );
  }
}
