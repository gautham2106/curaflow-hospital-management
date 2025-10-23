
import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service';
import { getClinicId, clinicIdNotFoundResponse } from '@/lib/api-utils';

export async function POST(request: NextRequest) {
    try {
        const clinicId = getClinicId(request);
        if (!clinicId) return clinicIdNotFoundResponse();

        const { queueId } = await request.json();
        
        if (!queueId) {
            return NextResponse.json({ message: 'Queue ID is required' }, { status: 400 });
        }

        await supabaseService.skipPatient(queueId);
        
        // Get updated queue
        const queue = await supabaseService.getQueue(clinicId);
        return NextResponse.json(queue);
    } catch (error) {
        console.error('Error skipping patient:', error);
        return NextResponse.json(
            { error: 'Failed to skip patient' },
            { status: 500 }
        );
    }
}
