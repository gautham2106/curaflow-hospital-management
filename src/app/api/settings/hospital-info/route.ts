
import { NextRequest } from 'next/server';
import { ApiResponse } from '@/lib/api-response';
import { supabaseService } from '@/lib/supabase/service';
import { getClinicId, clinicIdNotFoundResponse } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
    try {
        const clinicId = getClinicId(request);
        if (!clinicId) return clinicIdNotFoundResponse();
        
        const clinic = await supabaseService.getClinicById(clinicId);
        if (!clinic) {
            return ApiResponse.notFound('Clinic not found');
        }

        const hospitalInfo = {
            name: clinic.name,
            address: clinic.address,
            phone: clinic.phone,
            email: clinic.email
        };

        return ApiResponse.success(hospitalInfo);
    } catch (error) {
        console.error('Error fetching hospital info:', error);
        return NextResponse.json(
            { error: 'Failed to fetch hospital info' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const clinicId = getClinicId(request);
        if (!clinicId) return clinicIdNotFoundResponse();

        const newInfo = await request.json();
        const updatedClinic = await supabaseService.updateClinic(clinicId, {
            name: newInfo.name,
            address: newInfo.address,
            phone: newInfo.phone,
            email: newInfo.email
        });

        const hospitalInfo = {
            name: updatedClinic.name,
            address: updatedClinic.address,
            phone: updatedClinic.phone,
            email: updatedClinic.email
        };

        return ApiResponse.success(hospitalInfo);
    } catch (error) {
        console.error('Error updating hospital info:', error);
        return NextResponse.json(
            { error: 'Failed to update hospital info' },
            { status: 500 }
        );
    }
}
