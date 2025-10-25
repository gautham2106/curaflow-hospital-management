
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
  UserX
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

const getStatusBadge = (status: VisitRecord['status']) => {
  switch (status) {
    case 'Completed':
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">✅ Completed</Badge>;
    case 'No-show':
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">❌ No-show</Badge>;
    case 'Cancelled':
      return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">🚫 Cancelled</Badge>;
    case 'Scheduled':
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">🗓️ Scheduled</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
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
          checkInTime: new Date(r.check_in_time), 
          calledTime: r.called_time ? new Date(r.called_time) : undefined, 
          completedTime: r.completed_time ? new Date(r.completed_time) : undefined,
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
          checkInTime: new Date(r.check_in_time), 
          calledTime: r.called_time ? new Date(r.called_time) : undefined, 
          completedTime: r.completed_time ? new Date(r.completed_time) : undefined,
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
          checkInTime: new Date(r.check_in_time), 
          calledTime: r.called_time ? new Date(r.called_time) : undefined, 
          completedTime: r.completed_time ? new Date(r.completed_time) : undefined,
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
      records = records.filter((r) => r.status === filterStatus);
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
    const tableData = filteredAndSortedRecords.map(record => [
        record.token_number,
        record.check_in_time ? format(record.check_in_time, 'h:mm a') : 'N/A',
        (record as any).patient_name || 'N/A',
        (record as any).doctor_name || 'N/A',
        record.session,
        record.status,
    ]);

    doc.setFontSize(18);
    doc.text(`Visit Register - ${format(selectedDate, 'PPP')}`, 14, 22);
    
    autoTable(doc, {
        head: [['Token', 'Time', 'Patient', 'Doctor', 'Session', 'Status']],
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


  const RenderRow = ({ record }: { record: VisitRecord }) => (
     <>
        <TableRow 
            key={record.id} 
            onClick={() => setExpandedRow(expandedRow === record.id ? null : record.id)}
            className="cursor-pointer hover:bg-muted/50"
        >
            <TableCell className="font-mono">{record.token_number}</TableCell>
            <TableCell>{record.check_in_time ? format(record.check_in_time, 'h:mm a') : 'N/A'}</TableCell>
            <TableCell>
                <div className="font-medium">{record.patients?.name || 'N/A'}</div>
                <div className="text-xs text-muted-foreground">{record.patients?.phone || 'N/A'}</div>
            </TableCell>
            <TableCell>
                <div className="font-medium">{record.doctors?.name || 'N/A'}</div>
                <div className="text-xs text-muted-foreground">{record.doctors?.specialty || 'N/A'}</div>
            </TableCell>
            <TableCell>{record.session}</TableCell>
            <TableCell>{getStatusBadge(record.status)}</TableCell>
        </TableRow>
        {expandedRow === record.id && (
            <TableRow className="bg-muted/30 hover:bg-muted/40">
                <TableCell colSpan={6} className="p-0">
                    <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4 text-sm">
                        <div className="space-y-1">
                           <h4 className="font-semibold mb-2">Visit Details</h4>
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
  )

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
            title="No-Shows"
            value={dailyRecords.filter(v => v.status === 'No-show').length}
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
                            <SelectItem value="Scheduled">Scheduled</SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                            <SelectItem value="No-show">No-show</SelectItem>
                            <SelectItem value="Cancelled">Cancelled</SelectItem>
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
                              <TableHead onClick={() => handleSort('check_in_time')} className="w-[120px] cursor-pointer">Time</TableHead>
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
        <p className="font-bold">{(record as any).patient_name || 'N/A'}</p>
        <p className="text-sm text-muted-foreground">{(record as any).doctor_name || 'N/A'}</p>
                                              {getStatusBadge(record.status)}
                                          </div>
                                          <div className="text-right">
                                              <p className="font-mono text-lg font-semibold text-primary">#{record.token_number}</p>
                                              <p className="text-xs text-muted-foreground">{record.check_in_time ? format(record.check_in_time, 'h:mm a') : 'N/A'}</p>
                                          </div>
                                      </div>
                                  </AccordionTrigger>
                                  <AccordionContent className="px-4">
                                      <div className="space-y-3 text-sm text-muted-foreground border-t pt-4">
                                        <p><strong>Phone:</strong> {(record as any).patient_phone || 'N/A'}</p>
                                        <p><strong>Session:</strong> {record.session}</p>
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
    </div>
  );
}
