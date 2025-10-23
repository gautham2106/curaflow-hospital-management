
import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { getClinicId, clinicIdNotFoundResponse } from '@/lib/api-utils';

export async function POST(request: NextRequest) {
    try {
        const clinicId = getClinicId(request);
        if (!clinicId) return clinicIdNotFoundResponse();

        const { isNewPatient, patient, appointment } = await request.json();
        const { doctorId, session, date: apptDateStr } = appointment;
        const apptDate = new Date(apptDateStr);

        // Get doctor information
        const doctor = await supabaseService.getDoctorById(doctorId);
        if (!doctor) {
            return NextResponse.json({ message: 'Doctor not found' }, { status: 404 });
        }

        let patientRecord;
        if (isNewPatient) {
            // Create new patient
            patientRecord = await supabaseService.createPatient({
                clinic_id: clinicId,
                name: patient.name,
                phone: patient.phone,
                age: patient.age,
                gender: patient.gender,
                family_id: uuidv4(), // Generate proper UUID for family_id
                last_visit: new Date().toISOString(),
                total_visits: 1,
            });
        } else {
            // Update existing patient
            const existingPatient = await supabaseService.getPatientById(patient.id);
            if (!existingPatient) {
                return NextResponse.json({ message: 'Existing patient not found' }, { status: 404 });
            }
            
            patientRecord = await supabaseService.updatePatient(patient.id, {
                total_visits: (existingPatient.total_visits || 0) + 1,
                last_visit: new Date().toISOString(),
            });
        }
        
        // Get next token number for this doctor, date, and session
        const nextTokenNumber = await supabaseService.getNextTokenNumber(
            clinicId, 
            doctorId, 
            format(apptDate, 'yyyy-MM-dd'), 
            session
        ) + 1;

        // Create visit record
        const newVisitRecord = await supabaseService.createVisit({
            clinic_id: clinicId,
            patient_id: patientRecord.id,
            doctor_id: doctorId,
            token_number: nextTokenNumber,
            date: format(apptDate, 'yyyy-MM-dd'),
            session: session,
            check_in_time: new Date().toISOString(),
            status: 'Scheduled'
        });
        
        // Add to queue if it's today's appointment
        if (format(apptDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')) {
            await supabaseService.addToQueue({
                clinic_id: clinicId,
                appointment_id: newVisitRecord.id,
                check_in_time: new Date().toISOString(),
                status: 'Waiting',
                priority: 'Medium'
            });
        }

        const tokenData = {
            id: newVisitRecord.id,
            patientName: patientRecord.name,
            age: patientRecord.age,
            gender: patientRecord.gender,
            phone: patientRecord.phone,
            doctor: doctor,
            session: session,
            tokenNumber: nextTokenNumber,
            date: apptDate,
            status: 'Scheduled' as const,
            clinicId: clinicId
        };
        
        // Debug logging
        console.log('Token API - Generated tokenData:', JSON.stringify(tokenData, null, 2));
        console.log('Token API - nextTokenNumber:', nextTokenNumber);
        console.log('Token API - tokenNumber type:', typeof nextTokenNumber);
        
        return NextResponse.json(tokenData, { status: 201 });
    } catch (error) {
        console.error('Error creating token:', error);
        return NextResponse.json(
            { error: 'Failed to create token' },
            { status: 500 }
        );
    }
}
