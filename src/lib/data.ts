
import { Doctor, Patient, Appointment, QueueItem, SessionConfig, VisitRecord, AdResource } from '@/lib/types';
import { subDays, format, set, addDays } from 'date-fns';

const createVisitRecord = (day: Date, doctor: Doctor, session: "Morning" | "Afternoon" | "Evening", token: number, patient: Patient, status: VisitRecord['status']): VisitRecord => {
    const checkInHour = session === "Morning" ? 9 : session === "Afternoon" ? 14 : 18;
    
    const checkInTime = status === "Scheduled" 
      ? set(day, { hours: checkInHour + Math.floor(token / 10), minutes: (token % 10) * 5 })
      : set(day, { hours: checkInHour + Math.floor(Math.random() * 2), minutes: Math.floor(Math.random() * 60) });

    const calledTime = status === "Completed" || status === "No-show" ? set(checkInTime, { minutes: checkInTime.getMinutes() + Math.floor(Math.random() * 10) + 5 }) : undefined;
    const completedTime = status === "Completed" && calledTime ? set(calledTime, { minutes: calledTime.getMinutes() + Math.floor(Math.random() * 15) + 5 }) : undefined;

    let outOfTurnReason: string | undefined = undefined;
    if (status === "Completed" && Math.random() < 0.05) { // 5% chance
        const reasons = ["Emergency", "Doctor Requested", "Elderly/Special Needs"];
        outOfTurnReason = reasons[Math.floor(Math.random() * reasons.length)];
    }

    return {
        id: `vr_${day.getTime()}_${doctor.id}_${token}`,
        token_number: token,
        patient_id: patient.id,
        // patientName: patient.name, // This field doesn't exist in the database schema
        // phone: patient.phone.replace(/(\d{5})(\d{5})/, '$1 $2'), // This field doesn't exist in the database schema
        doctor_id: doctor.id,
        // doctorName: doctor.name, // This field doesn't exist in the database schema
        session,
        date: day.toISOString().split('T')[0],
        check_in_time: checkInTime.toISOString(),
        called_time: calledTime?.toISOString() || null,
        completed_time: completedTime?.toISOString() || null,
        status,
        fee: [500, 600, 750, 1000][Math.floor(Math.random() * 4)],
        paymentMethod: ["Cash", "UPI", "Card"][Math.floor(Math.random() * 3)] as "Cash" | "UPI" | "Card",
        outOfTurnReason,
    }
}

const generateMockDataForClinic = (clinicId: string) => {
    const doctors: Doctor[] = [];
    const patients: Patient[] = [];
    const visitRecords: VisitRecord[] = [];
    const queue: QueueItem[] = [];

    if (clinicId === 'curaflow-central') {
        doctors.push(
            {
                id: 'doc1',
                name: 'Dr. Ramesh Sharma',
                avatar: 'https://picsum.photos/seed/doc1/100/100',
                specialty: 'Cardiology',
                phone: '9876543210',
                status: 'Available',
                sessions: [ { name: 'Morning', limit: 20 } ],
                clinic_id: clinicId,
                created_at: new Date().toISOString()
            },
            {
                id: 'doc2',
                name: 'Dr. Priya Patel',
                avatar: 'https://picsum.photos/seed/doc2/100/100',
                specialty: 'General Medicine',
                phone: '9876512345',
                status: 'Available',
                sessions: [ { name: 'Morning', limit: 25 }, { name: 'Afternoon', limit: 15 } ],
                clinic_id: clinicId,
                created_at: new Date().toISOString()
            },
            {
                id: 'doc3',
                name: 'Dr. Arjun Gupta',
                avatar: 'https://picsum.photos/seed/doc3/100/100',
                specialty: 'Pediatrics',
                phone: '9876567890',
                status: 'On Leave',
                sessions: [ { name: 'Morning', limit: 20 }, { name: 'Evening', limit: 15 } ],
                clinic_id: clinicId,
                created_at: new Date().toISOString()
            }
        );
        patients.push(
            { id: 'pat1', familyId: 'fam1', name: 'Ramesh Kumar', phone: '9876543210', age: 45, gender: 'Male', lastVisit: new Date(subDays(new Date(), 14)).toISOString(), totalVisits: 4, },
            { id: 'pat2', familyId: 'fam1', name: 'Sunita Kumar', phone: '9876543210', age: 42, gender: 'Female', lastVisit: new Date(subDays(new Date(), 30)).toISOString(), totalVisits: 2, },
            { id: 'pat3', familyId: 'fam1', name: 'Arjun Kumar', phone: '9876543210', age: 12, gender: 'Male', lastVisit: new Date(subDays(new Date(), 90)).toISOString(), totalVisits: 1, },
            { id: 'pat4', familyId: 'fam1', name: 'Priya Kumar', phone: '9876543210', age: 8, gender: 'Female', totalVisits: 0, },
            { id: 'pat5', familyId: 'fam2', name: 'John Smith', phone: '1234567890', age: 35, gender: 'Male', lastVisit: new Date(subDays(new Date(), 5)).toISOString(), totalVisits: 8, }
        );
        queue.push(
            { id: 'q1', tokenNumber: 8, patientName: 'John Smith', doctorName: 'Dr. Ramesh Sharma', checkInTime: new Date(new Date().getTime() - 15 * 60000), status: 'In-consultation', priority: 'High', appointmentId: 'vr_1' },
            { id: 'q2', tokenNumber: 9, patientName: 'Maria Garcia', doctorName: 'Dr. Ramesh Sharma', checkInTime: new Date(new Date().getTime() - 10 * 60000), status: 'Waiting', priority: 'Medium', appointmentId: 'vr_2' },
            { id: 'q3', tokenNumber: 10, patientName: 'Amit Singh', doctorName: 'Dr. Ramesh Sharma', checkInTime: new Date(new Date().getTime() - 5 * 60000), status: 'Waiting', priority: 'Medium', appointmentId: 'vr_3' },
            { id: 'q4', tokenNumber: 11, patientName: 'Anaya Reddy', doctorName: 'Dr. Ramesh Sharma', checkInTime: new Date(new Date().getTime() - 2 * 60000), status: 'Waiting', priority: 'Low', appointmentId: 'vr_4' },
            { id: 'q5', tokenNumber: 7, patientName: 'Past Patient', doctorName: 'Dr. Ramesh Sharma', checkInTime: new Date(new Date().getTime() - 60 * 60000), status: 'Completed', priority: 'Low', appointmentId: 'vr_5' },
            { id: 'q6', tokenNumber: 6, patientName: 'Skipped Patient', doctorName: 'Dr. Ramesh Sharma', checkInTime: new Date(new Date().getTime() - 60 * 60000), status: 'Skipped', priority: 'Low', appointmentId: 'vr_6' },
            { id: 'q_p1', tokenNumber: 1, patientName: 'Patient A', doctorName: 'Dr. Priya Patel', checkInTime: new Date(new Date().getTime() - 20 * 60000), status: 'Waiting', priority: 'Medium', appointmentId: 'vr_p1' }
        );
    } else if (clinicId === 'sunrise-medical') {
        doctors.push(
            { id: 'doc4', name: 'Dr. Aanya Singh', avatar: 'https://picsum.photos/seed/doc4/100/100', specialty: 'Dermatology', phone: '8887776665', status: 'Available', sessions: [ { name: 'Morning', limit: 15 }, { name: 'Afternoon', limit: 10 } ], clinic_id: clinicId, created_at: new Date().toISOString() },
            { id: 'doc5', name: 'Dr. Vikram Rao', avatar: 'https://picsum.photos/seed/doc5/100/100', specialty: 'Neurology', phone: '8887776664', status: 'Unavailable', sessions: [ { name: 'Afternoon', limit: 12 } ], clinic_id: clinicId, created_at: new Date().toISOString() }
        );
        patients.push(
            { id: 'pat6', familyId: 'fam3', name: 'Sanjay Gupta', phone: '5554443332', age: 50, gender: 'Male', lastVisit: new Date(subDays(new Date(), 20)).toISOString(), totalVisits: 3, },
            { id: 'pat7', familyId: 'fam4', name: 'Anjali Mehta', phone: '5554443331', age: 28, gender: 'Female', lastVisit: new Date(subDays(new Date(), 60)).toISOString(), totalVisits: 1, }
        );
        queue.push(
            { id: 'q7', tokenNumber: 1, patientName: 'Sanjay Gupta', doctorName: 'Dr. Aanya Singh', checkInTime: new Date(new Date().getTime() - 8 * 60000), status: 'In-consultation', priority: 'Medium', appointmentId: 'vr_sm_1' },
            { id: 'q8', tokenNumber: 2, patientName: 'Anjali Mehta', doctorName: 'Dr. Aanya Singh', checkInTime: new Date(new Date().getTime() - 2 * 60000), status: 'Waiting', priority: 'Medium', appointmentId: 'vr_sm_2' },
            { id: 'q9', tokenNumber: 3, patientName: 'Vikram Singh', doctorName: 'Dr. Aanya Singh', checkInTime: new Date(new Date().getTime() - 1 * 60000), status: 'Waiting', priority: 'Medium', appointmentId: 'vr_sm_3' }
        );
    }

    const today = new Date();
    for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
        const date = subDays(today, dayOffset);
        let tokenCount = 1;
        for (let i = 0; i < Math.floor(Math.random() * 15) + 8; i++) {
             if (doctors.length > 0 && patients.length > 0) {
                const docIndex = Math.floor(Math.random() * doctors.length);
                const patIndex = Math.floor(Math.random() * patients.length);
                const status = Math.random() > 0.1 ? "Completed" : "No-show";
                const session: "Morning" | "Afternoon" | "Evening" = ['Morning', 'Afternoon', 'Evening'][Math.floor(Math.random() * 3)] as any;
                visitRecords.push(createVisitRecord(date, doctors[docIndex], session, tokenCount++, patients[patIndex], status));
             }
        }
    }

    return { doctors, patients, queue, visitRecords };
}

const mockDb: Record<string, {
    doctors: Doctor[],
    patients: Patient[],
    queue: QueueItem[],
    visitRecords: VisitRecord[],
    departments: string[],
    sessions: SessionConfig[],
    hospitalInfo: { name: string; address: string; phone: string; email: string; },
    adResources: AdResource[]
}> = {
    "curaflow-central": {
        ...generateMockDataForClinic('curaflow-central'),
        departments: ["Cardiology", "Pediatrics", "Dermatology", "Neurology", "General Medicine"],
        sessions: [
            { name: 'Morning', start: '09:00', end: '13:00' },
            { name: 'Afternoon', start: '14:00', end: '18:00' },
            { name: 'Evening', start: '18:00', end: '21:00' },
        ],
        hospitalInfo: {
            name: 'CuraFlow Central Hospital',
            address: '123 Health St, Wellness City, 12345',
            phone: '(123) 456-7890',
            email: 'contact@curaflow.com',
        },
        adResources: [
            { id: 'res1', title: 'Clinic Opening Hours', type: 'image', url: 'https://picsum.photos/seed/ad1/1920/1080', duration: 30, },
            { id: 'res2', title: 'Hand Hygiene Video', type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4', duration: 10, },
            { id: 'res3', title: 'Specialist Doctor Announcement', type: 'image', url: 'https://picsum.photos/seed/ad2/1920/1080', duration: 30, },
        ]
    },
    "sunrise-medical": {
        ...generateMockDataForClinic('sunrise-medical'),
        departments: ["Dermatology", "Neurology", "Orthopedics"],
        sessions: [
            { name: 'Morning', start: '08:30', end: '12:30' },
            { name: 'Afternoon', start: '13:30', end: '17:30' },
        ],
        hospitalInfo: {
            name: 'Sunrise Medical Clinic',
            address: '456 Wellness Ave, Sunnyside, 54321',
            phone: '(987) 654-3210',
            email: 'info@sunrisemedical.com',
        },
        adResources: [
             { id: 'res4', title: 'Healthy Living Tips', type: 'image', url: 'https://picsum.photos/seed/ad3/1920/1080', duration: 25, },
        ]
    }
}

// Function to safely access clinic data
export const getClinicData = (clinicId: string) => {
    if (mockDb[clinicId]) {
        return mockDb[clinicId];
    }
    // Fallback to a default or throw an error
    console.warn(`No mock data found for clinicId: ${clinicId}. Falling back to default.`);
    return mockDb['curaflow-central']; 
};
