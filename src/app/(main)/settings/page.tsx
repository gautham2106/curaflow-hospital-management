
'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Trash2, Loader2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { AddDepartmentDialog } from "@/components/settings/add-department-dialog";
import { SessionConfig } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useFetch } from "@/hooks/use-api";

type HospitalInfo = {
  name: string;
  address: string;
  phone: string;
  email: string;
};

export default function SettingsPage() {
  const [hospitalInfo, setHospitalInfo] = useState<HospitalInfo | null>(null);
  const [departments, setDepartments] = useState<string[]>([]);
  const [sessions, setSessions] = useState<SessionConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isEditingHospital, setIsEditingHospital] = useState(false);
  const [isAddDeptOpen, setAddDeptOpen] = useState(false);
  const [isEditingSessions, setIsEditingSessions] = useState(false);

  const { toast } = useToast();
  const { get, put, post, del } = useFetch();

  useEffect(() => {
    const fetchSettings = async () => {
      const clinicId = sessionStorage.getItem('clinicId');
      if (!clinicId) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const [infoRes, deptsRes, sessionsRes] = await Promise.all([
          get('/api/settings/hospital-info'),
          get('/api/departments'),
          get('/api/sessions')
        ]);
        if (!infoRes || !deptsRes || !sessionsRes) return;

        const [infoData, deptsData, sessionsData] = await Promise.all([
          infoRes.json(),
          deptsRes.json(),
          sessionsRes.json()
        ]);
        setHospitalInfo(infoData);
        setDepartments(deptsData);
        setSessions(sessionsData);
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to load settings.', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    }
    fetchSettings();
  }, [toast, get]);

  const handleSaveHospitalInfo = async () => {
    if (!hospitalInfo) return;
    try {
      await put('/api/settings/hospital-info', hospitalInfo);
      toast({ title: 'Success', description: 'Hospital information updated.' });
      setIsEditingHospital(false);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save hospital information.', variant: 'destructive' });
    }
  }

  const handleAddDepartment = async (name: string) => {
    try {
        const response = await post('/api/departments', { name });
        if (!response) return;
        const newDepartments = await response.json();
        setDepartments(newDepartments);
        setAddDeptOpen(false);
        toast({ title: 'Department Added', description: `"${name}" has been added.` });
    } catch(error) {
        toast({ title: 'Error', description: 'Failed to add department.', variant: 'destructive' });
    }
  };
  
  const handleRemoveDepartment = async (deptToRemove: string) => {
    const originalDepartments = [...departments];
    setDepartments(current => current.filter(dept => dept !== deptToRemove));
    try {
        await del('/api/departments', { body: JSON.stringify({ name: deptToRemove }) });
        toast({ title: 'Department Removed' });
    } catch (error) {
        setDepartments(originalDepartments);
        toast({ title: 'Error', description: 'Failed to remove department.', variant: 'destructive' });
    }
  }

  const handleSaveSessions = async () => {
    try {
      await put('/api/sessions', sessions);
      toast({ title: 'Success', description: 'Session times updated.' });
      setIsEditingSessions(false);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save sessions.', variant: 'destructive' });
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
    <AddDepartmentDialog isOpen={isAddDeptOpen} onOpenChange={setAddDeptOpen} onAddDepartment={handleAddDepartment} />
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your hospital configurations.</p>
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Hospital Information</CardTitle>
            <CardDescription>Manage your clinic's general information.</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => isEditingHospital ? handleSaveHospitalInfo() : setIsEditingHospital(true)}>{isEditingHospital ? 'Save' : 'Edit'}</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label>Name</Label>
            <Input id="hospital-name" value={hospitalInfo?.name || ''} onChange={e => setHospitalInfo(h => h && {...h, name: e.target.value})} readOnly={!isEditingHospital} />
          </div>
          <div className="space-y-1">
            <Label>Address</Label>
            <Textarea value={hospitalInfo?.address || ''} onChange={e => setHospitalInfo(h => h && {...h, address: e.target.value})} readOnly={!isEditingHospital} />
          </div>
          <div className="space-y-1">
            <Label>Phone</Label>
            <Input value={hospitalInfo?.phone || ''} onChange={e => setHospitalInfo(h => h && {...h, phone: e.target.value})} readOnly={!isEditingHospital} />
          </div>
          <div className="space-y-1">
            <Label>Email</Label>
            <Input value={hospitalInfo?.email || ''} onChange={e => setHospitalInfo(h => h && {...h, email: e.target.value})} readOnly={!isEditingHospital} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Departments</CardTitle>
            <CardDescription>Manage hospital departments.</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => setAddDeptOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
            {departments.map((dept) => (
              <div key={dept} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 -mx-2">
                  <span className="font-medium">{dept}</span>
                  <div className="flex items-center gap-2">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-destructive h-8 w-8"><Trash2 className="h-4 w-4" /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                              <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                  This action cannot be undone. This will permanently remove the department.
                              </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleRemoveDepartment(dept)}>Continue</AlertDialogAction>
                              </AlertDialogFooter>
                          </AlertDialogContent>
                      </AlertDialog>
                  </div>
              </div>
          ))}
        </CardContent>
      </Card>

      <Card>
          <CardHeader className="flex flex-row items-center justify-between">
              <div>
                  <CardTitle>Session Management</CardTitle>
                  <CardDescription>Define operational sessions.</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => isEditingSessions ? handleSaveSessions() : setIsEditingSessions(true)}>{isEditingSessions ? 'Save' : 'Edit'}</Button>
          </CardHeader>
          <CardContent className="space-y-4">
              {sessions.map((session, index) => (
                  <div key={session.name} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <Label className="w-full sm:w-20 font-medium">{session.name}</Label>
                      <div className="flex-1 grid grid-cols-2 gap-2">
                          <Input type="time" value={session.start} onChange={(e) => {
                            const newSessions = [...sessions];
                            newSessions[index].start = e.target.value;
                            setSessions(newSessions);
                          }} readOnly={!isEditingSessions} />
                          <Input type="time" value={session.end} onChange={(e) => {
                            const newSessions = [...sessions];
                            newSessions[index].end = e.target.value;
                            setSessions(newSessions);
                          }} readOnly={!isEditingSessions} />
                      </div>
                  </div>
              ))}
          </CardContent>
      </Card>
    </div>
    </>
  );
}
