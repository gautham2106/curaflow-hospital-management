
import { NextRequest } from 'next/server';
import { supabaseService } from '@/lib/supabase/service';
import { getClinicId, clinicIdNotFoundResponse, validateRequiredFields } from '@/lib/api-utils';
import { ApiResponse } from '@/lib/api-response';

export async function POST(request: NextRequest) {
    try {
        const clinicId = getClinicId(request);
        if (!clinicId) return clinicIdNotFoundResponse();

        const { patientId } = await request.json();

        // Validate required fields
        const validationError = validateRequiredFields({ patientId }, ['patientId']);
        if (validationError) return validationError;

        // Find the queue item by patient ID (appointment_id)
        const currentQueue = await supabaseService.getQueue(clinicId);
        const queueItem = currentQueue.find((q: any) => q.appointment_id === patientId);

        if (!queueItem) {
            return ApiResponse.notFound('Queue item not found');
        }

        await supabaseService.skipPatient(queueItem.id, 'Skipped by receptionist');

        // Get updated queue
        const updatedQueue = await supabaseService.getQueue(clinicId);
        return ApiResponse.success(updatedQueue);
    } catch (error) {
        console.error('Error skipping patient:', error);
        return ApiResponse.internalServerError('Failed to skip patient');
    }
}
