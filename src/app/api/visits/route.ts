
import { NextRequest } from 'next/server';
import { supabaseService } from '@/lib/supabase/service';
import { getClinicId, clinicIdNotFoundResponse, validateRequiredFields } from '@/lib/api-utils';
import { ApiResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
    try {
        const clinicId = getClinicId(request);
        if (!clinicId) return clinicIdNotFoundResponse();

        const { searchParams } = new URL(request.url);
        const date = searchParams.get('date');
        const patientId = searchParams.get('patientId');

        let visits;

        if (patientId) {
            // Get visits for specific patient
            visits = await supabaseService.getVisits(clinicId);
            visits = visits.filter((visit: any) => visit.patient_id === patientId);
        } else if (date) {
            visits = await supabaseService.getVisits(clinicId, date);
        } else {
            visits = await supabaseService.getVisits(clinicId);
        }

        return ApiResponse.success(visits);
    } catch (error) {
        console.error('Error fetching visits:', error);
        return ApiResponse.internalServerError('Failed to fetch visits');
    }
}

export async function POST(request: NextRequest) {
    try {
        const clinicId = getClinicId(request);
        if (!clinicId) return clinicIdNotFoundResponse();

        const { visitId, status } = await request.json();

        // Validate required fields
        const validationError = validateRequiredFields({ visitId, status }, ['visitId', 'status']);
        if (validationError) return validationError;

        const updatedVisit = await supabaseService.updateVisit(visitId, { status });

        // If cancelled or no-show, update queue status
        if (status === "Cancelled" || status === "No-show") {
            try {
                // Find and update queue item
                const queue = await supabaseService.getQueue(clinicId);
                const queueItem = queue.find((q: any) => q.appointment_id === visitId);
                if (queueItem) {
                    await supabaseService.updateQueueStatus(queueItem.id, 'Cancelled');
                }
            } catch (queueError) {
                console.error('Error updating queue status:', queueError);
                // Continue with visit update even if queue update fails
            }
        }

        return ApiResponse.success(updatedVisit);
    } catch (error) {
        console.error('Error updating visit:', error);
        return ApiResponse.internalServerError('Failed to update visit');
    }
}
