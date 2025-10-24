
import { NextRequest } from 'next/server';
import { supabaseService } from '@/lib/supabase/service';
import { getClinicId, clinicIdNotFoundResponse, validateRequiredFields } from '@/lib/api-utils';
import { ApiResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
    try {
        const clinicId = getClinicId(request);
        if (!clinicId) return clinicIdNotFoundResponse();

        const adResources = await supabaseService.getAdResources(clinicId);
        return ApiResponse.success(adResources);
    } catch (error) {
        console.error('Error fetching ad resources:', error);
        return ApiResponse.internalServerError('Failed to fetch ad resources');
    }
}

export async function POST(request: NextRequest) {
    try {
        const clinicId = getClinicId(request);
        if (!clinicId) return clinicIdNotFoundResponse();

        const resourceData = await request.json();

        // Validate required fields
        const validationError = validateRequiredFields(resourceData, ['title', 'type', 'url']);
        if (validationError) return validationError;

        const newResource = await supabaseService.createAdResource({
            clinic_id: clinicId,
            title: resourceData.title,
            type: resourceData.type,
            url: resourceData.url,
            duration: resourceData.duration || 30,
            display_order: resourceData.display_order || 0
        });

        return ApiResponse.created(newResource);
    } catch (error) {
        console.error('Error creating ad resource:', error);
        return ApiResponse.internalServerError('Failed to create ad resource');
    }
}
