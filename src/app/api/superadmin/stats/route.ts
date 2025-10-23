import { NextRequest, NextResponse } from 'next/server';

// Simple superadmin stats without database dependency
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
    if (!token.startsWith('superadmin-')) {
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    // Return mock statistics
    return NextResponse.json({
      total_clinics: 2,
      active_clinics: 2,
      inactive_clinics: 0,
      total_doctors: 8,
      total_patients: 45,
      total_visits_today: 12,
      clinics_created_today: 0,
      clinics_created_this_month: 1,
      usage_percentage: {
        clinics: 100,
        doctors: 100,
        patients: 100
      }
    });

  } catch (error) {
    console.error('Error fetching superadmin stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}