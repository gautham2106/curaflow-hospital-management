
import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service';
import { getClinicId, clinicIdNotFoundResponse } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
    try {
        const clinicId = getClinicId(request);
        if (!clinicId) return clinicIdNotFoundResponse();
        
        const departments = await supabaseService.getDepartments(clinicId);
        return NextResponse.json(departments);
    } catch (error) {
        console.error('Error fetching departments:', error);
        return NextResponse.json(
            { error: 'Failed to fetch departments' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const clinicId = getClinicId(request);
        if (!clinicId) return clinicIdNotFoundResponse();

        const { name } = await request.json();
        if (!name) {
            return NextResponse.json({ message: 'Department name is required' }, { status: 400 });
        }

        const newDepartment = await supabaseService.createDepartment({
            clinic_id: clinicId,
            name: name
        });

        return NextResponse.json(newDepartment, { status: 201 });
    } catch (error) {
        console.error('Error creating department:', error);
        return NextResponse.json(
            { error: 'Failed to create department' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const clinicId = getClinicId(request);
        if (!clinicId) return clinicIdNotFoundResponse();

        const { id } = await request.json();
        if (!id) {
            return NextResponse.json({ message: 'Department ID is required' }, { status: 400 });
        }

        await supabaseService.deleteDepartment(id);
        return NextResponse.json({ message: 'Department removed' });
    } catch (error) {
        console.error('Error deleting department:', error);
        return NextResponse.json(
            { error: 'Failed to delete department' },
            { status: 500 }
        );
    }
}
