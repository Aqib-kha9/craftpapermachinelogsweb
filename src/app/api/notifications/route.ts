import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Using raw query because Prisma Client generation is blocked by dev server
    const notifications = await prisma.$queryRaw`
      SELECT * FROM "Notification" 
      ORDER BY "createdAt" DESC 
      LIMIT 15
    `;
    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Fetch Notifications Error:', error);
    return NextResponse.json({ error: 'FAILED_TO_FETCH_ALERTS' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const id = crypto.randomUUID();
    const type = body.type || 'INFO';
    const title = body.title;
    const message = body.message;
    const createdAt = new Date().toISOString();

    await prisma.$executeRaw`
      INSERT INTO "Notification" ("id", "type", "title", "message", "isRead", "createdAt")
      VALUES (${id}, ${type}, ${title}, ${message}, false, ${createdAt}::timestamp)
    `;
    
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Create Notification Error:', error);
    return NextResponse.json({ error: 'FAILED_TO_CREATE_ALERT' }, { status: 500 });
  }
}

export async function PATCH() {
  try {
    await prisma.$executeRaw`
      UPDATE "Notification" SET "isRead" = true WHERE "isRead" = false
    `;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update Notifications Error:', error);
    return NextResponse.json({ error: 'FAILED_TO_SYNC_READ_STATUS' }, { status: 500 });
  }
}
