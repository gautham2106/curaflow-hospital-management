
import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service';
import { getClinicId, clinicIdNotFoundResponse } from '@/lib/api-utils';

export async function POST(request: NextRequest) {
    try {
        const clinicId = getClinicId(request);
        if (!clinicId) return clinicIdNotFoundResponse();

        const { patientId, doctorId, reason } = await request.json();

        if (!patientId) {
            return NextResponse.json({ message: 'Patient ID is required' }, { status: 400 });
        }

        // Complete any previous consultation for this doctor
        if (doctorId) {
            await supabaseService.completePreviousConsultation(doctorId, clinicId);
        }

        // Find the queue item by patient ID
        const queue = await supabaseService.getQueue(clinicId);
        const queueItem = queue.find(q => q.appointment_id === patientId);
        
        if (!queueItem) {
            return NextResponse.json({ message: 'Queue item not found' }, { status: 404 });
        }

        // Call the patient
        const updatedQueueItem = await supabaseService.callPatient(queueItem.id);
        
        // Update visit record if reason is provided
        if (reason && updatedQueueItem.visits) {
            await supabaseService.updateVisit(updatedQueueItem.appointment_id, {
                out_of_turn_reason: reason,
                called_time: new Date().toISOString()
            });
        }

        // Get updated queue
        const queue = await supabaseService.getQueue(clinicId);
        return NextResponse.json(queue);
    } catch (error) {
        console.error('Error calling patient:', error);
        return NextResponse.json(
            { error: 'Failed to call patient' },
            { status: 500 }
        );
    }
}
