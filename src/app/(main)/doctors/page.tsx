
'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Loader2 } from "lucide-react";
import type { Doctor } from "@/lib/types";
import { AddDoctorDialog } from "@/components/doctors/add-doctor-dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { useFetch } from "@/hooks/use-api";

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDoctorOpen, setAddDoctorOpen] = useState(false);
  const { toast } = useToast();
  const { get, post, put } = useFetch();

  useEffect(() => {
    const fetchInitialData = async () => {
      const clinicId = sessionStorage.getItem('clinicId');
      if (!clinicId) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const [doctorsRes, deptsRes] = await Promise.all([
          get('/api/doctors'),
          get('/api/departments')
        ]);
        if (!doctorsRes || !deptsRes) return;
        const [doctorsData, deptsData] = await Promise.all([
          doctorsRes.json(),
          deptsRes.json()
        ]);
        setDoctors(doctorsData);
        setDepartments(deptsData);
      } catch (error) {
        toast({ title: "Error", description: "Failed to fetch initial data.", variant: "destructive" });
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, [toast, get]);

  const handleAddDoctor = async (newDoctorData: Omit<Doctor, 'id' | 'status' | 'avatar'>) => {
    try {
      const response = await post('/api/doctors', newDoctorData);
      if (!response) return;
      const newDoctor = await response.json();
      setDoctors(currentDoctors => [newDoctor, ...currentDoctors]);
      toast({
          title: "Doctor Added",
          description: `${newDoctor.name} has been added to the system.`
      });
      setAddDoctorOpen(false);
    } catch (error) {
      toast({ title: "Error", description: "Failed to add doctor.", variant: "destructive" });
    }
  };
  
  const handleToggleAvailability = async (doctorId: string, isAvailable: boolean) => {
    const doctor = doctors.find(d => d.id === doctorId);
    if (!doctor) return;

    const previousStatus = doctor.status;
    const newStatus = isAvailable ? 'Available' : 'Unavailable';

    setDoctors(prevDoctors => prevDoctors.map(doc =>
      doc.id === doctorId ? { ...doc, status: newStatus } : doc
    ));
    
    try {
      const res = await put(`/api/doctors/${doctorId}/status`, { status: newStatus });
      if (res && !res.ok) throw new Error(await res.text());

      toast({
        title: `Doctor Status Updated`,
        description: `${doctor.name} is now ${newStatus}.`
      });
    } catch (error) {
       toast({
        title: `Error`,
        description: `Failed to update status for ${doctor.name}.`,
        variant: 'destructive'
      });
      setDoctors(prevDoctors => prevDoctors.map(doc =>
        doc.id === doctorId ? { ...doc, status: previousStatus } : doc
      ));
    }
  };

  const DoctorCardSkeleton = () => (
    <div className="p-4 border rounded-lg space-y-4 bg-muted/20">
      <div className="flex items-center gap-4">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="flex justify-end pt-2">
          <Skeleton className="h-9 w-32" />
      </div>
    </div>
  );

  return (
    <>
      <AddDoctorDialog 
        isOpen={isAddDoctorOpen} 
        onOpenChange={setAddDoctorOpen} 
        onAddDoctor={handleAddDoctor} 
        departments={departments} 
      />
      
      <div className="space-y-6">
        <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <CardTitle>Doctor Management</CardTitle>
                    <CardDescription>
                      Set which doctors are available for booking and queue management today.
                    </CardDescription>
                </div>
                <Button onClick={() => setAddDoctorOpen(true)} className="w-full sm:w-auto">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Doctor
                </Button>
            </CardHeader>
        </Card>

        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <DoctorCardSkeleton />
            <DoctorCardSkeleton />
            <DoctorCardSkeleton />
            <DoctorCardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {doctors.map(doctor => (
                <Card key={doctor.id}>
                    <CardContent className="p-6 flex items-center gap-4">
                        <Image 
                            src={doctor.avatar || 'https://picsum.photos/seed/doc/100/100'} 
                            alt={doctor.name}
                            width={80}
                            height={80}
                            className="rounded-full border-4 border-muted"
                        />
                        <div className="flex-1">
                            <h3 className="font-bold text-lg">{doctor.name}</h3>
                            <p className="text-muted-foreground">{doctor.specialty}</p>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <Switch
                              id={`availability-${doctor.id}`}
                              checked={doctor.status === 'Available'}
                              onCheckedChange={(isChecked) => handleToggleAvailability(doctor.id, isChecked)}
                              aria-label={`Toggle availability for ${doctor.name}`}
                            />
                            <Label htmlFor={`availability-${doctor.id}`} className={cn("font-semibold", doctor.status === 'Available' ? 'text-green-600' : 'text-red-600')}>
                              {doctor.status === 'Available' ? 'Available' : 'Unavailable'}
                            </Label>
                        </div>
                    </CardContent>
                </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
