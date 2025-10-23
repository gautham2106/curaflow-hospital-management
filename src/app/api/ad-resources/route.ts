
import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service';
import { getClinicId, clinicIdNotFoundResponse } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
    try {
        const clinicId = getClinicId(request);
        if (!clinicId) return clinicIdNotFoundResponse();
        
        const adResources = await supabaseService.getAdResources(clinicId);
        return NextResponse.json(adResources);
    } catch (error) {
        console.error('Error fetching ad resources:', error);
        return NextResponse.json(
            { error: 'Failed to fetch ad resources' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const clinicId = getClinicId(request);
        if (!clinicId) return clinicIdNotFoundResponse();

        const resourceData = await request.json();
        const newResource = await supabaseService.createAdResource({
            clinic_id: clinicId,
            title: resourceData.title,
            type: resourceData.type,
            url: resourceData.url,
            duration: resourceData.duration || 30,
            display_order: resourceData.display_order || 0
        });
        
        return NextResponse.json(newResource, { status: 201 });
    } catch (error) {
        console.error('Error creating ad resource:', error);
        return NextResponse.json(
            { error: 'Failed to create ad resource' },
            { status: 500 }
        );
    }
}
