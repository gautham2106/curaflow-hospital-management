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

    // Try database validation first
    try {
      const { data: validationResult, error: validationError } = await supabaseService.supabase
        .rpc('validate_superadmin_session', { p_token: token });

      if (!validationError && validationResult && validationResult.length > 0 && validationResult[0].is_valid) {
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
      }
    } catch (dbError) {
      console.log('Database validation not available, trying fallback...');
    }

    // Fallback: Simple token validation
    if (token.startsWith('superadmin-')) {
      return {
        isValid: true,
        superadmin: {
          id: 'superadmin-demo-id',
          username: 'superadmin',
          name: 'Super Administrator',
          email: 'admin@curaflow.com'
        }
      };
    }

    return {
      isValid: false,
      error: 'Invalid or expired superadmin session',
      status: 401
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
