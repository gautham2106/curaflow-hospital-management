
'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Calendar as CalendarIcon,
  Search,
  Download,
  Printer,
  BookUser,
  AlertTriangle,
  Loader2,
  Users,
  Clock,
  UserX,
  History
} from 'lucide-react';
import { addDays, subDays, format, startOfDay, isToday } from 'date-fns';
import type { VisitRecord, Doctor, SessionConfig } from '@/lib/types';
import { useDebounce } from '@/hooks/use-debounce';
import { useIsClient } from '@/hooks/use-is-client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useFetch } from '@/hooks/use-api';
import { useCrossPageSync } from '@/hooks/use-cross-page-sync';


type SortKey = keyof VisitRecord | 'patient_name' | 'doctor_name' | '';
type SortDirection = 'asc' | 'desc';

// Function to map complex statuses to simplified 3 options
const getSimplifiedStatus = (status: VisitRecord['status']): 'Scheduled' | 'Completed' | 'No Show' => {
  switch (status) {
    case 'Completed':
      return 'Completed';
    case 'No-show':
      return 'No Show';
    case 'Scheduled':
    case 'Waiting':
    case 'In-consultation':
    case 'Skipped':
    default:
      return 'Scheduled';
  }
};

const getStatusBadge = (status: VisitRecord['status']) => {
  const simplifiedStatus = getSimplifiedStatus(status);
  
  switch (simplifiedStatus) {
    case 'Completed':
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">✅ Completed</Badge>;
    case 'No Show':
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">❌ No Show</Badge>;
    case 'Scheduled':
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">🗓️ Scheduled</Badge>;
    default:
      return <Badge variant="secondary">{simplifiedStatus}</Badge>;
  }
};

function calculateWaitTime(records: VisitRecord[]) {
  const completedVisits = records.filter(r => r.status === 'Completed' && r.called_time && r.check_in_time);
  if (completedVisits.length === 0) return '0m';

  const totalWaitMinutes = completedVisits.reduce((acc, visit) => {
    const wait = (new Date(visit.called_time!).getTime() - new Date(visit.check_in_time!).getTime()) / (1000 * 60);
    return acc + wait;
  }, 0);

  const avgWait = Math.round(totalWaitMinutes / completedVisits.length);
  return `${avgWait}m`;
}

// Patient History Component
const PatientHistory = ({ patient, onBack }: { patient: any; onBack: () => void }) => {
    const [history, setHistory] = useState<VisitRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    const { get } = useFetch();
    const [clinicId, setClinicId] = useState<string | null>(null);

    useEffect(() => {
        setClinicId(sessionStorage.getItem('clinicId'));
    }, []);

    useEffect(() => {
        if (!clinicId) return;

        const fetchHistory = async () => {
            setIsLoading(true);
            try {
                const response = await get(`/api/visits?patientId=${patient.patient_id}`);
                if (!response || !response.ok) {
                    throw new Error('Failed to fetch visit history.');
                }
                const data = await response.json();
                setHistory(data.sort((a: VisitRecord, b: VisitRecord) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            } catch (error: any) {
                toast({ title: "Error", description: error.message, variant: "destructive" });
            } finally {
                setIsLoading(false);
            }
        };
        fetchHistory();
    }, [patient.patient_id, toast, get, clinicId]);

    return (
      <Card className="max-w-4xl mx-auto">
          <CardHeader>
              <CardTitle>{patient.patients?.name || 'Unknown Patient'} - Visit History</CardTitle>
              <CardDescription>Complete visit history for this patient</CardDescription>
          </CardHeader>
          <CardContent>
              {isLoading ? (
                  <div className="space-y-4">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                  </div>
              ) : history.length > 0 ? (
                  <div className="space-y-3">
                      {history.map(visit => (
                          <div key={visit.id} className="flex justify-between items-center p-3 rounded-md border bg-muted/30">
                              <div>
                                  <p className="font-semibold">{format(new Date(visit.date), 'PPP')}</p>
                                  <p className="text-sm text-muted-foreground">{visit.doctors?.name || 'N/A'} - {visit.session}</p>
                                  <p className="text-xs text-muted-foreground">Token: #{visit.token_number}</p>
                              </div>
                              <Badge variant={getSimplifiedStatus(visit.status) === 'Completed' ? 'secondary' : 'destructive'}>{getSimplifiedStatus(visit.status)}</Badge>
                          </div>
                      ))}
                  </div>
              ) : (
                  <p className="text-center text-muted-foreground py-8">No visit history found for this patient.</p>
              )}
              <Button className="mt-6 w-full" onClick={onBack}>Back to Visit Register</Button>
          </CardContent>
      </Card>
    );
};

export default function VisitRegisterPage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const isClient = useIsClient();
  const { toast } = useToast();

  const [dailyRecords, setDailyRecords] = useState<VisitRecord[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [sessionConfigs, setSessionConfigs] = useState<SessionConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [filterDoctor, setFilterDoctor] = useState('all');
  const [filterSession, setFilterSession] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const [sortKey, setSortKey] = useState<SortKey>('check_in_time');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [showPatientHistory, setShowPatientHistory] = useState(false);
  const [selectedPatientForHistory, setSelectedPatientForHistory] = useState<any>(null);

  const { get } = useFetch();
  const [clinicId, setClinicId] = useState<string | null>(null);

  useEffect(() => {
    setClinicId(sessionStorage.getItem('clinicId'));
  }, []);

  useEffect(() => {
    // Set initial date on client to avoid hydration mismatch
    setSelectedDate(startOfDay(new Date()));
  }, []);

  useEffect(() => {
    if (!clinicId) return;

    const fetchInitialData = async () => {
        try {
            const [docsRes, sessionsRes] = await Promise.all([get('/api/doctors?status=Available'), get('/api/sessions')]);
            if (!docsRes || !sessionsRes) return;

            const [docsData, sessionsData] = await Promise.all([docsRes.json(), sessionsRes.json()]);
            setDoctors(docsData);
            setSessionConfigs(sessionsData);
        } catch(e) {
            toast({ title: "Error", description: "Could not fetch doctors or session configs."});
        }
    }
    fetchInitialData();
  }, [get, toast, clinicId]);

  useEffect(() => {
    if (!selectedDate || !clinicId) return;

    const fetchVisits = async () => {
      setIsLoading(true);
      try {
        const dateString = format(selectedDate, 'yyyy-MM-dd');
        const response = await get('/api/visits', { date: dateString });
        if (!response) return;

        const data = await response.json();
        setDailyRecords(data.map((r: any) => ({ 
          ...r,
          date: new Date(r.date),
          checkInTime: r.check_in_time ? new Date(r.check_in_time) : null,
          calledTime: r.called_time ? new Date(r.called_time) : undefined,
          completedTime: r.completed_time ? new Date(r.completed_time) : undefined,
          createdAt: r.created_at ? new Date(r.created_at) : undefined,
          // Flatten nested objects
          patientName: r.patients?.name || 'Unknown',
          phone: r.patients?.phone || '',
          doctorName: r.doctors?.name || 'Unknown',
          tokenNumber: r.token_number,
          // Enhanced tracking fields
          waitingTimeMinutes: r.waiting_time_minutes || 0,
          consultationTimeMinutes: r.consultation_time_minutes || 0,
          totalTimeMinutes: r.total_time_minutes || 0,
          wasSkipped: r.was_skipped || false,
          skipReason: r.skip_reason || '',
          wasOutOfTurn: r.was_out_of_turn || false,
          outOfTurnReason: r.out_of_turn_reason || '',
          sessionEndTime: r.session_end_time ? new Date(r.session_end_time) : undefined,
          visitNotes: r.visit_notes || '',
          patientSatisfactionRating: r.patient_satisfaction_rating || null
        })));
      } catch (e) {
        toast({ title: "Error", description: "Could not fetch visit records." });
        setDailyRecords([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchVisits();
  }, [selectedDate, toast, get, clinicId]);

  // Auto-refresh visits data every 30 seconds
  useEffect(() => {
    if (!selectedDate || !clinicId) return;

    const refreshVisits = async () => {
      try {
        const dateString = format(selectedDate, 'yyyy-MM-dd');
        const response = await get('/api/visits', { date: dateString });
        if (!response) return;

        const data = await response.json();
        setDailyRecords(data.map((r: any) => ({ 
          ...r,
          date: new Date(r.date),
          checkInTime: r.check_in_time ? new Date(r.check_in_time) : null,
          calledTime: r.called_time ? new Date(r.called_time) : undefined,
          completedTime: r.completed_time ? new Date(r.completed_time) : undefined,
          createdAt: r.created_at ? new Date(r.created_at) : undefined,
          // Flatten nested objects
          patientName: r.patients?.name || 'Unknown',
          phone: r.patients?.phone || '',
          doctorName: r.doctors?.name || 'Unknown',
          tokenNumber: r.token_number,
          // Enhanced tracking fields
          waitingTimeMinutes: r.waiting_time_minutes || 0,
          consultationTimeMinutes: r.consultation_time_minutes || 0,
          totalTimeMinutes: r.total_time_minutes || 0,
          wasSkipped: r.was_skipped || false,
          skipReason: r.skip_reason || '',
          wasOutOfTurn: r.was_out_of_turn || false,
          outOfTurnReason: r.out_of_turn_reason || '',
          sessionEndTime: r.session_end_time ? new Date(r.session_end_time) : undefined,
          visitNotes: r.visit_notes || '',
          patientSatisfactionRating: r.patient_satisfaction_rating || null
        })));
      } catch (e) {
        console.error('Failed to refresh visit records:', e);
      }
    };

    const interval = setInterval(refreshVisits, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [selectedDate, get, clinicId]);

  // Use cross-page sync for immediate updates
  useCrossPageSync({
    onQueueUpdate: async () => {
      if (!selectedDate || !clinicId) return;

      try {
        const dateString = format(selectedDate, 'yyyy-MM-dd');
        const response = await get('/api/visits', { date: dateString });
        if (!response) return;

        const data = await response.json();
        setDailyRecords(data.map((r: any) => ({ 
          ...r,
          date: new Date(r.date),
          checkInTime: r.check_in_time ? new Date(r.check_in_time) : null,
          calledTime: r.called_time ? new Date(r.called_time) : undefined,
          completedTime: r.completed_time ? new Date(r.completed_time) : undefined,
          createdAt: r.created_at ? new Date(r.created_at) : undefined,
          // Flatten nested objects
          patientName: r.patients?.name || 'Unknown',
          phone: r.patients?.phone || '',
          doctorName: r.doctors?.name || 'Unknown',
          tokenNumber: r.token_number,
          // Enhanced tracking fields
          waitingTimeMinutes: r.waiting_time_minutes || 0,
          consultationTimeMinutes: r.consultation_time_minutes || 0,
          totalTimeMinutes: r.total_time_minutes || 0,
          wasSkipped: r.was_skipped || false,
          skipReason: r.skip_reason || '',
          wasOutOfTurn: r.was_out_of_turn || false,
          outOfTurnReason: r.out_of_turn_reason || '',
          sessionEndTime: r.session_end_time ? new Date(r.session_end_time) : undefined,
          visitNotes: r.visit_notes || '',
          patientSatisfactionRating: r.patient_satisfaction_rating || null
        })));
      } catch (e) {
        console.error('Failed to refresh visit records on update:', e);
      }
    }
  });

  const filteredAndSortedRecords = useMemo(() => {
    let records = [...dailyRecords];

    // Filtering
    if (filterDoctor !== 'all') {
      records = records.filter((r) => r.doctor_id === filterDoctor);
    }
    if (filterSession !== 'all') {
      records = records.filter((r) => r.session === filterSession);
    }
    if (filterStatus !== 'all') {
      records = records.filter((r) => getSimplifiedStatus(r.status) === filterStatus);
    }

    // Searching
    if (debouncedSearchQuery) {
      records = records.filter(
        (r) =>
          (r as any).patient_name?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
          String(r.token_number).toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
          (r as any).patient_phone?.replace(/\s/g, '').includes(debouncedSearchQuery.replace(/\s/g, ''))
      );
    }

    // Sorting
    if (sortKey) {
      records.sort((a, b) => {
        const aValue = a[sortKey as keyof VisitRecord];
        const bValue = b[sortKey as keyof VisitRecord];
        if (aValue && bValue && aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue && bValue && aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return records;
  }, [dailyRecords, filterDoctor, filterSession, filterStatus, debouncedSearchQuery, sortKey, sortDirection]);
  
  const handlePrint = () => {
    window.print();
  };

  const handleExportPdf = () => {
    if (!selectedDate) return;
    const doc = new jsPDF();
    const tableData = filteredAndSortedRecords.map(record => {
        const bookedAt = (record as any).createdAt;
        return [
            record.token_number,
            bookedAt ? format(bookedAt, 'MMM dd, yyyy h:mm a') : `${format(record.date, 'MMM dd, yyyy')} - ${record.session}`,
            (record as any).patient_name || 'N/A',
            (record as any).doctor_name || 'N/A',
            record.check_in_time ? format(record.check_in_time, 'h:mm a') : 'Not checked in',
            getSimplifiedStatus(record.status),
        ];
    });

    doc.setFontSize(18);
    doc.text(`Visit Register - ${format(selectedDate, 'PPP')}`, 14, 22);

    autoTable(doc, {
        head: [['Token', 'Booked Date & Time', 'Patient', 'Doctor', 'Check-in', 'Status']],
        body: tableData,
        startY: 30,
        headStyles: { fillColor: [35, 99, 156] },
        theme: 'striped'
    });

    doc.save(`Visit_Register_${format(selectedDate, 'yyyy-MM-dd')}.pdf`);
  };


  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };
  
  const StatCard = ({ title, value, description, icon: Icon, isLoading }: { title: string, value: string|number, description: string, icon: React.ElementType, isLoading: boolean }) => (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
            <>
              <div className="text-2xl font-bold">{value}</div>
              <p className="text-xs text-muted-foreground">{description}</p>
            </>
          )}
        </CardContent>
      </Card>
  );


  const RenderRow = ({ record }: { record: VisitRecord }) => {
    // Get the booking timestamp (when token was generated)
    const bookedAt = (record as any).createdAt;

    return (
     <>
        <TableRow
            key={record.id}
            onClick={() => setExpandedRow(expandedRow === record.id ? null : record.id)}
            className="cursor-pointer hover:bg-muted/50"
        >
            <TableCell className="font-mono">{record.token_number}</TableCell>
            <TableCell>
                <div className="text-sm">
                    <div className="font-medium">
                      {bookedAt ? format(bookedAt, 'MMM dd, yyyy') : format(record.date, 'MMM dd, yyyy')}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {bookedAt ? format(bookedAt, 'h:mm a') : record.session}
                    </div>
                </div>
            </TableCell>
            <TableCell>
                <div className="font-medium">{record.patients?.name || 'N/A'}</div>
                <div className="text-xs text-muted-foreground">{record.patients?.phone || 'N/A'}</div>
            </TableCell>
            <TableCell>
                <div className="font-medium">{record.doctors?.name || 'N/A'}</div>
                <div className="text-xs text-muted-foreground">{record.doctors?.specialty || 'N/A'}</div>
            </TableCell>
            <TableCell>{record.session}</TableCell>
            <TableCell>
                <div className="flex items-center gap-2">
                    {getStatusBadge(record.status)}
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPatientForHistory(record);
                            setShowPatientHistory(true);
                        }}
                        className="h-8 w-8 p-0"
                    >
                        <History className="h-4 w-4" />
                    </Button>
                </div>
            </TableCell>
        </TableRow>
        {expandedRow === record.id && (
            <TableRow className="bg-muted/30 hover:bg-muted/40">
                <TableCell colSpan={6} className="p-0">
                    <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4 text-sm">
                        <div className="space-y-1">
                           <h4 className="font-semibold mb-2">Visit Details</h4>
                            <p><strong>Booked:</strong> {bookedAt ? format(bookedAt, 'MMM dd, yyyy h:mm a') : `${format(record.date, 'MMM dd, yyyy')} - ${record.session}`}</p>
                            <p><strong>Appointment:</strong> {format(record.date, 'MMM dd, yyyy')} - {record.session}</p>
                            {record.checkInTime ? <p><strong>Checked in:</strong> {format(record.checkInTime, 'h:mm:ss a')}</p> : <p><strong>Status:</strong> Not checked in yet</p>}
                            {record.called_time ? <p><strong>Called:</strong> {format(record.called_time, 'h:mm:ss a')}</p> : null}
                            {record.completed_time ? <p><strong>Completed:</strong> {format(record.completed_time, 'h:mm:ss a')}</p> : null}
                            {record.completed_time && record.called_time ? <p><strong>Consultation:</strong> {`${Math.floor((new Date(record.completed_time).getTime() - new Date(record.called_time).getTime()) / 60000)} mins`}</p> : null}
                        </div>
                        {record.out_of_turn_reason && (
                             <div className="space-y-1 md:col-span-2">
                                <h4 className="font-semibold mb-1">Priority Details</h4>
                                <p className="text-amber-700 bg-amber-50 p-2 rounded-md border border-amber-200 flex items-start gap-2">
                                  <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                                  <span><strong>Reason:</strong> {record.out_of_turn_reason}</span>
                                </p>
                             </div>
                        )}
                    </div>
                </TableCell>
            </TableRow>
        )}
     </>
    );
  };

  if (!selectedDate) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6" id="register-page">
      <Card className="no-print">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle className="text-2xl flex items-center gap-2">
                <BookUser className="h-6 w-6"/> Patient Visit Register
            </CardTitle>
             <div className="flex items-center gap-1 border rounded-lg p-1 bg-muted/50 self-center">
                <Button variant="ghost" size="icon" onClick={() => setSelectedDate(subDays(selectedDate, 1))}><ArrowLeft className="h-4 w-4" /></Button>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-[240px] sm:w-[280px] justify-center text-center font-semibold">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(selectedDate, 'PPP')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={selectedDate} onSelect={(date) => date && setSelectedDate(startOfDay(date))} initialFocus /></PopoverContent>
                </Popover>
                <Button variant="ghost" size="sm" onClick={() => setSelectedDate(startOfDay(new Date()))} disabled={isToday(selectedDate)}>Today</Button>
                <Button variant="ghost" size="icon" onClick={() => setSelectedDate(addDays(selectedDate, 1))}><ArrowRight className="h-4 w-4" /></Button>
            </div>
          </div>
        </CardHeader>
      </Card>
      
      <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            title="Total Patients"
            value={dailyRecords.length}
            description={`For ${format(selectedDate, 'PPP')}`}
            icon={Users}
            isLoading={isLoading}
          />
          <StatCard
            title="Average Wait Time"
            value={calculateWaitTime(dailyRecords)}
            description="From check-in to call time"
            icon={Clock}
            isLoading={isLoading}
          />
           <StatCard
            title="No Shows"
            value={dailyRecords.filter(v => getSimplifiedStatus(v.status) === 'No Show').length}
            description="Booked appointments that were missed"
            icon={UserX}
            isLoading={isLoading}
          />
        </div>


      <Card>
        <CardHeader className="no-print">
            <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search name, token, phone..." className="pl-10" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                    </div>
                    <div className="flex items-center gap-2">
                        <Button className="w-full" variant="outline" onClick={handleExportPdf}><Download className="mr-2"/>PDF</Button>
                        <Button className="w-full" variant="outline" onClick={handlePrint}><Printer className="mr-2"/>Print</Button>
                        <Button className="w-full" variant="outline" onClick={() => window.location.reload()}><Clock className="mr-2"/>Refresh</Button>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <Select value={filterDoctor} onValueChange={setFilterDoctor}>
                        <SelectTrigger><SelectValue placeholder="All Doctors" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Doctors</SelectItem>
                            {doctors.map(doc => <SelectItem key={doc.id} value={doc.id}>{doc.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select value={filterSession} onValueChange={setFilterSession}>
                        <SelectTrigger><SelectValue placeholder="All Sessions" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Sessions</SelectItem>
                            {sessionConfigs.map(s => <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                     <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger><SelectValue placeholder="All Statuses" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="Scheduled">🗓️ Scheduled</SelectItem>
                            <SelectItem value="Completed">✅ Completed</SelectItem>
                            <SelectItem value="No Show">❌ No Show</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading && !selectedDate ? (
            <div className="p-4 space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block">
                  <Table>
                      <TableHeader>
                          <TableRow>
                              <TableHead onClick={() => handleSort('token_number')} className="w-[120px] cursor-pointer">Token</TableHead>
                              <TableHead onClick={() => handleSort('date')} className="w-[140px] cursor-pointer">Booked Date & Time</TableHead>
                              <TableHead onClick={() => handleSort('patient_name')} className="cursor-pointer">Patient</TableHead>
                              <TableHead onClick={() => handleSort('doctor_name')} className="cursor-pointer">Doctor</TableHead>
                              <TableHead onClick={() => handleSort('session')} className="cursor-pointer">Session</TableHead>
                              <TableHead onClick={() => handleSort('status')} className="cursor-pointer">Status</TableHead>
                          </TableRow>
                      </TableHeader>
                      <TableBody>
                          {filteredAndSortedRecords.length > 0 ? (
                              filteredAndSortedRecords.map(record => <RenderRow key={record.id} record={record} />)
                          ) : (
                              <TableRow><TableCell colSpan={6} className="h-24 text-center">No visits recorded for this day.</TableCell></TableRow>
                          )}
                      </TableBody>
                  </Table>
              </div>
              {/* Mobile Cards */}
              <div className="md:hidden p-4 space-y-3">
                  {filteredAndSortedRecords.length > 0 ? (
                      filteredAndSortedRecords.map(record => (
                          <Accordion type="single" collapsible key={record.id} value={expandedRow ?? undefined} onValueChange={id => setExpandedRow(id)}>
                              <AccordionItem value={record.id} className="border rounded-lg">
                                  <AccordionTrigger className="p-4 text-left hover:no-underline">
                                      <div className="flex-1 flex justify-between items-start">
                                          <div>
        <p className="font-bold">{(record as any).patientName || 'N/A'}</p>
        <p className="text-sm text-muted-foreground">{(record as any).doctorName || 'N/A'}</p>
                                              {getStatusBadge(record.status)}
                                          </div>
                                          <div className="text-right">
                                              <p className="font-mono text-lg font-semibold text-primary">#{record.token_number}</p>
                                              {(record as any).createdAt ? (
                                                <>
                                                  <p className="text-xs text-muted-foreground">{format((record as any).createdAt, 'MMM dd, yyyy')}</p>
                                                  <p className="text-xs text-muted-foreground">{format((record as any).createdAt, 'h:mm a')}</p>
                                                </>
                                              ) : (
                                                <>
                                                  <p className="text-xs text-muted-foreground">{format(record.date, 'MMM dd, yyyy')}</p>
                                                  <p className="text-xs text-muted-foreground">{record.session}</p>
                                                </>
                                              )}
                                          </div>
                                      </div>
                                  </AccordionTrigger>
                                  <AccordionContent className="px-4">
                                      <div className="space-y-3 text-sm text-muted-foreground border-t pt-4">
                                        <p><strong>Phone:</strong> {(record as any).phone || 'N/A'}</p>
                                        <p><strong>Session:</strong> {record.session}</p>
                                        <div className="pt-2">
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                onClick={() => {
                                                    setSelectedPatientForHistory(record);
                                                    setShowPatientHistory(true);
                                                }}
                                                className="w-full"
                                            >
                                                <History className="mr-2 h-4 w-4" />
                                                View Complete History
                                            </Button>
                                        </div>
                                        <div className="space-y-1 border-t pt-3 mt-3">
                            {record.called_time ? <p><strong>Called:</strong> {format(record.called_time, 'h:mm:ss a')}</p> : null}
                            {record.completed_time ? <p><strong>Completed:</strong> {format(record.completed_time, 'h:mm:ss a')}</p> : null}
                            {record.completed_time && record.called_time ? <p><strong>Consultation:</strong> {`${Math.floor((new Date(record.completed_time).getTime() - new Date(record.called_time).getTime()) / 60000)} mins`}</p> : null}
                                        </div>
                                        {record.out_of_turn_reason && (
                                          <p className="pt-1 text-amber-700"><strong>Priority Reason:</strong> {record.out_of_turn_reason}</p>
                                        )}
                                      </div>
                                  </AccordionContent>
                              </AccordionItem>
                          </Accordion>
                      ))
                  ) : (
                      <div className="text-center py-16 text-muted-foreground">
                          <p>No visits recorded for this day.</p>
                      </div>
                  )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Patient History Modal */}
      {showPatientHistory && selectedPatientForHistory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <PatientHistory 
              patient={selectedPatientForHistory} 
              onBack={() => {
                setShowPatientHistory(false);
                setSelectedPatientForHistory(null);
              }} 
            />
          </div>
        </div>
      )}
    </div>
  );
}
