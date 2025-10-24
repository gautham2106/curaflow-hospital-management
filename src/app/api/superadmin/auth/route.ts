import { NextRequest } from 'next/server';
import { supabaseService } from '@/lib/supabase/service';
import { ApiResponse } from '@/lib/api-response';

// Superadmin login with proper database integration
export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // Validate input
    if (!username || !password) {
      return ApiResponse.badRequest('Username and password are required');
    }

    // Authenticate superadmin using database function
    const { data: authResult, error: authError } = await supabaseService.supabase
      .rpc('authenticate_superadmin', {
        p_user: username,
        p_pass: password
      });

    if (authError) {
      console.error('Superadmin authentication error:', authError);
      return ApiResponse.internalServerError('Authentication service error');
    }

    // Check authentication result
    if (!authResult || authResult.length === 0 || !authResult[0].is_authenticated) {
      return ApiResponse.unauthorized('Invalid username or password');
    }

    const superadmin = authResult[0];

    // Generate session token
    const sessionToken = `superadmin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Store session in database
    const { error: sessionError } = await supabaseService.supabase
      .from('superadmin_sessions')
      .insert({
        superadmin_id: superadmin.superadmin_id,
        token: sessionToken,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown'
      });

    if (sessionError) {
      console.error('Session storage error:', sessionError);
      // Continue anyway with token
    }

    return ApiResponse.success({
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

  } catch (error) {
    console.error('Superadmin login error:', error);
    return ApiResponse.internalServerError('Internal server error');
  }
}

// Validate superadmin session
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return ApiResponse.unauthorized('Authorization token required');
    }

    const token = authHeader.substring(7);

    // Validate session using database function
    const { data: validationResult, error: validationError } = await supabaseService.supabase
      .rpc('validate_superadmin_session', { p_token: token });

    if (validationError) {
      console.error('Session validation error:', validationError);
      return ApiResponse.internalServerError('Session validation error');
    }

    // Check validation result
    if (!validationResult || validationResult.length === 0 || !validationResult[0].is_valid) {
      return ApiResponse.unauthorized('Invalid or expired session');
    }

    const superadmin = validationResult[0];

    return ApiResponse.success({
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
    return ApiResponse.internalServerError('Internal server error');
  }
}