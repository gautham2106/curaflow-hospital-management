import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service';
import { validateSuperadminAccess, createErrorResponse } from '@/lib/superadmin-auth';

// Get superadmin statistics
export async function GET(request: NextRequest) {
  try {
    // Validate superadmin access
    const accessValidation = await validateSuperadminAccess(request);
    if (!accessValidation.isValid) {
      return createErrorResponse(accessValidation.error!, accessValidation.status!);
    }

    const superadminId = accessValidation.superadmin!.id;

    // Get statistics using superadmin function
    const { data: stats, error } = await supabaseService.supabase
      .rpc('get_superadmin_stats', { p_superadmin_id: superadminId });

    if (error) {
      console.error('Error fetching superadmin stats:', error);
      return NextResponse.json(
        { error: 'Failed to fetch statistics' },
        { status: 500 }
      );
    }

    if (!stats || stats.length === 0) {
      return NextResponse.json(
        { error: 'No statistics found' },
        { status: 404 }
      );
    }

    const statistics = stats[0];

    return NextResponse.json({
      total_clinics: statistics.total_clinics,
      active_clinics: statistics.active_clinics,
      inactive_clinics: statistics.inactive_clinics,
      total_doctors: statistics.total_doctors,
      total_patients: statistics.total_patients,
      total_visits_today: statistics.total_visits_today,
      clinics_created_today: statistics.clinics_created_today,
      clinics_created_this_month: statistics.clinics_created_this_month,
      usage_percentage: {
        clinics: statistics.total_clinics > 0 ? 100 : 0, // Assuming no limit for superadmin
        doctors: statistics.total_doctors > 0 ? 100 : 0,
        patients: statistics.total_patients > 0 ? 100 : 0
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
