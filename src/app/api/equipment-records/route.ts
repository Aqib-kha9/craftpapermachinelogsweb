import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const records = await prisma.equipmentRecord.findMany({
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
    const newRecord = await prisma.equipmentRecord.create({
      data: {
        groupName: body.groupName,
        equipmentName: body.equipmentName,
        downtimeMinutes: Number(body.downtimeMinutes),
        totalProduction: Number(body.totalProduction),
        changeDate: body.changeDate,
        productionImpact: body.productionImpact,
        remark: body.remark,
      },
    });

    await prisma.$executeRaw`
      INSERT INTO "Notification" ("id", "type", "title", "message", "isRead", "createdAt")
      VALUES (${crypto.randomUUID()}, 'SUCCESS', 'Equipment Maintenance Logged', ${`${(newRecord as any).equipmentName} (${(newRecord as any).groupName}) registry entry confirmed.`}, false, ${new Date().toISOString()}::timestamp)
    `;

    return NextResponse.json(newRecord, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create record" }, { status: 500 });
  }
}
