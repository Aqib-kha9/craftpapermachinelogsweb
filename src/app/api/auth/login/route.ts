import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // Single-user administrative check
    if (username === 'admin' && password === 'admin123') {
      return NextResponse.json({
        success: true,
        user: { username: 'admin' },
        token: 'session_token_' + Math.random().toString(36).substring(7)
      });
    }

    return NextResponse.json(
      { success: false, message: 'INVALID_CREDENTIALS' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'AUTHENTICATION_ERROR' },
      { status: 500 }
    );
  }
}
