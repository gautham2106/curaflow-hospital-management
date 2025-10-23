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
  return 'superadmin-id'; // This would be the actual superadmin ID from token validation
}

// Update clinic
export async function PUT(request: NextRequest) {
  try {
    const superadminId = getSuperadminId(request);
    if (!superadminId) {
      return NextResponse.json(
        { error: 'Superadmin authentication required' },
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

    // Update clinic using superadmin function
    const { data: result, error } = await supabaseService.supabase
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
        p_subscription_plan: updates.subscription_plan || null,
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

    if (!result || result.length === 0 || !result[0].success) {
      return NextResponse.json(
        { error: result?.[0]?.message || 'Failed to update clinic' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result[0].message
    });

  } catch (error) {
    console.error('Error updating clinic:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Deactivate clinic
export async function DELETE(request: NextRequest) {
  try {
    const superadminId = getSuperadminId(request);
    if (!superadminId) {
      return NextResponse.json(
        { error: 'Superadmin authentication required' },
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

    // Deactivate clinic using superadmin function
    const { data: result, error } = await supabaseService.supabase
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

    if (!result || result.length === 0 || !result[0].success) {
      return NextResponse.json(
        { error: result?.[0]?.message || 'Failed to deactivate clinic' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result[0].message
    });

  } catch (error) {
    console.error('Error deactivating clinic:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
