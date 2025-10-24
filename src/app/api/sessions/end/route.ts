
import { NextRequest } from 'next/server';
import { ApiResponse } from '@/lib/api-response';
import { supabaseService } from '@/lib/supabase/service';
import { getClinicId, clinicIdNotFoundResponse } from '@/lib/api-utils';

export async function POST(request: NextRequest) {
    try {
        const clinicId = getClinicId(request);
        if (!clinicId) return clinicIdNotFoundResponse();

        const { doctorId, sessionName } = await request.json();

        if (!doctorId || !sessionName) {
            return ApiResponse.badRequest("Doctor ID and session name are required");
        }

        const doctor = await supabaseService.getDoctorById(doctorId);
        if (!doctor) {
            return ApiResponse.notFound("Doctor not found");
        }

        // End session with detailed tracking
        const sessionStats = await supabaseService.endSessionWithTracking(clinicId, doctorId, sessionName);

        // Get updated queue
        const queue = await supabaseService.getQueue(clinicId);
        
        console.log(`Session ${sessionName} ended for ${doctor.name}`);
        console.log('Session Statistics:', sessionStats);

        return ApiResponse.success({
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
        return ApiResponse.internalServerError('Failed to end session');
    }
}
