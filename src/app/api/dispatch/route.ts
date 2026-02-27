import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const records = await prisma.dispatchRecord.findMany({
      orderBy: { date: 'desc' },
    });
    return NextResponse.json(records);
  } catch (error) {
    return NextResponse.json(
      { error: 'Database error while fetching dispatch records' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { date, amount, remark } = body;

    if (!date || amount === undefined) {
      return NextResponse.json(
        { error: 'Date and amount are required' },
        { status: 400 }
      );
    }

    const record = await prisma.dispatchRecord.create({
      data: {
        date,
        amount: parseFloat(amount),
        remark: remark || null,
      },
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Database error while creating dispatch record' },
      { status: 500 }
    );
  }
}
