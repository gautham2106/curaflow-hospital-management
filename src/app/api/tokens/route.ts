
import { NextRequest } from 'next/server';
import { supabaseService } from '@/lib/supabase/service';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { getClinicId, clinicIdNotFoundResponse, validateRequiredFields } from '@/lib/api-utils';
import { ApiResponse } from '@/lib/api-response';

export async function POST(request: NextRequest) {
    try {
        const clinicId = getClinicId(request);
        if (!clinicId) return clinicIdNotFoundResponse();

        const { isNewPatient, patient, appointment } = await request.json();

        // Validate required fields
        const validationError = validateRequiredFields(appointment, ['doctorId', 'session', 'date']);
        if (validationError) return validationError;

        const { doctorId, session, date: apptDateStr } = appointment;
        // Parse date string properly to avoid timezone issues
        // Ensure we're working with local timezone by adding T00:00:00
        const apptDate = new Date(apptDateStr + 'T00:00:00');
        
        // Validate the date is valid
        if (isNaN(apptDate.getTime())) {
            return ApiResponse.badRequest('Invalid appointment date');
        }

        // Get doctor information
        const doctor = await supabaseService.getDoctorById(doctorId);
        if (!doctor) {
            return ApiResponse.notFound('Doctor not found');
        }

        let patientRecord;
        if (isNewPatient) {
            // Validate patient fields for new patient
            const patientValidationError = validateRequiredFields(patient, ['name', 'phone', 'age', 'gender']);
            if (patientValidationError) return patientValidationError;

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
                return ApiResponse.notFound('Existing patient not found');
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
        const isToday = format(apptDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
        const newVisitRecord = await supabaseService.createVisit({
            clinic_id: clinicId,
            patient_id: patientRecord.id,
            doctor_id: doctorId,
            token_number: nextTokenNumber,
            date: format(apptDate, 'yyyy-MM-dd'),
            session: session,
            check_in_time: isToday ? new Date().toISOString() : null, // Only set check_in_time for today's appointments
            status: 'Scheduled'
        });

        // Add to queue if it's today's appointment
        if (isToday) {
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

        return ApiResponse.created(tokenData);
    } catch (error) {
        console.error('Error creating token:', error);
        return ApiResponse.internalServerError('Failed to create token');
    }
}
