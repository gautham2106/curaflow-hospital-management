
import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service';
import { getClinicId, clinicIdNotFoundResponse } from '@/lib/api-utils';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const clinicId = getClinicId(request);
        if (!clinicId) return clinicIdNotFoundResponse();

        const { id } = params;
        const updatedData = await request.json();

        // Get current patient to check family ID logic
        const currentPatient = await supabaseService.getPatientById(id);
        if (!currentPatient) {
            return NextResponse.json({ message: "Patient not found" }, { status: 404 });
        }

        // Handle family ID update if phone changed
        if (updatedData.phone && updatedData.phone !== currentPatient.phone) {
            // For now, just update the family ID to match the new phone
            // In a more complex system, you'd handle family member relationships
            updatedData.family_id = updatedData.phone;
        }

        const updatedPatient = await supabaseService.updatePatient(id, updatedData);
        
        return NextResponse.json(updatedPatient);
    } catch (error) {
        console.error('Error updating patient:', error);
        return NextResponse.json(
            { error: 'Failed to update patient' },
            { status: 500 }
        );
    }
}
