
import { NextRequest } from 'next/server';
import { supabaseService } from '@/lib/supabase/service';
import { getClinicId, clinicIdNotFoundResponse } from '@/lib/api-utils';
import { ApiResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
    try {
        const clinicId = getClinicId(request);
        if (!clinicId) return clinicIdNotFoundResponse();

        const { searchParams } = new URL(request.url);
        const phone = searchParams.get('phone');

        if (!phone) {
            return ApiResponse.badRequest('Phone number is required');
        }

        const results = await supabaseService.searchPatients(clinicId, phone);
        return ApiResponse.success(results);
    } catch (error) {
        console.error('Error searching patients:', error);
        return ApiResponse.internalServerError('Failed to search patients');
    }
}
