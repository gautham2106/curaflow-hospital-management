
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Clock, UserX, PlusCircle, Settings, Tv2, ListOrdered, BookUser } from "lucide-react";
import { DisplayOptionsDialog } from '@/components/dashboard/display-options-dialog';
import type { Doctor } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useFetch } from '@/hooks/use-api';

export default function DashboardPage() {
  const [isDisplayOptionsOpen, setDisplayOptionsOpen] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const { toast } = useToast();
  const { get } = useFetch();

  useEffect(() => {
    const fetchDoctors = async () => {
      const clinicId = sessionStorage.getItem('clinicId');
      if (!clinicId) return;
      try {
        const doctorsRes = await get('/api/doctors');
        if (!doctorsRes || !doctorsRes.ok) {
          throw new Error('Failed to fetch doctors');
        }
        const doctorsData: Doctor[] = await doctorsRes.json();
        setDoctors(doctorsData);
      } catch (error) {
        toast({
          title: "Error",
          description: "Could not load doctor data for the display options.",
          variant: "destructive",
        });
      }
    };
    fetchDoctors();
  }, [toast, get]);


  const ActionButton = ({ href, icon: Icon, title, description }: { href: string, icon: React.ElementType, title: string, description: string }) => (
    <Link href={href} passHref>
      <Card className="h-full hover:bg-accent hover:border-primary transition-all group">
        <CardHeader className="flex flex-col md:flex-row items-center gap-4 space-y-0 p-4">
          <div className="p-3 bg-primary/10 rounded-lg text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            <Icon className="h-8 w-8" />
          </div>
          <div className='text-center md:text-left'>
            <CardTitle className="text-xl">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </CardHeader>
      </Card>
    </Link>
  );
  
  const DialogActionButton = ({ onClick, icon: Icon, title, description }: { onClick: () => void, icon: React.ElementType, title: string, description: string }) => (
    <Card className="h-full hover:bg-accent hover:border-primary transition-all group cursor-pointer" onClick={onClick}>
        <CardHeader className="flex flex-col md:flex-row items-center gap-4 space-y-0 p-4">
          <div className="p-3 bg-primary/10 rounded-lg text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            <Icon className="h-8 w-8" />
          </div>
          <div className='text-center md:text-left'>
            <CardTitle className="text-xl">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </CardHeader>
      </Card>
  )


  return (
    <>
      <DisplayOptionsDialog 
        isOpen={isDisplayOptionsOpen} 
        onOpenChange={setDisplayOptionsOpen} 
        doctors={doctors} 
      />
      <div className="space-y-8">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
              <h1 className="text-3xl font-bold tracking-tight">Welcome to CuraFlow</h1>
              <p className="text-muted-foreground">Your clinic's central command center.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
                <Link href="/settings"><Settings /></Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-3">
            <ActionButton 
                href="/generate-token"
                icon={PlusCircle}
                title="Book a Token"
                description="Register a new or existing patient."
            />
            <ActionButton 
                href="/queue"
                icon={ListOrdered}
                title="Manage Live Queue"
                description="Call, skip, and manage patient flow."
            />
            <DialogActionButton
                onClick={() => setDisplayOptionsOpen(true)}
                icon={Tv2}
                title="Open Live Display"
                description="Launch the waiting room screen."
            />
        </div>

         <div>
            <h2 className="text-2xl font-bold tracking-tight">Other Actions</h2>
            <div className="grid gap-4 md:grid-cols-2 mt-4">
                <Link href="/register" passHref>
                    <Card className="hover:bg-muted/50">
                        <CardHeader className="flex flex-row items-center gap-4">
                            <BookUser className="h-6 w-6 text-muted-foreground"/>
                            <div>
                                <h3 className="font-semibold">Visit Register</h3>
                                <p className="text-sm text-muted-foreground">View and export historical visit data.</p>
                            </div>
                        </CardHeader>
                    </Card>
                </Link>
                <Link href="/doctors" passHref>
                     <Card className="hover:bg-muted/50">
                        <CardHeader className="flex flex-row items-center gap-4">
                            <Users className="h-6 w-6 text-muted-foreground"/>
                            <div>
                                <h3 className="font-semibold">Manage Doctors</h3>
                                <p className="text-sm text-muted-foreground">Set doctor availability and schedules.</p>
                            </div>
                        </CardHeader>
                    </Card>
                </Link>
            </div>
        </div>

      </div>
    </>
  );
}
