// Access control middleware for superadmin routes
import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service';

export async function validateSuperadminAccess(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        isValid: false,
        error: 'Authorization token required',
        status: 401
      };
    }

    const token = authHeader.substring(7);

    // Validate superadmin session using database function
    const { data: validationResult, error: validationError } = await supabaseService.supabase
      .rpc('validate_superadmin_session', { p_token: token });

    if (validationError) {
      console.error('Session validation error:', validationError);
      return {
        isValid: false,
        error: 'Session validation error',
        status: 500
      };
    }

    // Check validation result
    if (!validationResult || validationResult.length === 0 || !validationResult[0].is_valid) {
      return {
        isValid: false,
        error: 'Invalid or expired superadmin session',
        status: 401
      };
    }

    const superadmin = validationResult[0];

    return {
      isValid: true,
      superadmin: {
        id: superadmin.superadmin_id,
        username: superadmin.username,
        name: superadmin.full_name,
        email: superadmin.email
      }
    };

  } catch (error) {
    console.error('Access validation error:', error);
    return {
      isValid: false,
      error: 'Internal server error',
      status: 500
    };
  }
}

export function createErrorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}
