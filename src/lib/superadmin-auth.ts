// Simplified superadmin authentication middleware
import { NextRequest, NextResponse } from 'next/server';

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

    // Simple token validation
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