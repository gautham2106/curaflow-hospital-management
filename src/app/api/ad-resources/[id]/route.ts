
import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service';
import { getClinicId, clinicIdNotFoundResponse } from '@/lib/api-utils';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const clinicId = getClinicId(request);
        if (!clinicId) return clinicIdNotFoundResponse();

        const { id } = params;
        const updatedData = await request.json();

        const updatedResource = await supabaseService.updateAdResource(id, updatedData);
        return NextResponse.json(updatedResource);
    } catch (error) {
        console.error('Error updating ad resource:', error);
        return NextResponse.json(
            { error: 'Failed to update ad resource' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const clinicId = getClinicId(request);
        if (!clinicId) return clinicIdNotFoundResponse();

        const { id } = params;
        await supabaseService.deleteAdResource(id);
        return NextResponse.json({ message: 'Resource deleted' }, { status: 200 });
    } catch (error) {
        console.error('Error deleting ad resource:', error);
        return NextResponse.json(
            { error: 'Failed to delete ad resource' },
            { status: 500 }
        );
    }
}
