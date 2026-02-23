import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    
    const where = category ? { category } : {};
    
    const records = await prisma.masterData.findMany({
      where,
      orderBy: [
        { category: 'asc' },
        { value: 'asc' }
      ]
    });
    
    return NextResponse.json(records);
  } catch (error) {
    console.error('Failed to fetch master data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch master data' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { category, value } = body;

    if (!category || !value) {
      return NextResponse.json(
        { error: 'Category and value are required' },
        { status: 400 }
      );
    }

    const record = await prisma.masterData.create({
      data: {
        category,
        value,
      },
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    console.error('Failed to create master data:', error);
    return NextResponse.json(
      { error: 'Failed to create master data' },
      { status: 500 }
    );
  }
}
