import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const links = await prisma.sheetLink.findMany({
            orderBy: { createdAt: 'asc' },
        });
        return NextResponse.json(links);
    } catch (error) {
        console.error('Failed to fetch sheet links:', error);
        return NextResponse.json({ error: 'Failed to fetch sheet links' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { label, url } = body;

        if (!label || !url) {
            return NextResponse.json({ error: 'Label and URL are required' }, { status: 400 });
        }

        const newLink = await prisma.sheetLink.create({
            data: {
                label,
                url,
            },
        });

        return NextResponse.json(newLink, { status: 201 });
    } catch (error) {
        console.error('Failed to create sheet link:', error);
        return NextResponse.json({ error: 'Failed to create sheet link' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        await prisma.sheetLink.delete({
            where: { id },
        });

        return NextResponse.json({ message: 'Sheet link deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Failed to delete sheet link:', error);
        return NextResponse.json({ error: 'Failed to delete sheet link' }, { status: 500 });
    }
}
