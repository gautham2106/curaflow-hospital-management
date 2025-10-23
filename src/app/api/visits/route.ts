
import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service';
import { getClinicId, clinicIdNotFoundResponse } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
    try {
        const clinicId = getClinicId(request);
        if (!clinicId) return clinicIdNotFoundResponse();

        const { searchParams } = new URL(request.url);
        const date = searchParams.get('date');
        const patientId = searchParams.get('patientId');

        let visits;

        if (patientId) {
            // Get visits for specific patient
            visits = await supabaseService.getVisits(clinicId);
            visits = visits.filter((visit: any) => visit.patient_id === patientId);
        } else if (date) {
            visits = await supabaseService.getVisits(clinicId, date);
        } else {
            visits = await supabaseService.getVisits(clinicId);
        }

        return NextResponse.json(visits);
    } catch (error) {
        console.error('Error fetching visits:', error);
        return NextResponse.json(
            { error: 'Failed to fetch visits' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const clinicId = getClinicId(request);
        if (!clinicId) return clinicIdNotFoundResponse();

        const { visitId, status } = await request.json();
        
        if (!visitId || !status) {
            return NextResponse.json({ message: "Visit ID and status are required" }, { status: 400 });
        }

        const updatedVisit = await supabaseService.updateVisit(visitId, { status });

        // If cancelled or no-show, update queue status
        if (status === "Cancelled" || status === "No-show") {
            try {
                // Find and update queue item
                const queue = await supabaseService.getQueue(clinicId);
                const queueItem = queue.find((q: any) => q.appointment_id === visitId);
                if (queueItem) {
                    await supabaseService.updateQueueStatus(queueItem.id, 'Cancelled');
                }
            } catch (queueError) {
                console.error('Error updating queue status:', queueError);
                // Continue with visit update even if queue update fails
            }
        }
        
        return NextResponse.json(updatedVisit);
    } catch (error) {
        console.error('Error updating visit:', error);
        return NextResponse.json(
            { error: 'Failed to update visit' },
            { status: 500 }
        );
    }
}
