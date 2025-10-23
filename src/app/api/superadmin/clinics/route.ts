import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service';

// Get superadmin ID from token
function getSuperadminId(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.substring(7);
  
  // For now, we'll extract superadmin ID from the token
  // In production, you'd validate the token and get the ID from the session
  // This is a simplified version for demo purposes
  return 'superadmin-id'; // This would be the actual superadmin ID from token validation
}

// Create new clinic
export async function POST(request: NextRequest) {
  try {
    const superadminId = getSuperadminId(request);
    if (!superadminId) {
      return NextResponse.json(
        { error: 'Superadmin authentication required' },
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
      subscription_plan = 'basic',
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

    // Create clinic using superadmin function
    const { data: result, error } = await supabaseService.supabase
      .rpc('create_clinic_as_superadmin', {
        p_superadmin_id: superadminId,
        p_name: name,
        p_address: address || null,
        p_phone: phone || null,
        p_email: email || null,
        p_admin_username: admin_username,
        p_admin_pin: admin_pin,
        p_admin_name: admin_name,
        p_subscription_plan: subscription_plan,
        p_max_doctors: max_doctors,
        p_max_patients_per_day: max_patients_per_day,
        p_notes: notes || null
      });

    if (error) {
      console.error('Error creating clinic:', error);
      return NextResponse.json(
        { error: 'Failed to create clinic' },
        { status: 500 }
      );
    }

    if (!result || result.length === 0 || !result[0].success) {
      return NextResponse.json(
        { error: result?.[0]?.message || 'Failed to create clinic' },
        { status: 500 }
      );
    }

    const newClinic = result[0];

    return NextResponse.json({
      success: true,
      clinic: {
        id: newClinic.clinic_id,
        name: newClinic.clinic_name,
        admin_username: newClinic.admin_username
      },
      message: newClinic.message
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating clinic:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get all clinics
export async function GET(request: NextRequest) {
  try {
    const superadminId = getSuperadminId(request);
    if (!superadminId) {
      return NextResponse.json(
        { error: 'Superadmin authentication required' },
        { status: 401 }
      );
    }

    // Get all clinics using superadmin function
    const { data: clinics, error } = await supabaseService.supabase
      .rpc('get_all_clinics_for_superadmin', { p_superadmin_id: superadminId });

    if (error) {
      console.error('Error fetching clinics:', error);
      return NextResponse.json(
        { error: 'Failed to fetch clinics' },
        { status: 500 }
      );
    }

    return NextResponse.json(clinics || []);

  } catch (error) {
    console.error('Error fetching clinics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
