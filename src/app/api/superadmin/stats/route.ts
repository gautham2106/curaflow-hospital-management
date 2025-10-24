import { NextRequest } from 'next/server';
import { ApiResponse } from '@/lib/api-response';
import { supabaseService } from '@/lib/supabase/service';
import { validateSuperadminAccess, createErrorResponse } from '@/lib/superadmin-auth';

// Get superadmin statistics - DIRECT DATABASE QUERY VERSION
export async function GET(request: NextRequest) {
  try {
    // Validate superadmin access
    const accessValidation = await validateSuperadminAccess(request);
    if (!accessValidation.isValid) {
      return createErrorResponse(accessValidation.error!, accessValidation.status!);
    }

    const superadminId = accessValidation.superadmin!.id;

    // Get clinic data directly from database
    const { data: clinics, error: clinicsError } = await supabaseService.supabase
      .from('clinics')
      .select('id, is_active, created_at')
      .eq('created_by_superadmin', superadminId);

    if (clinicsError) {
      console.error('Error fetching clinics:', clinicsError);
      return NextResponse.json(
        { error: 'Failed to fetch clinic data' },
        { status: 500 }
      );
    }

    // Calculate stats manually
    const totalClinics = clinics?.length || 0;
    const activeClinics = clinics?.filter(c => c.is_active).length || 0;
    const inactiveClinics = totalClinics - activeClinics;
    
    const today = new Date().toISOString().split('T')[0];
    const clinicsCreatedToday = clinics?.filter(c => 
      c.created_at?.startsWith(today)
    ).length || 0;
    
    const thisMonth = new Date().toISOString().substring(0, 7);
    const clinicsCreatedThisMonth = clinics?.filter(c => 
      c.created_at?.startsWith(thisMonth)
    ).length || 0;

    return NextResponse.json({
      total_clinics: totalClinics,
      active_clinics: activeClinics,
      inactive_clinics: inactiveClinics,
      total_doctors: 0,
      total_patients: 0,
      total_visits_today: 0,
      clinics_created_today: clinicsCreatedToday,
      clinics_created_this_month: clinicsCreatedThisMonth,
      usage_percentage: {
        clinics: totalClinics > 0 ? 100 : 0,
        doctors: 0,
        patients: 0
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