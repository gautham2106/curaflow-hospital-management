
import { NextRequest } from 'next/server';
import { supabaseService } from '@/lib/supabase/service';
import { getClinicId, clinicIdNotFoundResponse, validateRequiredFields } from '@/lib/api-utils';
import { ApiResponse } from '@/lib/api-response';

export async function POST(request: NextRequest) {
    try {
        const clinicId = getClinicId(request);
        if (!clinicId) return clinicIdNotFoundResponse();

        const { patientId, doctorId, reason } = await request.json();

        // Validate required fields
        const validationError = validateRequiredFields({ patientId }, ['patientId']);
        if (validationError) return validationError;

        // Complete any current patient in consultation for this doctor
        if (doctorId) {
            try {
                await supabaseService.completeCurrentPatientInQueue(doctorId, clinicId);
                console.log('Successfully completed current patient for doctor:', doctorId);
            } catch (error) {
                console.error('Error completing current patient:', error);
                // Continue execution even if this fails
            }
        }

        // Find the queue item by patient ID
        const queue = await supabaseService.getQueue(clinicId);
        const queueItem = queue.find((q: any) => q.appointment_id === patientId);

        if (!queueItem) {
            return ApiResponse.notFound('Queue item not found');
        }

        // Call the patient
        const updatedQueueItem = await supabaseService.callPatient(queueItem.id, reason);

        // Update visit record with call details
        if (updatedQueueItem.visits) {
            await supabaseService.updateVisit(updatedQueueItem.appointment_id, {
                called_time: new Date().toISOString(),
                // was_out_of_turn: !!reason, // This field doesn't exist in the database schema
                out_of_turn_reason: reason || null
            });
        }

        // Get updated queue
        const updatedQueue = await supabaseService.getQueue(clinicId);
        return ApiResponse.success(updatedQueue);
    } catch (error) {
        console.error('Error calling patient:', error);
        return ApiResponse.internalServerError('Failed to call patient');
    }
}
