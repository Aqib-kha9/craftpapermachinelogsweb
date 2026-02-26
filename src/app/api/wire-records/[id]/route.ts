import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const record = await prisma.wireRecord.findUnique({
      where: { id },
    });

    if (!record) {
      return NextResponse.json(
        { error: "Record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(record);
  } catch (error) {
    console.error("Error fetching wire record:", error);
    return NextResponse.json(
      { error: "Failed to fetch record" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const body = await request.json();

    const updatedRecord = await prisma.wireRecord.update({
      where: { id },
      data: {
        machineName: body.machineName,
        wireType: body.wireType,
        partyName: body.partyName,
        productionAtInstallation: Number(body.productionAtInstallation),
        productionAtRemoval: body.productionAtRemoval ? Number(body.productionAtRemoval) : null,
        wireLifeMT: body.wireLifeMT ? Number(body.wireLifeMT) : (body.productionAtRemoval ? Number(body.productionAtRemoval) - Number(body.productionAtInstallation) : null),
        expectedLifeMT: body.expectedLifeMT ? Number(body.expectedLifeMT) : null,
        wireCost: body.wireCost ? Number(body.wireCost) : null,
        changeDate: body.changeDate,
        remark: body.remark,
      },
    });

    return NextResponse.json(updatedRecord);
  } catch (error) {
    console.error("Error updating wire record:", error);
    return NextResponse.json(
      { error: "Failed to update record" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    await prisma.wireRecord.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting wire record:", error);
    return NextResponse.json(
      { error: "Failed to delete record" },
      { status: 500 }
    );
  }
}
