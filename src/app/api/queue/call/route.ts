
import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service';
import { getClinicId, clinicIdNotFoundResponse } from '@/lib/api-utils';

export async function POST(request: NextRequest) {
    try {
        const clinicId = getClinicId(request);
        if (!clinicId) return clinicIdNotFoundResponse();

        const { queueId, doctorId, reason } = await request.json();

        if (!queueId) {
            return NextResponse.json({ message: 'Queue ID is required' }, { status: 400 });
        }

        // Complete any previous consultation for this doctor
        if (doctorId) {
            await supabaseService.completePreviousConsultation(doctorId, clinicId);
        }

        // Call the patient
        const updatedQueueItem = await supabaseService.callPatient(queueId);
        
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
