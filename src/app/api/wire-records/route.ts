import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const records = await prisma.wireRecord.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(records);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch records" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newRecord = await prisma.wireRecord.create({
      data: {
        machineName: body.machineName,
        wireType: body.wireType,
        partyName: body.partyName,
        productionAtInstallation: Number(body.productionAtInstallation),
        productionAtRemoval: body.productionAtRemoval ? Number(body.productionAtRemoval) : null,
        wireLifeMT: body.wireLifeMT ? Number(body.wireLifeMT) : null,
        expectedLifeMT: body.expectedLifeMT ? Number(body.expectedLifeMT) : null,
        changeDate: body.changeDate,
        remark: body.remark,
      },
    });

    await prisma.$executeRaw`
      INSERT INTO "Notification" ("id", "type", "title", "message", "isRead", "createdAt")
      VALUES (${crypto.randomUUID()}, 'SUCCESS', 'New Wire Logged', ${`${(newRecord as any).machineName} registry updated with ${(newRecord as any).wireType}.`}, false, ${new Date().toISOString()}::timestamp)
    `;

    return NextResponse.json(newRecord, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create record" }, { status: 500 });
  }
}
