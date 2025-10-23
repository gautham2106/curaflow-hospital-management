import { NextRequest, NextResponse } from 'next/server';

// Simple superadmin clinics API without database dependency
export async function POST(request: NextRequest) {
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

    const {
      name,
      address,
      phone,
      email,
      admin_username,
      admin_pin,
      admin_name,
      max_doctors = 10,
      max_patients_per_day = 100,
      notes
    } = await request.json();

    // Validate required fields
    if (!name || !admin_username || !admin_pin || !admin_name) {
      return NextResponse.json(
        { error: 'Name, admin username, PIN, and admin name are required' },
        { status: 400 }
      );
    }

    // Validate PIN format (4 digits)
    if (!/^\d{4}$/.test(admin_pin)) {
      return NextResponse.json(
        { error: 'PIN must be exactly 4 digits' },
        { status: 400 }
      );
    }

    // Return success response (mock creation)
    const newClinic = {
      id: `clinic-${Date.now()}`,
      name: name,
      admin_username: admin_username
    };

    return NextResponse.json({
      success: true,
      clinic: newClinic,
      message: 'Clinic created successfully (demo mode)'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating clinic:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get all clinics (mock data)
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

    // Return mock clinic data
    const mockClinics = [
      {
        id: 'clinic-1',
        name: 'CuraFlow Central Hospital',
        address: '123 Medical Center Drive',
        phone: '555-0100',
        email: 'info@curaflow.com',
        admin_username: 'admin',
        admin_name: 'Admin User',
        max_doctors: 20,
        max_patients_per_day: 200,
        is_active: true,
        created_at: new Date().toISOString(),
        last_modified: new Date().toISOString(),
        modification_notes: 'Demo clinic',
        total_doctors: 5,
        total_patients: 25,
        total_visits_today: 8
      },
      {
        id: 'clinic-2',
        name: 'Sunrise Medical Clinic',
        address: '456 Health Avenue',
        phone: '555-0200',
        email: 'contact@sunrise.com',
        admin_username: 'sunrise-admin',
        admin_name: 'Sunrise Admin',
        max_doctors: 10,
        max_patients_per_day: 100,
        is_active: true,
        created_at: new Date().toISOString(),
        last_modified: new Date().toISOString(),
        modification_notes: 'Demo clinic',
        total_doctors: 3,
        total_patients: 20,
        total_visits_today: 4
      }
    ];

    return NextResponse.json(mockClinics);

  } catch (error) {
    console.error('Error fetching clinics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}