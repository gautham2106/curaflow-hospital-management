
import { NextRequest } from 'next/server';
import { supabaseService } from '@/lib/supabase/service';
import { getClinicId, clinicIdNotFoundResponse, validateRequiredFields } from '@/lib/api-utils';
import { ApiResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
    try {
        const clinicId = getClinicId(request);
        if (!clinicId) return clinicIdNotFoundResponse();

        const departments = await supabaseService.getDepartments(clinicId);
        return ApiResponse.success(departments);
    } catch (error) {
        console.error('Error fetching departments:', error);
        return ApiResponse.internalServerError('Failed to fetch departments');
    }
}

export async function POST(request: NextRequest) {
    try {
        const clinicId = getClinicId(request);
        if (!clinicId) return clinicIdNotFoundResponse();

        const { name } = await request.json();

        // Validate required fields
        const validationError = validateRequiredFields({ name }, ['name']);
        if (validationError) return validationError;

        const newDepartment = await supabaseService.createDepartment({
            clinic_id: clinicId,
            name: name
        });

        return ApiResponse.created(newDepartment);
    } catch (error) {
        console.error('Error creating department:', error);
        return ApiResponse.internalServerError('Failed to create department');
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const clinicId = getClinicId(request);
        if (!clinicId) return clinicIdNotFoundResponse();

        const { id } = await request.json();

        // Validate required fields
        const validationError = validateRequiredFields({ id }, ['id']);
        if (validationError) return validationError;

        await supabaseService.deleteDepartment(id);
        return ApiResponse.success({ message: 'Department removed' });
    } catch (error) {
        console.error('Error deleting department:', error);
        return ApiResponse.internalServerError('Failed to delete department');
    }
}
