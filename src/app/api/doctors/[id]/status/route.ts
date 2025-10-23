
import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service';
import { getClinicId, clinicIdNotFoundResponse } from '@/lib/api-utils';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const clinicId = getClinicId(request);
        if (!clinicId) return clinicIdNotFoundResponse();

        const { id } = params;
        const { status } = await request.json();

        // Get current doctor to check current status
        const currentDoctor = await supabaseService.getDoctorById(id);
        
        if (!currentDoctor) {
            return NextResponse.json({ message: "Doctor not found" }, { status: 404 });
        }

        if (currentDoctor.status === 'On Leave' && status === 'Available') {
            return NextResponse.json({ 
                message: `Cannot set availability for a doctor who is On Leave.` 
            }, { status: 400 });
        }

        const updatedDoctor = await supabaseService.updateDoctorStatus(id, status);
        return NextResponse.json(updatedDoctor);
    } catch (error) {
        console.error('Error updating doctor status:', error);
        return NextResponse.json(
            { error: 'Failed to update doctor status' },
            { status: 500 }
        );
    }
}
