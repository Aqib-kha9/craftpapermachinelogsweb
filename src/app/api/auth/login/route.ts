import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // Credentials are loaded from environment variables for security.
    // Set ADMIN_USERNAME and ADMIN_PASSWORD in your .env file.
    const validUsername = process.env.ADMIN_USERNAME;
    const validPassword = process.env.ADMIN_PASSWORD;

    if (!validUsername || !validPassword) {
      return NextResponse.json(
        { success: false, message: 'SERVER_CONFIGURATION_ERROR' },
        { status: 500 }
      );
    }

    if (username === validUsername && password === validPassword) {
      return NextResponse.json({
        success: true,
        user: { username: validUsername },
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
