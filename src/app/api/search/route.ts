import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.length < 2) {
    return NextResponse.json([]);
  }

  try {
    const [wireResults, equipmentResults] = await Promise.all([
      prisma.wireRecord.findMany({
        where: {
          OR: [
            { machineName: { contains: query, mode: 'insensitive' } },
            { partyName: { contains: query, mode: 'insensitive' } },
            { wireType: { contains: query, mode: 'insensitive' } },
            { remark: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 5,
      }),
      prisma.equipmentRecord.findMany({
        where: {
          OR: [
            { equipmentName: { contains: query, mode: 'insensitive' } },
            { groupName: { contains: query, mode: 'insensitive' } },
            { remark: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 5,
      }),
    ]);

    // Format results for the frontend with safe access
    const results = [
      ...wireResults.map((r: any) => ({
        id: r.id,
        type: 'wire',
        title: r.machineName || r.wireNumber || 'UNKNOWN_WIRE',
        subtitle: `${r.wireType || r.size || 'N/A'} • ${r.partyName || 'VENDOR_SYSTEM'}`,
        href: `/wire-records/${r.id}`,
      })),
      ...equipmentResults.map((r: any) => ({
        id: r.id,
        type: 'equipment',
        title: r.equipmentName || 'UNKNOWN_UNIT',
        subtitle: `${r.groupName || r.section || 'SYSTEM'} • IMPACT: ${r.productionImpact || 'N/A'}`,
        href: `/equipment-records/${r.id}`,
      })),
    ];

    return NextResponse.json(results);
  } catch (error) {
    console.error('Search Error:', error);
    return NextResponse.json(
      { success: false, message: 'SEARCH_ENGINE_FAILURE' },
      { status: 500 }
    );
  }
}
