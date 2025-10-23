
import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service';
import { getClinicId, clinicIdNotFoundResponse } from '@/lib/api-utils';

export async function POST(request: NextRequest) {
    try {
        const clinicId = getClinicId(request);
        if (!clinicId) return clinicIdNotFoundResponse();

        const { orderedIds } = await request.json();
        
        if (!Array.isArray(orderedIds)) {
            return NextResponse.json({ message: "Invalid orderedIds format" }, { status: 400 });
        }

        // Create reorder data with display_order
        const reorderedResources = orderedIds.map((id: string, index: number) => ({
            id,
            display_order: index
        }));

        await supabaseService.reorderAdResources(clinicId, reorderedResources);

        return NextResponse.json({ message: "Order updated successfully" });
    } catch (error) {
        console.error('Error reordering ad resources:', error);
        return NextResponse.json(
            { error: 'Failed to reorder ad resources' },
            { status: 500 }
        );
    }
}
