import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const importType = body.importType || 'PRODUCTION_DISPATCH';
    const records = body.records || [];

    if (!Array.isArray(records)) {
      return NextResponse.json({ error: 'Invalid data format. Expected an array of records.' }, { status: 400 });
    }

    let results;
    switch (importType) {
        case 'PRODUCTION_DISPATCH': {
          const prodData = [];
          const dispData = [];
          
          for (const record of records) {
            const { date, production, dispatch, remark } = record;
            if (!date) continue;

            if (production !== undefined && production !== null && production !== '') {
              prodData.push({
                date,
                amount: parseFloat(production),
                remark: remark || null,
              });
            }

            if (dispatch !== undefined && dispatch !== null && dispatch !== '') {
              dispData.push({
                date,
                amount: parseFloat(dispatch),
                remark: remark || null,
              });
            }
          }
          
          // Execute batch inserts
          if (prodData.length > 0) {
             await prisma.productionRecord.createMany({ data: prodData });
          }
          if (dispData.length > 0) {
             await prisma.dispatchRecord.createMany({ data: dispData });
          }
          
          results = { message: 'Production & Dispatch data imported', prodCount: prodData.length, dispCount: dispData.length };
          break;
        }
        case 'WIRE_RECORDS': {
          const wireData = [];
          for (const record of records) {
            const { machineName, wireType, partyName, installProd, removalProd, expectedLife, changeDate, remark } = record;
            if (!machineName || !wireType || !partyName || !installProd || !changeDate) continue;

            let wireLifeMT = null;
            const pInst = parseInt(installProd, 10);
            const pRem = removalProd ? parseInt(removalProd, 10) : null;
            if (pInst && pRem && !isNaN(pInst) && !isNaN(pRem)) {
                 wireLifeMT = pRem - pInst;
            }

            wireData.push({
              machineName,
              wireType,
              partyName,
              productionAtInstallation: parseInt(installProd, 10),
              productionAtRemoval: pRem,
              wireLifeMT: wireLifeMT,
              expectedLifeMT: expectedLife ? parseInt(expectedLife, 10) : null,
              changeDate,
              remark: remark || null,
            });
          }
          
          if (wireData.length > 0) {
             await prisma.wireRecord.createMany({ data: wireData });
          }
          
          results = { message: 'Wire Records imported', importCount: wireData.length };
          break;
        }
        case 'EQUIPMENT_RECORDS': {
          const equipData = [];
          for (const record of records) {
             const { groupName, equipmentName, downtimeMinutes, totalProduction, changeDate, productionImpact, remark } = record;
             if (!groupName || !equipmentName || !downtimeMinutes || !totalProduction || !changeDate || !productionImpact) continue;

             equipData.push({
                 groupName,
                 equipmentName,
                 downtimeMinutes: parseInt(downtimeMinutes, 10),
                 totalProduction: parseInt(totalProduction, 10),
                 changeDate,
                 productionImpact,
                 remark: remark || null,
             });
          }
          
          if (equipData.length > 0) {
             await prisma.equipmentRecord.createMany({ data: equipData });
          }
          
          results = { message: 'Equipment Records imported', importCount: equipData.length };
          break;
        }
        default:
          throw new Error('Invalid importType specified.');
    }

    return NextResponse.json({ success: true, ...results }, { status: 201 });

  } catch (error: any) {
    console.error('Failed to import records:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to import records' },
      { status: 500 }
    );
  }
}
