
import { NextRequest } from 'next/server';
import { ApiResponse } from '@/lib/api-response';
import { getClinicId, clinicIdNotFoundResponse, validateRequiredFields } from '@/lib/api-utils';

export async function POST(request: NextRequest) {
    try {
        const clinicId = getClinicId(request);
        if (!clinicId) return clinicIdNotFoundResponse();

        const body = await request.json();
        
        // Validate required fields
        const validation = validateRequiredFields(body, [
            'tokenData',
            'sessionTimeRange', 
            'clinicName'
        ]);
        
        if (!validation.isValid) {
            return ApiResponse.badRequest(validation.error);
        }

        const { tokenData, sessionTimeRange, clinicName } = body;

        // Validate tokenData structure
        const tokenValidation = validateRequiredFields(tokenData, [
            'id',
            'clinicId', 
            'patientName',
            'phone',
            'tokenNumber',
            'date',
            'session',
            'doctor'
        ]);
        
        if (!tokenValidation.isValid) {
            return ApiResponse.badRequest(`Invalid tokenData: ${tokenValidation.error}`);
        }

        // Validate doctor structure
        const doctorValidation = validateRequiredFields(tokenData.doctor, [
            'id',
            'name',
            'specialty'
        ]);
        
        if (!doctorValidation.isValid) {
            return ApiResponse.badRequest(`Invalid doctor data: ${doctorValidation.error}`);
        }

        console.log('WhatsApp API - Processing request for:', tokenData.patientName);

        // For now, return success without actually sending WhatsApp
        // This will help us verify the API structure is working
        return ApiResponse.success({
            message: 'WhatsApp notification would be sent',
            data: {
                patientName: tokenData.patientName,
                clinicName: clinicName,
                tokenNumber: tokenData.tokenNumber,
                doctorName: tokenData.doctor.name,
                session: tokenData.session,
                phone: tokenData.phone
            }
        });

    } catch (error) {
        console.error('Error in WhatsApp API:', error);
        return ApiResponse.internalServerError('Failed to process WhatsApp request');
    }
}
