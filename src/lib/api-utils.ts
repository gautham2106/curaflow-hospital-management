
import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "./api-response";

export const getClinicId = (request: NextRequest): string | null => {
    return request.headers.get('x-clinic-id');
}

export const clinicIdNotFoundResponse = () => {
    return ApiResponse.badRequest('Clinic ID not found in request headers');
}

// Enhanced request validation helpers
export const validateClinicId = (request: NextRequest) => {
    const clinicId = getClinicId(request);
    if (!clinicId) {
        return { error: clinicIdNotFoundResponse(), clinicId: null };
    }
    return { error: null, clinicId };
};

export const validateRequiredFields = (data: any, requiredFields: string[]) => {
    const missingFields = requiredFields.filter(field => 
        data[field] === undefined || data[field] === null || data[field] === ''
    );
    
    if (missingFields.length > 0) {
        return ApiResponse.badRequest(
            `Missing required fields: ${missingFields.join(', ')}`
        );
    }
    
    return null;
};

export const validateUUID = (uuid: string, fieldName: string = 'ID') => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(uuid)) {
        return ApiResponse.badRequest(`Invalid ${fieldName} format`);
    }
    return null;
};
