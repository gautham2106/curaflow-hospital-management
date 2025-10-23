import { NextRequest, NextResponse } from 'next/server';

// Simple superadmin clinic update API without database dependency
export async function PUT(request: NextRequest) {
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

    const { clinicId, ...updates } = await request.json();

    if (!clinicId) {
      return NextResponse.json(
        { error: 'Clinic ID is required' },
        { status: 400 }
      );
    }

    // Return success response (mock update)
    return NextResponse.json({
      success: true,
      message: 'Clinic updated successfully (demo mode)'
    });

  } catch (error) {
    console.error('Error updating clinic:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Deactivate clinic (mock)
export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get('clinicId');
    const reason = searchParams.get('reason') || 'Deactivated by superadmin';

    if (!clinicId) {
      return NextResponse.json(
        { error: 'Clinic ID is required' },
        { status: 400 }
      );
    }

    // Return success response (mock deactivation)
    return NextResponse.json({
      success: true,
      message: 'Clinic deactivated successfully (demo mode)'
    });

  } catch (error) {
    console.error('Error deactivating clinic:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}