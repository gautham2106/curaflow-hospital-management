
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

        // End session for doctor using the service function
        await supabaseService.endSessionForDoctor(clinicId, doctor.name, sessionName);

        // Complete any ongoing consultations for this doctor
        await supabaseService.completePreviousConsultation(doctorId, clinicId);

        // Get updated queue
        const queue = await supabaseService.getQueue(clinicId);
        
        console.log(`Session ${sessionName} ended for ${doctor.name}`);

        return NextResponse.json(queue);
    } catch (error) {
        console.error('Error ending session:', error);
        return NextResponse.json(
            { error: 'Failed to end session' },
            { status: 500 }
        );
    }
}
