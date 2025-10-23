import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service';
import { validateSuperadminAccess, createErrorResponse } from '@/lib/superadmin-auth';

// Update clinic as superadmin
export async function PUT(request: NextRequest) {
  try {
    // Validate superadmin access
    const accessValidation = await validateSuperadminAccess(request);
    if (!accessValidation.isValid) {
      return createErrorResponse(accessValidation.error!, accessValidation.status!);
    }

    const superadminId = accessValidation.superadmin!.id;
    const { clinicId, ...updates } = await request.json();

    if (!clinicId) {
      return NextResponse.json(
        { error: 'Clinic ID is required' },
        { status: 400 }
      );
    }

    // Update clinic using superadmin function
    const { data, error } = await supabaseService.supabase
      .rpc('update_clinic_as_superadmin', {
        p_superadmin_id: superadminId,
        p_clinic_id: clinicId,
        p_name: updates.name || null,
        p_address: updates.address || null,
        p_phone: updates.phone || null,
        p_email: updates.email || null,
        p_admin_username: updates.admin_username || null,
        p_admin_pin: updates.admin_pin || null,
        p_admin_name: updates.admin_name || null,
        p_max_doctors: updates.max_doctors || null,
        p_max_patients_per_day: updates.max_patients_per_day || null,
        p_is_active: updates.is_active !== undefined ? updates.is_active : null,
        p_notes: updates.notes || null
      });

    if (error) {
      console.error('Error updating clinic:', error);
      return NextResponse.json(
        { error: 'Failed to update clinic' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Failed to update clinic' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Clinic updated successfully'
    });

  } catch (error) {
    console.error('Error updating clinic:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Deactivate clinic as superadmin
export async function DELETE(request: NextRequest) {
  try {
    // Validate superadmin access
    const accessValidation = await validateSuperadminAccess(request);
    if (!accessValidation.isValid) {
      return createErrorResponse(accessValidation.error!, accessValidation.status!);
    }

    const superadminId = accessValidation.superadmin!.id;
    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get('clinicId');
    const reason = searchParams.get('reason') || 'Deactivated by superadmin';

    if (!clinicId) {
      return NextResponse.json(
        { error: 'Clinic ID is required' },
        { status: 400 }
      );
    }

    // Deactivate clinic using superadmin function
    const { data, error } = await supabaseService.supabase
      .rpc('deactivate_clinic_as_superadmin', {
        p_superadmin_id: superadminId,
        p_clinic_id: clinicId,
        p_reason: reason
      });

    if (error) {
      console.error('Error deactivating clinic:', error);
      return NextResponse.json(
        { error: 'Failed to deactivate clinic' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Failed to deactivate clinic' },
        { status: 500 }
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