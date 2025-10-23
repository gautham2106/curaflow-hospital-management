
import { NextRequest, NextResponse } from "next/server";

export const getClinicId = (request: NextRequest): string | null => {
    return request.headers.get('x-clinic-id');
}

export const clinicIdNotFoundResponse = () => {
    return NextResponse.json({ message: 'Clinic ID not found in request headers.' }, { status: 400 });
}
