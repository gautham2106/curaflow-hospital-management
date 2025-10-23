'use client';
import { useState, useTransition, useMemo } from 'react';
import { prioritizeQueue } from '@/ai/flows/intelligent-queue-prioritization';
import type { QueueItem as QueueItemType, Doctor } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Bot, User, Users, Check, Play, Pause, AlertTriangle, PhoneCall } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExtendQueueDialog } from './extend-queue-dialog';
import Image from 'next/image';

const getStatusColor = (status: QueueItemType['status']) => {
    switch (status) {
        case 'In-consultation': return 'bg-red-500 border-red-700 text-white'; // Red
        case 'Waiting': return 'bg-blue-500 border-blue-700 text-white'; // Blue
        case 'Completed': return 'bg-green-500 border-green-700 text-white'; // Green
        case 'Cancelled': return 'bg-gray-500 border-gray-700 text-white'; // Gray
        default: return 'bg-gray-200 border-gray-400 text-gray-800';
    }
}

const QueueToken = ({ item, size = 'md' }: { item: QueueItemType, size?: 'sm' | 'md' | 'lg' }) => (
    <div className={cn('flex flex-col items-center justify-center rounded-lg aspect-square text-center p-2', getStatusColor(item.status),
        size === 'sm' && 'w-16 h-16 text-xs',
        size === 'md' && 'w-24 h-24',
        size === 'lg' && 'w-32 h-32 text-lg',
    )}>
        <span className={cn('font-bold', size === 'lg' ? 'text-4xl' : 'text-2xl')}>{item.tokenNumber}</span>
        <span className="font-medium truncate w-full">{item.patientName}</span>
        {size !== 'sm' && <span className="text-xs opacity-80">{formatDistanceToNow(item.checkInTime, { addSuffix: true })}</span>}
    </div>
)


export function QueueManager({ initialQueue, doctors }: { initialQueue: QueueItemType[], doctors: Doctor[] }) {
    const [queue, setQueue] = useState<QueueItemType[]>(initialQueue);
    const [selectedDoctorId, setSelectedDoctorId] = useState<string>(doctors[0]?.id);
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const [isExtendDialogOpen, setExtendDialogOpen] = useState(false);
    const [extendSlots, setExtendSlots] = useState<2 | 5>(2);

    const selectedDoctor = doctors.find(d => d.id === selectedDoctorId);
    
    const doctorQueue = useMemo(() => {
        return queue.filter(item => item.doctorName === selectedDoctor?.name).sort((a,b) => a.tokenNumber - b.tokenNumber);
    }, [queue, selectedDoctor]);

    const nowConsulting = doctorQueue.find(item => item.status === 'In-consultation');
    const waitingQueue = doctorQueue.filter(item => item.status === 'Waiting');
    const completedQueue = doctorQueue.filter(item => item.status === 'Completed');

    const handleExtend = (slots: 2 | 5) => {
        setExtendSlots(slots);
        setExtendDialogOpen(true);
    };

    const confirmExtend = (slots: number, reason: string) => {
        toast({
            title: `Queue Extended by ${slots}`,
            description: `Reason: ${reason}.`,
        });
        // Here you would add logic to actually add slots, e.g. update doctor's dailyLimit
    };

    const handleNextPatient = () => {
        if(waitingQueue.length === 0) {
            toast({ title: 'No patients waiting', description: 'The waiting queue is empty.' });
            return;
        }
        const nextPatient = waitingQueue[0];
        setQueue(q => q.map(p => {
            if (p.id === nowConsulting?.id) return { ...p, status: 'Completed' };
            if (p.id === nextPatient.id) return { ...p, status: 'In-consultation' };
            return p;
        }));
        toast({ title: 'Next Patient Called', description: `${nextPatient.patientName} (Token: ${nextPatient.tokenNumber}) is now in consultation.` });
    };

    const handleEmergencyStop = () => {
        setQueue(q => q.map(p => (p.doctorName === selectedDoctor?.name && p.status === 'Waiting') ? {...p, status: 'Cancelled'} : p));
        toast({ title: 'Emergency Stop Activated', description: 'All waiting patients for this doctor have been cancelled.', variant: 'destructive'});
    }


    return (
        <div className="space-y-6">
            <ExtendQueueDialog isOpen={isExtendDialogOpen} onOpenChange={setExtendDialogOpen} onExtend={confirmExtend} initialSlots={extendSlots} />
            <Card>
                <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                        <CardTitle>Live Patient Queue</CardTitle>
                        <CardDescription>Select a doctor to view and manage their queue in real-time.</CardDescription>
                    </div>
                     <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
                        <SelectTrigger className="w-full md:w-[280px]">
                            <SelectValue placeholder="Select a doctor" />
                        </SelectTrigger>
                        <SelectContent>
                            {doctors.map(doctor => (
                                <SelectItem key={doctor.id} value={doctor.id}>
                                    <div className="flex items-center gap-2">
                                        <Image src={doctor.avatar || ''} alt={doctor.name} width={24} height={24} className="rounded-full" data-ai-hint="doctor portrait" />
                                        <span>{doctor.name}</span>
                                        <Badge variant="outline" className="ml-auto">{doctor.status}</Badge>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardHeader>
            </Card>

            {selectedDoctor && (
                <Card>
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <Badge className={cn('font-medium', selectedDoctor.status === 'Available' ? 'bg-green-500/80' : 'bg-red-500/80')}>
                                    {selectedDoctor.status === 'Available' ? 'ACCEPTING PATIENTS' : 'PAUSED'}
                                </Badge>
                                <p className="text-sm text-muted-foreground mt-2">
                                    <span className="font-bold text-foreground">{(selectedDoctor as any).tokensIssued || 0} / {(selectedDoctor as any).dailyLimit || 'N/A'}</span> tokens issued. 
                                    <span className="font-bold text-foreground"> {waitingQueue.length}</span> waiting.
                                </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <Button onClick={handleNextPatient}><Play className="mr-2"/>Next Patient</Button>
                                <Button variant="outline" onClick={() => handleExtend(2)}>Extend +2</Button>
                                <Button variant="outline" onClick={() => handleExtend(5)}>Extend +5</Button>
                                <Button variant="destructive" onClick={handleEmergencyStop}><AlertTriangle className="mr-2"/>Emergency Stop</Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        <div>
                            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><User /> Now Consulting</h3>
                            <div className="p-4 bg-muted/50 rounded-lg flex justify-center">
                                {nowConsulting ? <QueueToken item={nowConsulting} size="lg" /> : <p>No patient in consultation.</p>}
                            </div>
                        </div>
                        <div>
                             <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><Users /> Waiting Queue ({waitingQueue.length})</h3>
                             <div className="flex overflow-x-auto gap-4 p-4 -mx-4">
                                {waitingQueue.length > 0 ? waitingQueue.slice(0, 5).map(item => <QueueToken key={item.id} item={item} size="md" />) : <p>The waiting queue is empty.</p>}
                                {waitingQueue.length > 5 && <div className="flex items-center justify-center "><p className="font-semibold text-muted-foreground">+{waitingQueue.length - 5} more</p></div>}
                            </div>
                        </div>
                         <div>
                             <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><Check /> Recently Completed</h3>
                             <div className="flex overflow-x-auto gap-2 p-4 -mx-4">
                                {completedQueue.length > 0 ? completedQueue.slice(-5).reverse().map(item => <QueueToken key={item.id} item={item} size="sm" />) : <p>No patients completed yet.</p>}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

        </div>
    );
}
