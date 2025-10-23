
import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service';
import { getClinicId, clinicIdNotFoundResponse } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
    try {
        const clinicId = getClinicId(request);
        if (!clinicId) return clinicIdNotFoundResponse();

        const { searchParams } = new URL(request.url);
        const phone = searchParams.get('phone');

        if (!phone) {
            return NextResponse.json({ message: 'Phone number is required' }, { status: 400 });
        }

        const results = await supabaseService.searchPatients(clinicId, phone);
        return NextResponse.json(results);
    } catch (error) {
        console.error('Error searching patients:', error);
        return NextResponse.json(
            { error: 'Failed to search patients' },
            { status: 500 }
        );
    }
}
