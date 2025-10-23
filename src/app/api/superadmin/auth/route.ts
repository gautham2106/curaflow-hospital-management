import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service';

// Superadmin login with fallback authentication
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

    // Try database function first
    try {
      const { data: authResult, error: authError } = await supabaseService.supabase
        .rpc('authenticate_superadmin', { 
          p_username: username, 
          p_password: password 
        });

      if (!authError && authResult && authResult.length > 0 && authResult[0].is_authenticated) {
        const superadmin = authResult[0];
        
        // Generate session token
        const sessionToken = `superadmin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Store session in database
        await supabaseService.supabase
          .from('superadmin_sessions')
          .insert({
            superadmin_id: superadmin.superadmin_id,
            token: sessionToken,
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            ip_address: request.headers.get('x-forwarded-for') || 'unknown',
            user_agent: request.headers.get('user-agent') || 'unknown'
          });

        return NextResponse.json({
          success: true,
          superadmin: { 
            id: superadmin.superadmin_id,
            name: superadmin.full_name, 
            username: superadmin.username,
            email: superadmin.email,
            role: 'superadmin' 
          },
          token: sessionToken,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        });
      }
    } catch (dbError) {
      console.log('Database function not available, trying fallback authentication...');
    }

    // Fallback: Simple hardcoded authentication for demo
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

// Validate superadmin session with fallback
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

    // Try database validation first
    try {
      const { data: validationResult, error: validationError } = await supabaseService.supabase
        .rpc('validate_superadmin_session', { p_token: token });

      if (!validationError && validationResult && validationResult.length > 0 && validationResult[0].is_valid) {
        const superadmin = validationResult[0];
        
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
      }
    } catch (dbError) {
      console.log('Database validation not available, trying fallback...');
    }

    // Fallback: Simple token validation
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