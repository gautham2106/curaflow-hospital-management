import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service';

// Create new clinic
export async function POST(request: NextRequest) {
  try {
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
      max_patients_per_day = 100
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

    // Check if username already exists
    const existingClinics = await supabaseService.getClinics();
    const usernameExists = existingClinics.some((clinic: any) => 
      clinic.admin_username === admin_username
    );

    if (usernameExists) {
      return NextResponse.json(
        { error: 'Admin username already exists' },
        { status: 409 }
      );
    }

    // Create clinic using database function
    const { data: result, error } = await supabaseService.supabase
      .rpc('create_clinic_with_admin', {
        p_name: name,
        p_address: address || null,
        p_phone: phone || null,
        p_email: email || null,
        p_admin_username: admin_username,
        p_admin_pin: admin_pin,
        p_admin_name: admin_name,
        p_subscription_plan: subscription_plan,
        p_max_doctors: max_doctors,
        p_max_patients_per_day: max_patients_per_day
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
        { error: 'Failed to create clinic' },
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
      message: 'Clinic created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating clinic:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get all clinics (for admin purposes)
export async function GET(request: NextRequest) {
  try {
    const clinics = await supabaseService.getClinics();
    
    // Return clinics without sensitive information
    const safeClinics = clinics.map((clinic: any) => ({
      id: clinic.id,
      name: clinic.name,
      address: clinic.address,
      phone: clinic.phone,
      email: clinic.email,
      subscription_plan: clinic.subscription_plan,
      max_doctors: clinic.max_doctors,
      max_patients_per_day: clinic.max_patients_per_day,
      is_active: clinic.is_active,
      created_at: clinic.created_at
    }));

    return NextResponse.json(safeClinics);
  } catch (error) {
    console.error('Error fetching clinics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clinics' },
      { status: 500 }
    );
  }
}
