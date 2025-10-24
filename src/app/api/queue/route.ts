
import { NextRequest } from 'next/server';
import { supabaseService } from '@/lib/supabase/service';
import { getClinicId, clinicIdNotFoundResponse } from '@/lib/api-utils';
import { ApiResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
    try {
        const clinicId = getClinicId(request);
        if (!clinicId) return clinicIdNotFoundResponse();

        const queue = await supabaseService.getQueue(clinicId);
        return ApiResponse.success(queue);
    } catch (error) {
        console.error('Error fetching queue:', error);
        return ApiResponse.internalServerError('Failed to fetch queue');
    }
}
