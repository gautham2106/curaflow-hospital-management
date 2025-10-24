
import { NextRequest } from 'next/server';
import { supabaseService } from '@/lib/supabase/service';
import { getClinicId, clinicIdNotFoundResponse, validateUUID } from '@/lib/api-utils';
import { ApiResponse } from '@/lib/api-response';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const clinicId = getClinicId(request);
        if (!clinicId) return clinicIdNotFoundResponse();

        const { id } = params;

        // Validate UUID
        const uuidError = validateUUID(id, 'Patient ID');
        if (uuidError) return uuidError;

        const updatedData = await request.json();

        // Get current patient to check family ID logic
        const currentPatient = await supabaseService.getPatientById(id);
        if (!currentPatient) {
            return ApiResponse.notFound('Patient not found');
        }

        // Handle family ID update if phone changed
        if (updatedData.phone && updatedData.phone !== currentPatient.phone) {
            // For now, just update the family ID to match the new phone
            // In a more complex system, you'd handle family member relationships
            updatedData.family_id = updatedData.phone;
        }

        const updatedPatient = await supabaseService.updatePatient(id, updatedData);

        return ApiResponse.success(updatedPatient);
    } catch (error) {
        console.error('Error updating patient:', error);
        return ApiResponse.internalServerError('Failed to update patient');
    }
}
