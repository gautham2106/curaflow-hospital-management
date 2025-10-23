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

// Get superadmin statistics
export async function GET(request: NextRequest) {
  try {
    const superadminId = getSuperadminId(request);
    if (!superadminId) {
      return NextResponse.json(
        { error: 'Superadmin authentication required' },
        { status: 401 }
      );
    }

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
