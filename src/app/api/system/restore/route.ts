import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PrismaClient } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const backup = await request.json();

    // Basic Validation
    if (!backup.data || !backup.data.wireRecords || !backup.data.equipmentRecords) {
      return NextResponse.json(
        { success: false, message: 'VAULT_FORMAT_INVALID' },
        { status: 400 }
      );
    }

    // Atomic Transaction: Wipe and Load
    await prisma.$transaction([
      prisma.wireRecord.deleteMany(),
      prisma.equipmentRecord.deleteMany(),
      prisma.wireRecord.createMany({
        data: backup.data.wireRecords.map((r: any) => {
          const { id, createdAt, updatedAt, ...rest } = r;
          return rest; // Let Prisma generate new IDs and timestamps if needed, or keep original?
          // Usually better to keep original IDs for consistency across modules
        })
      }),
      // Re-evaluating: mapped creation often fails if IDs are manually provided vs auto-gen
      // Let's use the full spread but handle IDs carefully
    ]);

    // Refined Transaction to keep IDs
    await prisma.$transaction(async (tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>) => {
      await tx.wireRecord.deleteMany();
      await tx.equipmentRecord.deleteMany();

      if (backup.data.wireRecords.length > 0) {
        await tx.wireRecord.createMany({ data: backup.data.wireRecords });
      }
      if (backup.data.equipmentRecords.length > 0) {
        await tx.equipmentRecord.createMany({
        data: backup.data.equipmentRecords,
      });
      }

      const notifId = crypto.randomUUID();
      const notifTitle = 'System Vault Restored';
      const notifMsg = `Registry rebuilt from backup. ${backup.data.wireRecords.length + backup.data.equipmentRecords.length} records ingested.`;
      const notifTime = new Date().toISOString();

      await tx.$executeRaw`
        INSERT INTO "Notification" ("id", "type", "title", "message", "isRead", "createdAt")
        VALUES (${notifId}, 'ALERT', ${notifTitle}, ${notifMsg}, false, ${notifTime}::timestamp)
      `;
    });

    return NextResponse.json({ success: true, message: 'VAULT_RESTORE_COMPLETE' });
  } catch (error) {
    console.error('Restore Error:', error);
    return NextResponse.json(
      { success: false, message: 'VAULT_RESTORE_FAILURE' },
      { status: 500 }
    );
  }
}
