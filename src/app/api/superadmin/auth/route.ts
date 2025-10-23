import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service';

// Superadmin login
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

    // Authenticate superadmin using database function
    const { data: authResult, error: authError } = await supabaseService.supabase
      .rpc('authenticate_superadmin', { 
        p_username: username, 
        p_password: password 
      });

    if (authError) {
      console.error('Superadmin authentication error:', authError);
      return NextResponse.json(
        { error: 'Authentication service error' },
        { status: 500 }
      );
    }

    // Check authentication result
    if (!authResult || authResult.length === 0 || !authResult[0].is_authenticated) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    const superadmin = authResult[0];

    // On success, return superadmin info and token
    return NextResponse.json({
      success: true,
      superadmin: { 
        id: superadmin.superadmin_id,
        name: superadmin.full_name, 
        username: superadmin.username,
        email: superadmin.email,
        role: 'superadmin' 
      },
      token: superadmin.token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    });

  } catch (error) {
    console.error('Superadmin login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Validate superadmin session
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

    // Validate session using database function
    const { data: validationResult, error: validationError } = await supabaseService.supabase
      .rpc('validate_superadmin_session', { p_token: token });

    if (validationError) {
      console.error('Session validation error:', validationError);
      return NextResponse.json(
        { error: 'Session validation error' },
        { status: 500 }
      );
    }

    // Check validation result
    if (!validationResult || validationResult.length === 0 || !validationResult[0].is_valid) {
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    const superadmin = validationResult[0];

    // Return superadmin info
    return NextResponse.json({
      success: true,
      superadmin: { 
        id: superadmin.superadmin_id,
        name: superadmin.full_name, 
        username: superadmin.username,
        email: superadmin.email,
        role: 'superadmin' 
      }
    });

  } catch (error) {
    console.error('Session validation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
