
import { NextRequest } from 'next/server';
import { ApiResponse } from '@/lib/api-response';
import { supabaseService } from '@/lib/supabase/service';
import { getClinicId, clinicIdNotFoundResponse } from '@/lib/api-utils';

export async function POST(request: NextRequest) {
    try {
        const clinicId = getClinicId(request);
        if (!clinicId) return clinicIdNotFoundResponse();

        const { orderedIds } = await request.json();
        
        if (!Array.isArray(orderedIds)) {
            return ApiResponse.badRequest("Invalid orderedIds format");
        }

        // Create reorder data with display_order
        const reorderedResources = orderedIds.map((id: string, index: number) => ({
            id,
            display_order: index
        }));

        await supabaseService.reorderAdResources(clinicId, reorderedResources);

        return ApiResponse.success({ message: "Order updated successfully" });
    } catch (error) {
        console.error('Error reordering ad resources:', error);
        return ApiResponse.internalServerError('Failed to reorder ad resources');
    }
}
