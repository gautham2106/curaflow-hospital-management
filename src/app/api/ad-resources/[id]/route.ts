
import { NextRequest } from 'next/server';
import { ApiResponse } from '@/lib/api-response';
import { supabaseService } from '@/lib/supabase/service';
import { getClinicId, clinicIdNotFoundResponse } from '@/lib/api-utils';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const clinicId = getClinicId(request);
        if (!clinicId) return clinicIdNotFoundResponse();

        const { id } = params;
        const updatedData = await request.json();

        const updatedResource = await supabaseService.updateAdResource(id, updatedData);
        return ApiResponse.success(updatedResource);
    } catch (error) {
        console.error('Error updating ad resource:', error);
        return ApiResponse.internalServerError('Failed to update ad resource');
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const clinicId = getClinicId(request);
        if (!clinicId) return clinicIdNotFoundResponse();

        const { id } = params;
        await supabaseService.deleteAdResource(id);
        return ApiResponse.success({ message: 'Resource deleted' });
    } catch (error) {
        console.error('Error deleting ad resource:', error);
        return ApiResponse.internalServerError('Failed to delete ad resource');
    }
}
