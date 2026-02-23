import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const records = await prisma.productionRecord.findMany({
      orderBy: { date: 'desc' },
    });
    return NextResponse.json(records);
  } catch (error) {
    console.error('Failed to fetch production records:', error);
    return NextResponse.json(
      { error: 'Failed to fetch production records' },
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

    const record = await prisma.productionRecord.create({
      data: {
        date,
        amount: parseFloat(amount),
        remark: remark || null,
      },
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    console.error('Failed to create production record:', error);
    return NextResponse.json(
      { error: 'Failed to create production record' },
      { status: 500 }
    );
  }
}
