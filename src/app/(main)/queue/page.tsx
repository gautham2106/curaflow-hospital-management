
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QueueItem, Doctor, SessionConfig } from "@/lib/types";
import { useState, useMemo, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Play, SkipForward, RotateCcw, UserCheck, Power, Loader2 } from "lucide-react";
import { ReasonDialog } from "@/components/queue/reason-dialog";
import { useFetch } from "@/hooks/use-api";

const getStatusBadge = (status: QueueItem['status']) => {
    switch (status) {
        case 'In-consultation':
            return <Badge className="bg-green-500 hover:bg-green-600 text-white shadow-md"><UserCheck className="w-3 h-3 mr-1" /> NOW</Badge>;
        case 'Waiting':
            return <Badge variant="outline" className="text-amber-600 border-amber-500 shadow-sm">⏳ WAITING</Badge>;
        case 'Skipped':
             return <Badge variant="destructive" className="bg-yellow-500 text-white shadow-sm">⚠️ SKIPPED</Badge>;
        case 'Completed':
            return <Badge variant="secondary" className="shadow-sm">✓ Completed</Badge>;
        case 'Cancelled':
            return <Badge variant="destructive" className="shadow-sm">✗ Cancelled</Badge>;
        default:
            return <Badge variant="secondary" className="shadow-sm">{status}</Badge>;
    }
}


function QueueTableRow({ item, onCall, onSkip, onRejoin, isNextInLine, isNowServing }: { item: QueueItem; onCall: (id: string) => void; onSkip: (id: string) => void; onRejoin: (id: string) => void; isNextInLine: boolean, isNowServing: boolean }) {
  
  return (
    <TableRow className={cn(isNowServing && 'bg-green-50 font-bold', isNextInLine && 'bg-blue-50')}>
      <TableCell className="font-mono text-base font-bold w-[80px]">#{item.tokenNumber}</TableCell>
      <TableCell className="font-medium">{item.patientName}</TableCell>
      <TableCell className="w-[150px]">{getStatusBadge(item.status)}</TableCell>
      <TableCell className="text-right w-[120px]">
        {item.status === 'Waiting' && (
          <Button size="sm" onClick={() => onCall(item.id)}>
            <Play className="mr-2 h-4 w-4" /> Call
          </Button>
        )}
        {item.status === 'In-consultation' && (
          <Button size="sm" variant="destructive" onClick={() => onSkip(item.id)}>
            <SkipForward className="mr-2 h-4 w-4" /> Skip
          </Button>
        )}
        {item.status === 'Skipped' && (
          <Button size="sm" variant="outline" onClick={() => onRejoin(item.id)}>
            <RotateCcw className="mr-2 h-4 w-4" /> Rejoin
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
}


function QueueCard({ item, onCall, onSkip, onRejoin }: { item: QueueItem; onCall: (id: string) => void; onSkip: (id: string) => void; onRejoin: (id: string) => void; }) {

    return (
        <div className={cn('bg-card p-3 rounded-lg border flex gap-3 items-center', item.status === 'In-consultation' && 'bg-green-50 font-bold border-green-200')}>
            <div className="flex-1 space-y-1">
                <div className="flex justify-between items-center">
                    <p className="font-bold">{item.patientName}</p>
                    <p className="font-mono text-lg font-semibold text-primary">#{item.tokenNumber}</p>
                </div>
                <div className="flex justify-between items-center pt-2">
                    {getStatusBadge(item.status)}
                    <div className="text-right">
                        {item.status === 'Waiting' && (
                          <Button size="sm" onClick={() => onCall(item.id)}>
                            <Play className="mr-2 h-4 w-4" /> Call
                          </Button>
                        )}
                        {item.status === 'In-consultation' && (
                          <Button size="sm" variant="destructive" onClick={() => onSkip(item.id)}>
                            <SkipForward className="mr-2 h-4 w-4" /> Skip
                          </Button>
                        )}
                        {item.status === 'Skipped' && (
                          <Button size="sm" variant="outline" onClick={() => onRejoin(item.id)}>
                            <RotateCcw className="mr-2 h-4 w-4" /> Rejoin
                          </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function getCurrentSession(configs: SessionConfig[]): SessionConfig | null {
    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes();

    for (const session of configs) {
        const [startHour, startMinute] = session.start.split(':').map(Number);
        const [endHour, endMinute] = session.end.split(':').map(Number);
        const startTime = startHour * 100 + startMinute;
        const endTime = endHour * 100 + endMinute;

        if (currentTime >= startTime && currentTime < endTime) {
            return session;
        }
    }
    return null;
}


export default function LiveQueuePage() {
    const [queue, setQueue] = useState<QueueItem[]>([]);
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [sessionConfigs, setSessionConfigs] = useState<SessionConfig[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    const [selectedDoctorId, setSelectedDoctorId] = useState<string | undefined>();
    const [currentSession, setCurrentSession] = useState<SessionConfig | null>(null);

    const [isReasonDialogOpen, setReasonDialogOpen] = useState(false);
    const [patientToCall, setPatientToCall] = useState<string | null>(null);
    
    const { get, post } = useFetch();
    const [clinicId, setClinicId] = useState<string | null>(null);

    useEffect(() => {
        setClinicId(sessionStorage.getItem('clinicId'));
    }, []);


    useEffect(() => {
        if (!clinicId) return;

        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [queueRes, doctorsRes, sessionsRes] = await Promise.all([
                    get('/api/queue'), 
                    get('/api/doctors?status=Available'),
                    get('/api/sessions')
                ]);
                if (!queueRes || !doctorsRes || !sessionsRes) return;
                
                const [queueData, doctorsData, sessionsData] = await Promise.all([
                    queueRes.json(), 
                    doctorsRes.json(),
                    sessionsRes.json()
                ]);
                
                setQueue(queueData.map((q: any) => ({
                    ...q, 
                    checkInTime: new Date(q.check_in_time),
                    patientName: q.patient_name,
                    doctorName: q.doctor_name,
                    tokenNumber: q.token_number,
                    session: q.session,
                    appointmentId: q.appointment_id
                })));
                setDoctors(doctorsData);
                setSessionConfigs(sessionsData);
                setCurrentSession(getCurrentSession(sessionsData));
                
                if (doctorsData.length > 0) {
                    setSelectedDoctorId(doctorsData[0].id)
                }

            } catch (error) {
                toast({ title: 'Error', description: 'Failed to load queue data.', variant: 'destructive' });
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [toast, get, clinicId]);
    
    const selectedDoctor = doctors.find(d => d.id === selectedDoctorId);

    const doctorQueue = useMemo(() => {
        if (!selectedDoctor || !currentSession) return [];
        
        return [...queue]
            .filter(item => 
                item.doctorName === selectedDoctor.name && 
                item.session === currentSession.name
            )
            .sort((a, b) => {
                const statusOrder = { 'In-consultation': 1, 'Waiting': 2, 'Skipped': 3, 'Completed': 4, 'Cancelled': 5 };
                if(statusOrder[a.status] !== statusOrder[b.status]) {
                    return statusOrder[a.status] - statusOrder[b.status];
                }
                return new Date(a.checkInTime).getTime() - new Date(b.checkInTime).getTime();
            });

    }, [queue, selectedDoctor, currentSession]);

    const queueStats = useMemo(() => {
        const total = doctorQueue.length;
        const done = doctorQueue.filter(q => q.status === 'Completed').length;
        const waiting = doctorQueue.filter(q => q.status === 'Waiting').length;
        const skipped = doctorQueue.filter(q => q.status === 'Skipped').length;
        return { total, done, waiting, skipped };
    }, [doctorQueue]);


    const performCallPatient = async (queueItemId: string, reason?: string) => {
        if (!clinicId) return;
        const queueItem = queue.find(p => p.id === queueItemId);
        if (!queueItem) return;

        try {
            const response = await post('/api/queue/call', { 
                patientId: queueItem.appointmentId, // Use appointment_id (visit ID) for the API
                doctorId: selectedDoctorId, 
                reason 
            });
            if (!response) return;
            const updatedQueue = await response.json();

            setQueue(updatedQueue.map((q: any) => ({
                ...q, 
                checkInTime: new Date(q.check_in_time),
                patientName: q.patient_name,
                doctorName: q.doctor_name,
                tokenNumber: q.token_number,
                session: q.session,
                appointmentId: q.appointment_id
            })));
            toast({
                title: "Patient Called",
                description: `${queueItem.patientName} (Token: ${queueItem.tokenNumber}) is now being served.`,
            });
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to call patient.', variant: 'destructive' });
        }
    }

    const handleCallPatient = (patientId: string) => {
        const waitingQueue = doctorQueue.filter(item => item.status === 'Waiting');
        const isNextInLine = waitingQueue.length > 0 && waitingQueue[0].id === patientId;
        const isAnyPatientInConsultation = doctorQueue.some(p => p.status === 'In-consultation');

        if (waitingQueue.length > 0 && !isNextInLine && isAnyPatientInConsultation) {
            setPatientToCall(patientId);
            setReasonDialogOpen(true);
        } else {
            performCallPatient(patientId);
        }
    };
    
    const handleConfirmReason = (reason: string) => {
        if (patientToCall) {
            performCallPatient(patientToCall, reason);
        }
        setPatientToCall(null);
        setReasonDialogOpen(false);
    };

    
    const handleSkipPatient = async (queueItemId: string) => {
        if (!clinicId) return;
        const queueItem = queue.find(p => p.id === queueItemId);
        if(!queueItem) return;

        try {
            const response = await post('/api/queue/skip', { patientId: queueItem.appointmentId });
            if (!response) return;
            const updatedQueue = await response.json();
            setQueue(updatedQueue.map((q: any) => ({
                ...q, 
                checkInTime: new Date(q.check_in_time),
                patientName: q.patient_name,
                doctorName: q.doctor_name,
                tokenNumber: q.token_number,
                session: q.session,
                appointmentId: q.appointment_id
            })));
            toast({
                title: 'Patient Skipped',
                description: `${queueItem.patientName} has been moved to the skipped list.`,
                variant: 'destructive'
            });
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to skip patient.', variant: 'destructive' });
        }
    }
    
    const handleRejoinQueue = async (queueItemId: string) => {
        if (!clinicId) return;
        const queueItem = queue.find(p => p.id === queueItemId);
        if(!queueItem) return;
        
        try {
            const response = await post('/api/queue/rejoin', { patientId: queueItem.appointmentId });
            if (!response) return;
            const updatedQueue = await response.json();
            setQueue(updatedQueue.map((q: any) => ({
                ...q, 
                checkInTime: new Date(q.check_in_time),
                patientName: q.patient_name,
                doctorName: q.doctor_name,
                tokenNumber: q.token_number,
                session: q.session,
                appointmentId: q.appointment_id
            })));
            toast({
                title: 'Patient Rejoined',
                description: `${queueItem.patientName} has been added to the end of the waiting list.`,
            });
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to rejoin patient.', variant: 'destructive' });
        }
    }

    const handleEndSession = async () => {
        if (!selectedDoctorId || !currentSession || !clinicId) return;
        
        try {
            const response = await post('/api/sessions/end', { doctorId: selectedDoctorId, sessionName: currentSession.name });
            if (!response) return;
            const result = await response.json();
            
            // Update queue
            setQueue(result.queue.map((q: any) => ({
                ...q, 
                checkInTime: new Date(q.check_in_time),
                patientName: q.patient_name,
                doctorName: q.doctor_name,
                tokenNumber: q.token_number,
                session: q.session,
                appointmentId: q.appointment_id
            })));

            // Display session statistics
            const stats = result.sessionStats;
            const statsMessage = `
Session Summary for ${selectedDoctor?.name}:
• Total Patients: ${stats.totalPatients}
• Completed: ${stats.completedPatients}
• No-Show: ${stats.noShowPatients}
• Skipped: ${stats.skippedPatients}
• Avg Waiting Time: ${stats.avgWaitingTime} min
• Avg Consultation Time: ${stats.avgConsultationTime} min
• Total Revenue: ₹${stats.totalRevenue}
            `.trim();

            toast({
                title: "Session Ended Successfully",
                description: statsMessage,
                duration: 8000, // Show for 8 seconds to allow reading
            });
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to end the session.', variant: 'destructive' });
        }
    };


    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-6 flex flex-col h-full">
            <ReasonDialog
                isOpen={isReasonDialogOpen}
                onOpenChange={setReasonDialogOpen}
                onSubmit={handleConfirmReason}
            />
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <CardTitle>Queue Register</CardTitle>
                            <CardDescription>
                                {selectedDoctor?.name} - {currentSession ? `${currentSession.name} Session` : 'No Active Session'}
                            </CardDescription>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                             <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
                                <SelectTrigger className="w-full sm:w-[240px]">
                                    <SelectValue placeholder="Select a doctor" />
                                </SelectTrigger>
                                <SelectContent>
                                    {doctors.map(doctor => (
                                        <SelectItem key={doctor.id} value={doctor.id}>{doctor.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                             <Button variant="destructive" onClick={handleEndSession} disabled={!currentSession}>
                                <Power className="mr-2 h-4 w-4" /> End Session
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="md:hidden p-4 space-y-3">
                        {doctorQueue.length > 0 ? doctorQueue.map((item) => (
                            <QueueCard key={item.id} item={item} onCall={handleCallPatient} onSkip={handleSkipPatient} onRejoin={handleRejoinQueue} />
                        )) : (
                            <div className="text-center py-10 text-muted-foreground">
                                <p>No active patients in the queue for this session.</p>
                            </div>
                        )}
                    </div>

                    <div className="hidden md:block overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[80px]">Token</TableHead>
                                    <TableHead>Patient Name</TableHead>
                                    <TableHead className="w-[150px]">Status</TableHead>
                                    <TableHead className="w-[120px] text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {doctorQueue.length > 0 ? doctorQueue.map((item) => (
                                     <QueueTableRow 
                                        key={item.id} 
                                        item={item} 
                                        onCall={handleCallPatient} 
                                        onSkip={handleSkipPatient} 
                                        onRejoin={handleRejoinQueue}
                                        isNextInLine={doctorQueue.filter(q => q.status === 'Waiting')[0]?.id === item.id}
                                        isNowServing={item.status === 'In-consultation'}
                                     />
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                            No active patients in the queue for this session.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
                <CardHeader className="border-t">
                    <div className="flex justify-between items-center text-sm font-medium flex-wrap gap-x-4 gap-y-1">
                        <span>Total: {queueStats.total}</span>
                        <span>Done: {queueStats.done}</span>
                        <span>Waiting: {queueStats.waiting}</span>
                        <span>Skipped: {queueStats.skipped}</span>
                    </div>
                </CardHeader>
            </Card>
        </div>
    );
}
