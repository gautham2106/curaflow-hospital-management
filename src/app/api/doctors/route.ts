
import { NextRequest } from 'next/server';
import { supabaseService } from '@/lib/supabase/service';
import { getClinicId, clinicIdNotFoundResponse, validateRequiredFields } from '@/lib/api-utils';
import { ApiResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
    try {
        const clinicId = getClinicId(request);
        if (!clinicId) return clinicIdNotFoundResponse();

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        const doctors = await supabaseService.getDoctors(clinicId, status || undefined);
        return ApiResponse.success(doctors);
    } catch (error) {
        console.error('Error fetching doctors:', error);
        return ApiResponse.internalServerError('Failed to fetch doctors');
    }
}

export async function POST(request: NextRequest) {
    try {
        const clinicId = getClinicId(request);
        if (!clinicId) return clinicIdNotFoundResponse();

        const body = await request.json();

        // Validate required fields
        const validationError = validateRequiredFields(body, ['name', 'specialty']);
        if (validationError) return validationError;

        const newDoctor = await supabaseService.createDoctor({
            clinic_id: clinicId,
            name: body.name,
            specialty: body.specialty,
            phone: body.phone,
            avatar: body.avatar || `https://picsum.photos/seed/${Math.random()}/100/100`,
            status: 'Available',
            sessions: body.sessions || []
        });

        return ApiResponse.created(newDoctor);
    } catch (error) {
        console.error('Error creating doctor:', error);
        return ApiResponse.internalServerError('Failed to create doctor');
    }
}
