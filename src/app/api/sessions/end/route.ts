
import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service';
import { getClinicId, clinicIdNotFoundResponse } from '@/lib/api-utils';

export async function POST(request: NextRequest) {
    try {
        const clinicId = getClinicId(request);
        if (!clinicId) return clinicIdNotFoundResponse();

        const { doctorId, sessionName } = await request.json();

        if (!doctorId || !sessionName) {
            return NextResponse.json({ message: "Doctor ID and session name are required" }, { status: 400 });
        }

        const doctor = await supabaseService.getDoctorById(doctorId);
        if (!doctor) {
            return NextResponse.json({ message: "Doctor not found" }, { status: 404 });
        }

        // End session with detailed tracking
        const sessionStats = await supabaseService.endSessionWithTracking(clinicId, doctorId, sessionName);

        // Get updated queue
        const queue = await supabaseService.getQueue(clinicId);
        
        console.log(`Session ${sessionName} ended for ${doctor.name}`);
        console.log('Session Statistics:', sessionStats);

        return NextResponse.json({
            queue,
            sessionStats: {
                totalPatients: sessionStats.total_patients,
                completedPatients: sessionStats.completed_patients,
                waitingPatients: sessionStats.waiting_patients,
                skippedPatients: sessionStats.skipped_patients,
                noShowPatients: sessionStats.no_show_patients,
                avgWaitingTime: Math.round(sessionStats.avg_waiting_time * 100) / 100,
                avgConsultationTime: Math.round(sessionStats.avg_consultation_time * 100) / 100,
                totalRevenue: sessionStats.total_revenue
            }
        });
    } catch (error) {
        console.error('Error ending session:', error);
        return NextResponse.json(
            { error: 'Failed to end session' },
            { status: 500 }
        );
    }
}
