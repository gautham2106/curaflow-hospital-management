
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { Patient, Doctor, SessionConfig, VisitRecord } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Search, UserPlus, Users, History, Calendar as CalendarIcon, Loader2, Edit, Save, X } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { PrintToken, TokenData } from '@/components/token/print-token';
import { EnhancedPrintPreviewDialog } from '@/components/token/enhanced-print-preview-dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useFetch } from '@/hooks/use-api';
import { useCrossPageSync } from '@/hooks/use-cross-page-sync';


const PatientHistory = ({ patient, onBack }: { patient: Patient; onBack: () => void }) => {
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
                const response = await get(`/api/visits?patientId=${patient.id}`);
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
    }, [patient.id, toast, get, clinicId]);


    return (
      <Card className="max-w-2xl mx-auto">
          <CardHeader>
              <CardTitle>{patient.name} - Visit History</CardTitle>
              <CardDescription>Total Visits: {patient.totalVisits}</CardDescription>
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
                                  <p className="font-semibold">{format(parseISO(visit.date as any), 'PPP')}</p>
                                  <p className="text-sm text-muted-foreground">{(visit as any).doctor_name || 'N/A'}</p>
                              </div>
                              <Badge variant={visit.status === 'Completed' ? 'secondary' : 'destructive'}>{visit.status}</Badge>
                          </div>
                      ))}
                  </div>
              ) : (
                  <p className="text-center text-muted-foreground py-8">No visit history found for this patient.</p>
              )}
              <Button className="mt-6 w-full" onClick={onBack}>Back to Token Generation</Button>
          </CardContent>
      </Card>
    );
};


export default function GenerateTokenPage() {
  const [phone, setPhone] = useState('');
  const [foundPatients, setFoundPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isNewPatient, setIsNewPatient] = useState(false);
  
  const [newPatientName, setNewPatientName] = useState('');
  const [newPatientAge, setNewPatientAge] = useState('');
  const [newPatientGender, setNewPatientGender] = useState<'Male' | 'Female' | 'Other' | ''>('');
  
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [editPatientData, setEditPatientData] = useState<Partial<Patient>>({});


  const [date, setDate] = useState<Date | undefined>(new Date());
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [sessionConfigs, setSessionConfigs] = useState<SessionConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedDoctorId, setSelectedDoctorId] = useState<string | undefined>();
  const [selectedSession, setSelectedSession] = useState<string | undefined>();

  const [showHistory, setShowHistory] = useState(false);
  
  const [tokenToPrint, setTokenToPrint] = useState<TokenData | null>(null);
  const [isPreviewOpen, setPreviewOpen] = useState(false);

  const { toast } = useToast();
  const { get, post, put } = useFetch();
  const [clinicId, setClinicId] = useState<string | null>(null);

  useEffect(() => {
    const id = sessionStorage.getItem('clinicId');
    if (id) {
      setClinicId(id);
    }
  }, []);

  // Use cross-page sync hook
  const { triggerUpdate } = useCrossPageSync();
  
  useEffect(() => {
    if (!clinicId) return;
    
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const [doctorsRes, sessionsRes] = await Promise.all([
          get('/api/doctors'),
          get('/api/sessions')
        ]);
        if (!doctorsRes || !sessionsRes) return;

        const [doctorsData, sessionsData] = await Promise.all([
          doctorsRes.json(),
          sessionsRes.json()
        ]);
        setDoctors(doctorsData);
        setSessionConfigs(sessionsData);
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to load doctors and sessions.', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, [get, toast, clinicId]);
  
  const resetAllState = () => {
    setPhone('');
    setFoundPatients([]);
    setSelectedPatient(null);
    setIsNewPatient(false);
    setNewPatientName('');
    setNewPatientAge('');
    setNewPatientGender('');
    setDate(new Date());
    setSelectedDoctorId(undefined);
    setSelectedSession(undefined);
    setShowHistory(false);
    setTokenToPrint(null);
    setPreviewOpen(false);
    setEditingPatient(null);
    setEditPatientData({});
  };

  const handlePhoneSearch = async () => {
    if (phone.length < 3) {
      setFoundPatients([]);
      setSelectedPatient(null);
      setIsNewPatient(false);
      return;
    }
    if (!clinicId) return;

    try {
        const response = await get('/api/patients/search', { phone });
        if (!response) return;
        const results = await response.json();
        setFoundPatients(results);
        if (results.length === 0) {
          setIsNewPatient(true);
          setSelectedPatient(null);
        } else {
          setIsNewPatient(false);
        }
    } catch (error) {
        toast({ title: 'Error', description: 'Failed to search for patients.', variant: 'destructive' });
    }
  };

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setNewPatientName(patient.name);
    setNewPatientAge(String(patient.age));
    setNewPatientGender(patient.gender);
    setIsNewPatient(false);
    setShowHistory(false);
    setEditingPatient(null);
  };
  
  const startEditing = (patient: Patient) => {
    setEditingPatient(patient);
    setEditPatientData({ name: patient.name, age: patient.age, gender: patient.gender, phone: patient.phone });
    setSelectedPatient(null);
  };

  const cancelEditing = () => {
    setEditingPatient(null);
    setEditPatientData({});
  };

  const handleSaveEdit = async () => {
    if (!editingPatient || !clinicId) return;
    try {
        const response = await put(`/api/patients/${editingPatient.id}`, editPatientData);
        if (!response) return;
        const updatedPatient = await response.json();
        setFoundPatients(found => found.map(p => p.id === updatedPatient.id ? updatedPatient : p));
        toast({ title: 'Patient Updated', description: `${updatedPatient.name}'s details have been updated.` });
        cancelEditing();
    } catch (error) {
        toast({ title: 'Error', description: 'Failed to update patient details.', variant: 'destructive' });
    }
  };


  const handleCreateNewFamilyMember = () => {
    setIsNewPatient(true);
    setSelectedPatient(null);
    setEditingPatient(null);
    setNewPatientName('');
    setNewPatientAge('');
    setNewPatientGender('');
  };

  const handleGenerateToken = async () => {
    if (!clinicId) return;

    const patientName = selectedPatient?.name || newPatientName;
    const doctor = doctors.find(d => d.id === selectedDoctorId);

    if (!patientName) {
        toast({ title: "Patient name is required", variant: "destructive" });
        return;
    }
    if ((isNewPatient || !selectedPatient) && (!newPatientAge || !newPatientGender)) {
        toast({ title: "Age and gender are required for new patients", variant: "destructive" });
        return;
    }
    if (!date) {
        toast({ title: "Please select an appointment date", variant: "destructive" });
        return;
    }
    if (!doctor || !selectedSession) {
        toast({ title: "Please select a doctor and session", variant: "destructive" });
        return;
    }
    
    const requestBody = {
      isNewPatient,
      patient: selectedPatient ? selectedPatient : {
          name: newPatientName,
          age: Number(newPatientAge),
          gender: newPatientGender,
          phone,
      },
      appointment: {
          date: format(date, 'yyyy-MM-dd'),
          doctorId: selectedDoctorId,
          session: selectedSession,
      }
    };
    
    try {
        const response = await post('/api/tokens', requestBody);
        if (!response || !response.ok) {
            const errorData = await response?.json();
            throw new Error(errorData.error || 'Failed to generate token.');
        }

        const tokenData: TokenData = await response.json();

        // Trigger cross-page updates for new token
        triggerUpdate('token');

        setTokenToPrint(tokenData);
        setPreviewOpen(true);
    } catch (error: any) {
        toast({ title: 'Token Generation Failed', description: error.message, variant: 'destructive' });
    }
  };
  

  if (selectedPatient && showHistory) {
      return <PatientHistory patient={selectedPatient} onBack={() => setShowHistory(false)} />;
  }
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>
  }

  return (
    <>
      <div id="print-area" className="print-only">
        {tokenToPrint && <PrintToken tokenData={tokenToPrint} sessionConfigs={sessionConfigs} />}
      </div>
      {tokenToPrint && (
        <EnhancedPrintPreviewDialog
          open={isPreviewOpen}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              resetAllState();
            }
            setPreviewOpen(isOpen);
          }}
          tokenData={tokenToPrint}
          sessionConfigs={sessionConfigs}
        />
      )}
      <div className="space-y-6 no-print">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Generate Token</CardTitle>
            <CardDescription>Search for a patient by phone number or register a new one.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="flex gap-2">
                <Input
                  id="phone"
                  placeholder="Enter patient's phone number..."
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  onKeyUp={(e) => e.key === 'Enter' && handlePhoneSearch()}
                />
                <Button onClick={handlePhoneSearch}><Search className="mr-2 h-4 w-4" /> Search</Button>
              </div>
            </div>
            
            {editingPatient && (
                 <Card className="bg-yellow-50/50 border-yellow-200 p-4">
                     <h3 className="font-semibold mb-4 text-yellow-800">Editing: {editingPatient.name}</h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Patient Name</Label>
                            <Input id="edit-name" value={editPatientData.name || ''} onChange={e => setEditPatientData({...editPatientData, name: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-age">Age</Label>
                                <Input id="edit-age" type="number" value={editPatientData.age || ''} onChange={e => setEditPatientData({...editPatientData, age: Number(e.target.value) })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Gender</Label>
                                <RadioGroup className="flex items-center space-x-4 pt-2" value={editPatientData.gender} onValueChange={v => setEditPatientData({...editPatientData, gender: v as any})}>
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="Male" id="edit-male" /><Label htmlFor="edit-male">Male</Label></div>
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="Female" id="edit-female" /><Label htmlFor="edit-female">Female</Label></div>
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="Other" id="edit-other" /><Label htmlFor="edit-other">Other</Label></div>
                                </RadioGroup>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-phone">Phone</Label>
                            <Input id="edit-phone" value={editPatientData.phone || ''} onChange={e => setEditPatientData({...editPatientData, phone: e.target.value })} />
                        </div>
                         <div className="flex justify-end gap-2 pt-2">
                            <Button variant="ghost" onClick={cancelEditing}><X className="mr-2 h-4 w-4" /> Cancel</Button>
                            <Button onClick={handleSaveEdit}><Save className="mr-2 h-4 w-4" /> Save</Button>
                        </div>
                    </div>
                </Card>
            )}

            {foundPatients.length > 0 && !selectedPatient && !editingPatient && (
              <Card className="bg-muted/50 p-4">
                  <h3 className="font-semibold mb-2 flex items-center gap-2"><Users /> Found {foundPatients.length} person/people with this number:</h3>
                  <RadioGroup onValueChange={(patientId) => handleSelectPatient(foundPatients.find(p => p.id === patientId)!)}>
                      {foundPatients.map(p => (
                          <div key={p.id} className="flex items-center gap-2 p-2 rounded-md hover:bg-background">
                              <RadioGroupItem value={p.id} id={p.id} />
                              <Label htmlFor={p.id} className="flex-1 cursor-pointer">
                                  <div>{p.name} <span className="text-xs text-muted-foreground">({p.gender}, {p.age}y)</span></div>
                                  <div className="text-xs text-muted-foreground">
                                      Last visit: {p.lastVisit ? format(parseISO(p.lastVisit), 'PP') : 'N/A'}
                                  </div>
                              </Label>
                               <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); startEditing(p); }}><Edit className="mr-2 h-4 w-4"/>Edit</Button>
                          </div>
                      ))}
                  </RadioGroup>
                   <Button variant="link" className="mt-2" onClick={handleCreateNewFamilyMember}><UserPlus className="mr-2 h-4 w-4"/> Add New Family Member</Button>
              </Card>
            )}

            {isNewPatient && !selectedPatient && !editingPatient && (
               <Card className="bg-accent/20 border-accent p-4">
                  <h3 className="font-semibold mb-4 text-accent-foreground/80">New Patient Details</h3>
                  <div className="space-y-4">
                      <div className="space-y-2">
                          <Label htmlFor="new-name">Patient Name</Label>
                          <Input 
                              id="new-name" 
                              placeholder="Enter patient's full name"
                              value={newPatientName}
                              onChange={(e) => setNewPatientName(e.target.value)}
                          />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                              <Label htmlFor="new-age">Age</Label>
                              <Input 
                                  id="new-age" 
                                  type="number"
                                  placeholder="e.g., 34"
                                  value={newPatientAge}
                                  onChange={(e) => setNewPatientAge(e.target.value)}
                              />
                          </div>
                          <div className="space-y-2">
                              <Label>Gender</Label>
                              <RadioGroup 
                                  className="flex items-center space-x-4 pt-2"
                                  value={newPatientGender}
                                  onValueChange={(value) => setNewPatientGender(value as any)}
                              >
                                  <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="Male" id="male" />
                                      <Label htmlFor="male">Male</Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="Female" id="female" />
                                      <Label htmlFor="female">Female</Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="Other" id="other" />
                                      <Label htmlFor="other">Other</Label>
                                  </div>
                              </RadioGroup>
                          </div>
                      </div>
                  </div>
              </Card>
            )}

            {selectedPatient && (
               <Card className="bg-primary/10 border-primary p-4">
                  <div className="flex justify-between items-start">
                      <div>
                          <h3 className="font-semibold mb-1 text-primary-foreground/90">⚡ Selected: {selectedPatient.name}</h3>
                          <p className="text-sm text-muted-foreground">Last visit: {selectedPatient.lastVisit ? format(parseISO(selectedPatient.lastVisit), 'PPP') : 'N/A'} | Total visits: {selectedPatient.totalVisits}</p>
                      </div>
                      <div className="flex gap-2">
                           <Button variant="ghost" size="sm" onClick={() => setShowHistory(true)}><History className="mr-2 h-4 w-4"/>See History</Button>
                          <Button variant="link" size="sm" onClick={() => { setSelectedPatient(null); setNewPatientName(''); setNewPatientAge(''); setNewPatientGender(''); }}>Change</Button>
                      </div>
                  </div>
              </Card>
            )}

            {(selectedPatient || (isNewPatient && newPatientName)) && (
              <div className="space-y-4 pt-4 border-t">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <Label>Appointment Date</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !date && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "PPP") : <span>Pick a date</span>}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                      </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                          <Label htmlFor="doctor">Doctor</Label>
                          <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
                              <SelectTrigger id="doctor">
                              <SelectValue placeholder="Select a doctor" />
                              </SelectTrigger>
                              <SelectContent>
                              {doctors.map(doc => (
                                  <SelectItem key={doc.id} value={doc.id}>{doc.name} - {doc.specialty}</SelectItem>
                              ))}
                              </SelectContent>
                          </Select>
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="session">Session</Label>
                          <Select value={selectedSession} onValueChange={setSelectedSession}>
                              <SelectTrigger id="session">
                                  <SelectValue placeholder="Select a session" />
                              </SelectTrigger>
                              <SelectContent>
                                {sessionConfigs.map(option => (
                                  <SelectItem key={option.name} value={option.name}>{option.name} ({option.start} - {option.end})</SelectItem>
                                ))}
                              </SelectContent>
                          </Select>
                      </div>
                  </div>
                  <div className="flex justify-end pt-4">
                      <Button size="lg" onClick={handleGenerateToken}>Generate Token</Button>
                  </div>
              </div>
            )}

          </CardContent>
        </Card>
      </div>
    </>
  );
}
