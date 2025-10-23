
import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service';
import { getClinicId, clinicIdNotFoundResponse } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
    try {
        const clinicId = getClinicId(request);
        if (!clinicId) return clinicIdNotFoundResponse();
        
        const queue = await supabaseService.getQueue(clinicId);
        return NextResponse.json(queue);
    } catch (error) {
        console.error('Error fetching queue:', error);
        return NextResponse.json(
            { error: 'Failed to fetch queue' },
            { status: 500 }
        );
    }
}
