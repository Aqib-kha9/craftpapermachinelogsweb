import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { value, isActive } = body;

    const record = await prisma.masterData.update({
      where: { id },
      data: {
        value,
        isActive,
      },
    });

    return NextResponse.json(record);
  } catch (error) {
    console.error('Failed to update master data:', error);
    return NextResponse.json(
      { error: 'Failed to update master data' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.masterData.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Deleted successfully' });
  } catch (error) {
    console.error('Failed to delete master data:', error);
    return NextResponse.json(
      { error: 'Failed to delete master data' },
      { status: 500 }
    );
  }
}
