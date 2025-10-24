
import { NextRequest } from 'next/server';
import { ApiResponse } from '@/lib/api-response';
import { supabaseService } from '@/lib/supabase/service';
import { getClinicId, clinicIdNotFoundResponse } from '@/lib/api-utils';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const clinicId = getClinicId(request);
        if (!clinicId) return clinicIdNotFoundResponse();

        const { id } = params;
        const { status } = await request.json();

        // Get current doctor to check current status
        const currentDoctor = await supabaseService.getDoctorById(id);
        
        if (!currentDoctor) {
            return ApiResponse.notFound("Doctor not found");
        }

        if (currentDoctor.status === 'On Leave' && status === 'Available') {
            return ApiResponse.badRequest(`Cannot set availability for a doctor who is On Leave.`);
        }

        const updatedDoctor = await supabaseService.updateDoctorStatus(id, status);
        return ApiResponse.success(updatedDoctor);
    } catch (error) {
        console.error('Error updating doctor status:', error);
        return ApiResponse.internalServerError('Failed to update doctor status');
    }
}
