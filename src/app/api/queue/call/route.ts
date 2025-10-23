
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

        // Complete any current patient in consultation for this doctor
        if (doctorId) {
            try {
                await supabaseService.completeCurrentPatientInQueue(doctorId, clinicId);
                console.log('Successfully completed current patient for doctor:', doctorId);
            } catch (error) {
                console.error('Error completing current patient:', error);
                // Continue execution even if this fails
            }
        }

        // Find the queue item by patient ID
        const queue = await supabaseService.getQueue(clinicId);
        const queueItem = queue.find(q => q.appointment_id === patientId);
        
        if (!queueItem) {
            return NextResponse.json({ message: 'Queue item not found' }, { status: 404 });
        }

        // Call the patient
        const updatedQueueItem = await supabaseService.callPatient(queueItem.id, reason);
        
        // Update visit record with call details
        if (updatedQueueItem.visits) {
            await supabaseService.updateVisit(updatedQueueItem.appointment_id, {
                called_time: new Date().toISOString(),
                was_out_of_turn: !!reason,
                out_of_turn_reason: reason || null
            });
        }

        // Get updated queue
        const updatedQueue = await supabaseService.getQueue(clinicId);
        return NextResponse.json(updatedQueue);
    } catch (error) {
        console.error('Error calling patient:', error);
        return NextResponse.json(
            { error: 'Failed to call patient' },
            { status: 500 }
        );
    }
}
