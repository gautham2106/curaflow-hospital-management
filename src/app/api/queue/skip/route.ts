
import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service';
import { getClinicId, clinicIdNotFoundResponse } from '@/lib/api-utils';

export async function POST(request: NextRequest) {
    try {
        const clinicId = getClinicId(request);
        if (!clinicId) return clinicIdNotFoundResponse();

        const { patientId } = await request.json();
        
        if (!patientId) {
            return NextResponse.json({ message: 'Patient ID is required' }, { status: 400 });
        }

        // Find the queue item by patient ID (appointment_id)
        const currentQueue = await supabaseService.getQueue(clinicId);
        const queueItem = currentQueue.find((q: any) => q.appointment_id === patientId);
        
        if (!queueItem) {
            return NextResponse.json({ message: 'Queue item not found' }, { status: 404 });
        }

        await supabaseService.skipPatient(queueItem.id, 'Skipped by receptionist');
        
        // Get updated queue
        const updatedQueue = await supabaseService.getQueue(clinicId);
        return NextResponse.json(updatedQueue);
    } catch (error) {
        console.error('Error skipping patient:', error);
        return NextResponse.json(
            { error: 'Failed to skip patient' },
            { status: 500 }
        );
    }
}
