
import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service';
import { getClinicId, clinicIdNotFoundResponse } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
    try {
        const clinicId = getClinicId(request);
        if (!clinicId) return clinicIdNotFoundResponse();
        
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        const doctors = await supabaseService.getDoctors(clinicId, status || undefined);
        return NextResponse.json(doctors);
    } catch (error) {
        console.error('Error fetching doctors:', error);
        return NextResponse.json(
            { error: 'Failed to fetch doctors' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const clinicId = getClinicId(request);
        if (!clinicId) return clinicIdNotFoundResponse();
        
        const body = await request.json();
        const newDoctor = await supabaseService.createDoctor({
            clinic_id: clinicId,
            name: body.name,
            specialty: body.specialty,
            phone: body.phone,
            avatar: body.avatar || `https://picsum.photos/seed/${Math.random()}/100/100`,
            status: 'Available',
            sessions: body.sessions || []
        });
        
        return NextResponse.json(newDoctor, { status: 201 });
    } catch (error) {
        console.error('Error creating doctor:', error);
        return NextResponse.json(
            { error: 'Failed to create doctor' },
            { status: 500 }
        );
    }
}
