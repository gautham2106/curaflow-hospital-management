import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service';
import { getClinicId, clinicIdNotFoundResponse } from '@/lib/api-utils';

// Get clinic statistics
export async function GET(request: NextRequest) {
  try {
    const clinicId = getClinicId(request);
    if (!clinicId) return clinicIdNotFoundResponse();

    // Get clinic statistics using database function
    const { data: stats, error } = await supabaseService.supabase
      .rpc('get_clinic_stats', { p_clinic_id: clinicId });

    if (error) {
      console.error('Error fetching clinic stats:', error);
      return NextResponse.json(
        { error: 'Failed to fetch clinic statistics' },
        { status: 500 }
      );
    }

    if (!stats || stats.length === 0) {
      return NextResponse.json(
        { error: 'Clinic not found' },
        { status: 404 }
      );
    }

    const clinicStats = stats[0];

    return NextResponse.json({
      total_doctors: clinicStats.total_doctors,
      total_patients: clinicStats.total_patients,
      total_visits_today: clinicStats.total_visits_today,
      active_queue_count: clinicStats.active_queue_count,
      subscription_plan: clinicStats.subscription_plan,
      max_doctors: clinicStats.max_doctors,
      max_patients_per_day: clinicStats.max_patients_per_day,
      usage_percentage: {
        doctors: Math.round((clinicStats.total_doctors / clinicStats.max_doctors) * 100),
        patients_today: Math.round((clinicStats.total_visits_today / clinicStats.max_patients_per_day) * 100)
      }
    });

  } catch (error) {
    console.error('Error fetching clinic stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update clinic admin credentials
export async function PUT(request: NextRequest) {
  try {
    const clinicId = getClinicId(request);
    if (!clinicId) return clinicIdNotFoundResponse();

    const { new_username, new_pin, new_admin_name } = await request.json();

    // Validate input
    if (!new_username || !new_pin || !new_admin_name) {
      return NextResponse.json(
        { error: 'New username, PIN, and admin name are required' },
        { status: 400 }
      );
    }

    // Validate PIN format
    if (!/^\d{4}$/.test(new_pin)) {
      return NextResponse.json(
        { error: 'PIN must be exactly 4 digits' },
        { status: 400 }
      );
    }

    // Check if new username already exists (excluding current clinic)
    const clinics = await supabaseService.getClinics();
    const usernameExists = clinics.some((clinic: any) => 
      clinic.admin_username === new_username && clinic.id !== clinicId
    );

    if (usernameExists) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 409 }
      );
    }

    // Update admin credentials using database function
    const { data: result, error } = await supabaseService.supabase
      .rpc('update_clinic_admin', {
        p_clinic_id: clinicId,
        p_new_username: new_username,
        p_new_pin: new_pin,
        p_new_admin_name: new_admin_name
      });

    if (error) {
      console.error('Error updating clinic admin:', error);
      return NextResponse.json(
        { error: 'Failed to update admin credentials' },
        { status: 500 }
      );
    }

    if (!result) {
      return NextResponse.json(
        { error: 'Clinic not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Admin credentials updated successfully'
    });

  } catch (error) {
    console.error('Error updating clinic admin:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Deactivate clinic
export async function DELETE(request: NextRequest) {
  try {
    const clinicId = getClinicId(request);
    if (!clinicId) return clinicIdNotFoundResponse();

    // Deactivate clinic using database function
    const { data: result, error } = await supabaseService.supabase
      .rpc('deactivate_clinic', { p_clinic_id: clinicId });

    if (error) {
      console.error('Error deactivating clinic:', error);
      return NextResponse.json(
        { error: 'Failed to deactivate clinic' },
        { status: 500 }
      );
    }

    if (!result) {
      return NextResponse.json(
        { error: 'Clinic not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Clinic deactivated successfully'
    });

  } catch (error) {
    console.error('Error deactivating clinic:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
