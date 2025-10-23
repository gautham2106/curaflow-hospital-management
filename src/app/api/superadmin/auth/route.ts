import { NextRequest, NextResponse } from 'next/server';

// Simple superadmin authentication without database dependency
export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Simple hardcoded authentication
    if (username === 'superadmin' && password === 'superadmin123') {
      // Generate session token
      const sessionToken = `superadmin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      return NextResponse.json({
        success: true,
        superadmin: { 
          id: 'superadmin-demo-id',
          name: 'Super Administrator', 
          username: 'superadmin',
          email: 'admin@curaflow.com',
          role: 'superadmin' 
        },
        token: sessionToken,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      });
    }

    // Invalid credentials
    return NextResponse.json(
      { error: 'Invalid username or password' },
      { status: 401 }
    );

  } catch (error) {
    console.error('Superadmin login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Simple session validation
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Simple token validation
    if (token.startsWith('superadmin-')) {
      return NextResponse.json({
        success: true,
        superadmin: { 
          id: 'superadmin-demo-id',
          name: 'Super Administrator', 
          username: 'superadmin',
          email: 'admin@curaflow.com',
          role: 'superadmin' 
        }
      });
    }

    return NextResponse.json(
      { error: 'Invalid or expired session' },
      { status: 401 }
    );

  } catch (error) {
    console.error('Session validation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}