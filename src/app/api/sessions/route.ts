
import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service';
import { getClinicId, clinicIdNotFoundResponse } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
    try {
        const clinicId = getClinicId(request);
        if (!clinicId) return clinicIdNotFoundResponse();
        
        const sessions = await supabaseService.getSessions(clinicId);
        
        // Transform database format to frontend format
        const transformedSessions = sessions.map((session: any) => ({
            name: session.name,
            start: session.start_time,
            end: session.end_time
        }));
        
        return NextResponse.json(transformedSessions);
    } catch (error) {
        console.error('Error fetching sessions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch sessions' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const clinicId = getClinicId(request);
        if (!clinicId) return clinicIdNotFoundResponse();

        const newSessions = await request.json();
        
        // Delete existing sessions for this clinic
        const existingSessions = await supabaseService.getSessions(clinicId);
        for (const session of existingSessions) {
            await supabaseService.deleteSession(session.id);
        }

        // Create new sessions
        const createdSessions = [];
        for (const session of newSessions) {
            const created = await supabaseService.createSession({
                clinic_id: clinicId,
                name: session.name,
                start_time: session.start,
                end_time: session.end
            });
            createdSessions.push(created);
        }

        // Transform response to match frontend format
        const transformedSessions = createdSessions.map(session => ({
            name: session.name,
            start: session.start_time,
            end: session.end_time
        }));

        return NextResponse.json(transformedSessions);
    } catch (error) {
        console.error('Error updating sessions:', error);
        return NextResponse.json(
            { error: 'Failed to update sessions' },
            { status: 500 }
        );
    }
}
