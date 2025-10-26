
'use client';
// Force deployment - React error #310 fix applied
import { useState, useEffect, useMemo, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Doctor, QueueItem, SessionConfig, AdResource } from '@/lib/types';
import { CuraFlowLogo } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format, differenceInDays, parseISO, isBefore, formatDistanceToNowStrict } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar, Clock, Loader2, Users, ArrowRight, AlertCircle } from 'lucide-react';
import Image from 'next/image';
// Removed embla-carousel-react import - using simple carousel instead
import { useToast } from '@/hooks/use-toast';
import { useFetch } from '@/hooks/use-api';
import { useCrossPageSync } from '@/hooks/use-cross-page-sync';

// --- Simple Vertical Reels Ad Display ---
function AdCarousel({ resources, orientation }: { resources: AdResource[], orientation: 'vertical' | 'horizontal' }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Simple auto-advance timer - only for vertical reels
    useEffect(() => {
        if (!resources || resources.length <= 1) return;

        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % resources.length);
        }, 4000); // Change every 4 seconds

        return () => clearInterval(timer);
    }, [resources]);

    // Handle empty resources case
    const hasResources = resources && resources.length > 0;
    const currentResource = hasResources ? resources[currentIndex] : null;

    // Early return if no resources - but after all hooks
    if (!hasResources) {
        return (
            <div className="h-full w-full overflow-hidden rounded-lg shadow-lg bg-card flex items-center justify-center">
                <p className="text-muted-foreground">No ads available</p>
            </div>
        );
    }

    return (
        <div className="h-full w-full overflow-hidden rounded-lg shadow-lg bg-black relative">
            {/* Vertical Reels Container */}
            <div className="relative w-full h-full flex items-center justify-center">
                {currentResource?.type === 'image' && (
                    <img 
                        src={currentResource.url} 
                        alt={currentResource.title} 
                        className="w-full h-full object-cover" 
                        style={{ 
                            width: '100%', 
                            height: '100%',
                            objectFit: 'cover'
                        }}
                    />
                )}
                {currentResource?.type === 'video' && (
                    <video
                        src={currentResource.url}
                        muted
                        playsInline
                        autoPlay
                        loop
                        className="w-full h-full object-cover"
                        style={{ 
                            width: '100%', 
                            height: '100%',
                            objectFit: 'cover'
                        }}
                    />
                )}
            </div>
            
            {/* Vertical Reels Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/50 to-transparent text-white">
                <h3 className="font-bold text-2xl mb-2">{currentResource?.title}</h3>
                <p className="text-sm opacity-80">{currentResource?.duration} seconds</p>
            </div>

            {/* Vertical Reels Progress Indicator */}
            {resources && resources.length > 1 && (
                <div className="absolute top-4 right-4 flex flex-col space-y-2">
                    {resources.map((_, index) => (
                        <div
                            key={index}
                            className={`w-1 h-8 rounded-full transition-all duration-300 ${
                                index === currentIndex ? 'bg-white' : 'bg-white/30'
                            }`}
                        />
                    ))}
                </div>
            )}

            {/* Vertical Reels Counter */}
            {resources && resources.length > 1 && (
                <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                    {currentIndex + 1} / {resources.length}
                </div>
            )}
        </div>
    );
}


// --- State-based components for QR Tracking ---
function FutureAppointmentScreen({ date, doctorName, tokenNumber }: { date: Date, doctorName: string, tokenNumber: number }) {
    return (
        <Card className="w-full max-w-md text-center bg-background shadow-lg">
            <CardHeader>
                <div className="mx-auto bg-blue-100 text-blue-700 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                    <Calendar className="w-8 h-8" />
                </div>
                <CardTitle className="text-2xl">Appointment Scheduled</CardTitle>
                <CardDescription>Your token is for a future date.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <p className="font-semibold text-blue-800">Your Appointment is on:</p>
                    <p className="text-3xl font-bold text-blue-900">{format(date, 'MMMM dd, yyyy')}</p>
                    <p className="text-sm text-blue-700">{format(date, 'eeee')}</p>
                </div>
                <div className="text-left bg-muted/50 p-4 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="font-medium text-muted-foreground">Token:</span>
                        <span className="font-bold text-lg">#{tokenNumber}</span>
                    </div>
                     <div className="flex items-center justify-between">
                        <span className="font-medium text-muted-foreground">Doctor:</span>
                        <span className="font-bold">{doctorName}</span>
                    </div>
                </div>
                <p className="text-xs text-muted-foreground pt-4">
                    Please return on your appointment day to see the live queue status.
                </p>
            </CardContent>
        </Card>
    );
}

function PreSessionScreen({ sessionStartTime, tokenNumber }: { sessionStartTime: Date, tokenNumber: number }) {
    const [countdown, setCountdown] = useState('');

    useEffect(() => {
        const updateCountdown = () => {
            if (isBefore(new Date(), sessionStartTime)) {
                const distance = formatDistanceToNowStrict(sessionStartTime);
                setCountdown(distance);
            } else {
                setCountdown('Session starting...');
            }
        };

        updateCountdown();
        const timer = setInterval(updateCountdown, 1000);
        return () => clearInterval(timer);
    }, [sessionStartTime]);

    return (
         <Card className="w-full max-w-md text-center bg-background shadow-lg">
            <CardHeader>
                <div className="mx-auto bg-green-100 text-green-700 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                    <Clock className="w-8 h-8" />
                </div>
                <CardTitle className="text-2xl">Session Starts Soon</CardTitle>
                <CardDescription>Your appointment is today! Token #{tokenNumber}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                    <p className="font-semibold text-green-800 flex items-center justify-center gap-2">Session starts at {format(sessionStartTime, 'h:mm a')} in:</p>
                    <p className="text-4xl font-bold text-green-900 tabular-nums">{countdown || '...'}</p>
                </div>
                <p className="text-sm text-muted-foreground pt-4">
                    The live queue will appear here once the session begins. Please arrive at the clinic on time.
                </p>
            </CardContent>
        </Card>
    );
}

// --- Mobile Display Component ---
function MobileQueueDisplay({ 
  doctor, 
  highlightToken, 
  queue, 
  currentSession, 
  sessionConfigs, 
  currentTime 
}: { 
  doctor: Doctor, 
  highlightToken?: number, 
  queue: QueueItem[], 
  currentSession?: string | null,
  sessionConfigs: SessionConfig[],
  currentTime: Date | null
}) {
  const { nowServing, next, waitingList } = getStatusForDoctor(doctor.name, queue, currentSession);
  const isHighlighted = (token: number) => highlightToken === token;

  // Check if this is a future appointment
  const isFutureAppointment = highlightToken && !nowServing && !next && !waitingList.find(item => item.tokenNumber === highlightToken);
  
  if (isFutureAppointment) {
    // Show future appointment details
    const sessionConfig = sessionConfigs.find(s => s.name === currentSession);
    const sessionStartTime = sessionConfig ? new Date(`${new Date().toISOString().split('T')[0]}T${sessionConfig.start_time}`) : new Date();
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-md mx-auto">
          <FutureAppointmentScreen 
            date={sessionStartTime}
            doctorName={doctor.name}
            tokenNumber={highlightToken!}
          />
        </div>
      </div>
    );
  }

  // Check if session hasn't started yet
  const sessionConfig = sessionConfigs.find(s => s.name === currentSession);
  const sessionStartTime = sessionConfig ? new Date(`${new Date().toISOString().split('T')[0]}T${sessionConfig.start_time}`) : new Date();
  const isPreSession = currentTime && isBefore(currentTime, sessionStartTime);
  
  if (isPreSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
        <div className="max-w-md mx-auto">
          <PreSessionScreen 
            sessionStartTime={sessionStartTime}
            tokenNumber={highlightToken || 0}
          />
        </div>
      </div>
    );
  }

  // Get session info for display
  const sessionInfo = sessionConfigs.find(s => s.name === currentSession);
  const sessionTimeRange = sessionInfo ?
    `${sessionInfo.start.substring(0, 5)} - ${sessionInfo.end.substring(0, 5)}` : '';

  // Regular mobile queue display
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4">
      <div className="max-w-md mx-auto space-y-4">
        {/* Header */}
        <Card className="p-4 text-center">
          <h1 className="text-2xl font-bold text-gray-800">{doctor.name}</h1>
          <p className="text-lg text-gray-600">{doctor.specialty}</p>
          <Badge
            className={cn(
              "mt-2 text-sm",
              doctor.status === 'Available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            )}
          >
            {doctor.status}
          </Badge>
        </Card>

        {/* Session Info Card */}
        {currentSession && sessionInfo && (
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-blue-800">{currentSession} Session</p>
                <p className="text-sm text-blue-600">{sessionTimeRange}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-blue-600">Current Time</p>
                <p className="font-bold text-blue-800">
                  {currentTime ? format(currentTime, 'h:mm a') : '--:--'}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Current Token */}
        <Card className="p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-4">NOW SERVING</h3>
            {doctor.status === 'Available' ? (
              <div className={cn(
                "text-6xl font-bold",
                isHighlighted(nowServing?.tokenNumber ?? -1) && "text-green-600 animate-pulse"
              )}>
                {nowServing?.tokenNumber ? `#${nowServing.tokenNumber}` : '---'}
              </div>
            ) : (
              <div className="text-3xl font-bold text-red-600">DOCTOR UNAVAILABLE</div>
            )}
          </div>
        </Card>

        {/* Next Token */}
        <Card className="p-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">NEXT</h3>
            {doctor.status === 'Available' ? (
              <div className={cn(
                "text-4xl font-bold",
                isHighlighted(next?.tokenNumber ?? -1) && "text-blue-600 animate-pulse"
              )}>
                {next?.tokenNumber ? `#${next.tokenNumber}` : '---'}
              </div>
            ) : (
              <div className="text-xl font-bold text-red-600">NO QUEUE</div>
            )}
          </div>
        </Card>

        {/* Waiting List */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-3 text-center">WAITING</h3>
          {doctor.status === 'Available' ? (
            waitingList.length > 0 ? (
              <div className="flex flex-wrap gap-2 justify-center">
                {waitingList.map(item => (
                  <Badge 
                    key={item.id} 
                    variant={isHighlighted(item.tokenNumber) ? 'default' : 'outline'} 
                    className={cn(
                      "text-lg px-3 py-1",
                      isHighlighted(item.tokenNumber) && "bg-blue-600 text-white animate-pulse"
                    )}
                  >
                    #{item.tokenNumber}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">Queue is empty</p>
            )
          ) : (
            <p className="text-center text-red-500 font-medium">Doctor is unavailable</p>
          )}
        </Card>

        {/* Current Time */}
        {currentTime && (
          <Card className="p-4">
            <div className="text-center">
              <h3 className="font-semibold mb-2">Current Time</h3>
              <p className="text-2xl font-bold text-gray-800">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="text-sm text-gray-600">
                {currentTime.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

// --- Main Display Components ---

const getStatusForDoctor = (doctorName: string, queue: QueueItem[], currentSession?: string) => {
  const doctorQueue = queue
    .filter(item => 
      item.doctorName === doctorName && 
      (!currentSession || item.session === currentSession)
    )
    .sort((a, b) => {
        if (a.status === 'In-consultation') return -1;
        if (b.status === 'In-consultation') return 1;
        if (a.status === 'Skipped' && b.status !== 'Skipped') return 1;
        if (b.status === 'Skipped' && a.status !== 'Skipped') return -1;
        return a.tokenNumber - b.tokenNumber;
    });

  const nowServing = doctorQueue.find(item => item.status === 'In-consultation');
  const waiting = doctorQueue.filter(item => item.status === 'Waiting');
  const next = waiting[0] || null;
  const waitingList = waiting.slice(0);

  return { nowServing, next, waitingList };
};



function DoctorDisplayCard({ doctor, highlightToken, queue, currentSession }: { doctor: Doctor, highlightToken?: number, queue: QueueItem[], currentSession?: string | null }) {
    const { nowServing, next, waitingList } = getStatusForDoctor(doctor.name, queue, currentSession);

    const isHighlighted = (token: number) => highlightToken === token;

    return (
        <div className={cn(
            "bg-card border-2 border-border rounded-lg shadow-md p-6 space-y-4 h-full flex flex-col transition-all",
             isHighlighted(nowServing?.tokenNumber ?? -1) && 'border-green-500 ring-4 ring-green-500/30'
        )}>
            <div>
                <h2 className="text-2xl font-bold">{doctor.name}</h2>
                <p className="text-lg text-muted-foreground">{doctor.specialty}</p>
                 <Badge 
                    className={cn(
                        "mt-2 text-sm",
                        doctor.status === 'Available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    )}
                >
                    {doctor.status}
                </Badge>
            </div>
            
            <div className={cn(
              "p-4 rounded-lg text-center transition-all",
               nowServing ? 'bg-green-100/50 text-green-800' : 'bg-muted'
            )}>
                <p className="text-lg font-medium">NOW SERVING</p>
                {doctor.status === 'Available' ? (
                  <p className={cn(
                      "text-5xl font-extrabold tracking-wider",
                      isHighlighted(nowServing?.tokenNumber ?? -1) && "text-green-600 animate-pulse"
                  )}>{nowServing?.tokenNumber ? `#${nowServing.tokenNumber}`: '---'}</p>
                ) : (
                  <p className="text-3xl font-bold text-red-600">DOCTOR UNAVAILABLE</p>
                )}
            </div>

            <div className="p-3 rounded-lg text-center bg-blue-100/50 text-blue-800">
                <p className="font-medium">NEXT</p>
                {doctor.status === 'Available' ? (
                  <p className={cn(
                      "text-3xl font-bold",
                       isHighlighted(next?.tokenNumber ?? -1) && "text-blue-700 animate-pulse"
                  )}>{next?.tokenNumber ? `#${next.tokenNumber}` : '---'}</p>
                ) : (
                  <p className="text-xl font-bold text-red-600">NO QUEUE</p>
                )}
            </div>
            
            <div>
                <p className="font-medium mb-2 text-center">WAITING</p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                    {doctor.status === 'Available' ? (
                        waitingList.length > 0 ? (
                            waitingList.map(item => (
                                <Badge key={item.id} variant={isHighlighted(item.tokenNumber) ? 'default' : 'outline'} className={cn(
                                    "text-lg px-3 py-1",
                                    isHighlighted(item.tokenNumber) && "bg-blue-600 text-white animate-pulse"
                                )}>
                                    #{item.tokenNumber}
                                </Badge>
                            ))
                        ) : (
                            <p className="text-muted-foreground text-center w-full">Queue is empty.</p>
                        )
                    ) : (
                        <p className="text-red-500 text-center w-full font-medium">Doctor is unavailable</p>
                    )}
                </div>
            </div>
        </div>
    );
}

// --- Main Page Logic ---

function DisplayView() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const doctorIdsParam = searchParams.get('doctorIds');
  const enableAds = searchParams.get('ads') === 'true';
  const qrClinicId = searchParams.get('clinicId');
  const qrDoctorId = searchParams.get('doctorId');
  const qrDate = searchParams.get('date');
  const qrSession = searchParams.get('session');
  const qrTokenId = searchParams.get('tokenId');
  const qrTokenNumber = searchParams.get('tokenNumber'); // Direct token number from URL 
  
  const isQrMode = !!(qrDoctorId && qrDate && qrSession && qrTokenId && qrClinicId);
  const clinicId = isQrMode ? qrClinicId : (typeof window !== 'undefined' ? sessionStorage.getItem('clinicId') : null);

  const { get } = useFetch();

  const [allDoctors, setAllDoctors] = useState<Doctor[]>([]);
  const [sessionConfigs, setSessionConfigs] = useState<SessionConfig[]>([]);
  const [adResources, setAdResources] = useState<AdResource[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [currentDoctorIndex, setCurrentDoctorIndex] = useState(0);
  const [hospitalName, setHospitalName] = useState('YOUR HOSPITAL NAME');
  const [isLoading, setIsLoading] = useState(true);
  const [adMode, setAdMode] = useState<'sidebar' | 'fullscreen' | 'split'>('sidebar'); // MOVED TO TOP
  const [currentSession, setCurrentSession] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
        if (!clinicId) {
            if (!isQrMode) setIsLoading(false);
            return;
        }

        try {
            const clinicHeaders = { 'x-clinic-id': clinicId };
            const fetcher = (url: string) => fetch(url, { headers: clinicHeaders });
            
            const infoRes = isQrMode ? await fetcher('/api/settings/hospital-info') : await get('/api/settings/hospital-info');
            const doctorsRes = isQrMode ? await fetcher('/api/doctors') : await get('/api/doctors');
            const queueRes = isQrMode ? await fetcher('/api/queue') : await get('/api/queue');
            const sessionsRes = isQrMode ? await fetcher('/api/sessions') : await get('/api/sessions');
            const adsRes = isQrMode ? await fetcher('/api/ad-resources') : await get('/api/ad-resources');

            if(!infoRes || !infoRes.ok || !doctorsRes || !doctorsRes.ok || !queueRes || !queueRes.ok || !sessionsRes || !sessionsRes.ok || !adsRes || !adsRes.ok) {
                throw new Error("Failed to fetch one or more resources.")
            }

            const [infoData, doctorsData, queueData, sessionsData, adsData] = await Promise.all([
                infoRes.json(), doctorsRes.json(), queueRes.json(), sessionsRes.json(), adsRes.json()
            ]);

            setHospitalName(infoData.name);
            setAllDoctors(doctorsData);
            setQueue(queueData);
            setSessionConfigs(sessionsData);
            setAdResources(adsData);
            
            // Determine current session
            const now = new Date();
            const currentTime = now.getHours() * 100 + now.getMinutes();
            
            let activeSession = null;
            for (const session of sessionsData) {
                const [startHour, startMinute] = session.start.split(':').map(Number);
                const [endHour, endMinute] = session.end.split(':').map(Number);
                const startTime = startHour * 100 + startMinute;
                const endTime = endHour * 100 + endMinute;
                
                if (currentTime >= startTime && currentTime < endTime) {
                    activeSession = session.name;
                    break;
                }
            }
            setCurrentSession(activeSession);

        } catch (error) {
            toast({
                title: "Error",
                description: "Could not load display data for the clinic.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };
    fetchData();
  }, [clinicId, toast, isQrMode, get]);
  
  const tokenToHighlight = useMemo(() => {
      // Try URL parameter first (instant, no queue lookup needed)
      if (qrTokenNumber) {
          return parseInt(qrTokenNumber);
      }
      // Fallback to finding by tokenId (slower, requires queue data)
      if (qrTokenId) {
          const item = queue.find(q => q.appointmentId === qrTokenId);
          return item?.tokenNumber;
      }
      return undefined;
  }, [qrTokenNumber, qrTokenId, queue]);

  const doctorsForTv = useMemo(() => {
    const allAvailableDoctors = allDoctors.filter(d => d.status === 'Available');
    if (isQrMode && qrDoctorId) {
        const specificDoctor = allDoctors.find(d => d.id === qrDoctorId);
        return specificDoctor ? [specificDoctor] : [];
    }
    if (doctorIdsParam) {
        const selectedIds = doctorIdsParam.split(',');
        return allAvailableDoctors.filter(d => selectedIds.includes(d.id));
    }
    return allAvailableDoctors;
  }, [isQrMode, qrDoctorId, doctorIdsParam, allDoctors]);

  useEffect(() => {
    setCurrentTime(new Date()); 
    const timer = setInterval(() => setCurrentTime(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  // Refresh queue data every 30 seconds
  useEffect(() => {
    if (!clinicId) return;
    
    const refreshQueue = async () => {
      try {
        const queueRes = isQrMode ? 
          await fetch('/api/queue', { headers: { 'x-clinic-id': clinicId } }) : 
          await get('/api/queue');
        
        if (queueRes && queueRes.ok) {
          const queueData = await queueRes.json();
          setQueue(queueData);
        }
      } catch (error) {
        console.error('Failed to refresh queue data:', error);
      }
    };

    // Mobile users (QR mode) get faster updates (5s), TV display gets 30s
    const refreshInterval = isQrMode ? 5000 : 30000;
    const interval = setInterval(refreshQueue, refreshInterval);
    return () => clearInterval(interval);
  }, [clinicId, isQrMode, get]);

  // Use cross-page sync for immediate updates
  useCrossPageSync({
    onQueueUpdate: async () => {
      if (!clinicId) return;
      
      try {
        const queueRes = isQrMode ? 
          await fetch('/api/queue', { headers: { 'x-clinic-id': clinicId } }) : 
          await get('/api/queue');
        
        if (queueRes && queueRes.ok) {
          const queueData = await queueRes.json();
          setQueue(queueData);
        }
      } catch (error) {
        console.error('Failed to refresh queue data on update:', error);
      }
    }
  });

  useEffect(() => {
    if (doctorsForTv.length > 1) {
      const cycleTimer = setInterval(() => {
        setCurrentDoctorIndex(prevIndex => (prevIndex + 1) % doctorsForTv.length);
      }, 15000); 
      return () => clearInterval(cycleTimer);
    }
  }, [doctorsForTv.length]);

  if (isLoading || !currentTime || (!clinicId && !isQrMode)) {
      return <div className="flex flex-col items-center justify-center min-h-screen gap-2"><Loader2 className="w-8 h-8 animate-spin text-primary" /><p>Loading Display...</p></div>;
  }
  
  if (isQrMode) {
      const appointmentDate = parseISO(qrDate!);
      const doctor = allDoctors.find(d => d.id === qrDoctorId);
      const sessionConfig = sessionConfigs.find(s => s.name === qrSession);
      const sessionStartTime = sessionConfig ? new Date(new Date(appointmentDate).setHours(Number(sessionConfig.start.split(':')[0]), Number(sessionConfig.start.split(':')[1]))) : null;
      
      if (differenceInDays(appointmentDate, new Date()) > 0) {
          return <div className="flex items-center justify-center min-h-screen p-4"><FutureAppointmentScreen date={appointmentDate} doctorName={doctor?.name || ''} tokenNumber={tokenToHighlight || 0} /></div>;
      }
      
      if (sessionStartTime && isBefore(new Date(), sessionStartTime)) {
          return <div className="flex items-center justify-center min-h-screen p-4"><PreSessionScreen sessionStartTime={sessionStartTime} tokenNumber={tokenToHighlight || 0} /></div>;
      }
      
      if (doctor) {
          return (
            <div className="w-full max-w-md mx-auto p-4 flex items-center justify-center min-h-screen">
                {/* QR Mode - Always use mobile view for personalized tracking */}
                <MobileQueueDisplay 
                  doctor={doctor} 
                  highlightToken={tokenToHighlight} 
                  queue={queue} 
                  currentSession={currentSession}
                  sessionConfigs={sessionConfigs}
                  currentTime={currentTime}
                />
            </div>
          );
      }
  }

  const showAds = enableAds && adResources.length > 0;
  
  const mainContent = (
      <main className="flex-1 flex flex-col p-4 md:p-6 lg:p-8">
        {doctorsForTv.length > 0 ? (
          <div className="grid gap-8 w-full h-full grid-cols-1">
            {/* TV Display - Always use desktop view for general display */}
            <DoctorDisplayCard doctor={doctorsForTv[currentDoctorIndex]} queue={queue} currentSession={currentSession} />
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center h-full">
              <p className="text-2xl text-muted-foreground">{doctorIdsParam ? 'Selected doctors are not available.' : 'No doctors are currently available.'}</p>
          </div>
        )}
      </main>
  );

  return (
    <div className="font-sans flex flex-col h-screen max-h-screen overflow-hidden">
      <header className="flex items-center justify-between p-4 border-b-2 border-gray-200">
        <div className="flex items-center gap-4">
          <CuraFlowLogo className="w-12 h-12 text-primary" />
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 uppercase">{hospitalName} - LIVE QUEUE</h1>
        </div>
        <div className="text-right">
            {currentTime && (
              <>
                <p className="text-2xl md:text-3xl font-bold text-gray-800">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                <p className="text-sm text-muted-foreground">{currentTime.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </>
            )}
        </div>
      </header>

      {showAds ? (
        <div className="flex-1 flex flex-row min-h-0">
            {/* Queue Display - Hidden in fullscreen mode */}
            {adMode !== 'fullscreen' && (
              <div className={cn(
                "overflow-y-auto",
                adMode === 'sidebar' && "w-3/4",
                adMode === 'split' && "w-1/2"
              )}>
                {mainContent}
              </div>
            )}

            {/* Ad Display */}
            <div className={cn(
              "p-4 md:p-6 lg:p-8",
              adMode === 'sidebar' && "w-1/4 pl-0",
              adMode === 'fullscreen' && "w-full",
              adMode === 'split' && "w-1/2 pl-0"
            )}>
                <div className="h-full flex flex-col">
                    <div className="flex gap-2 mb-4">
                        <button
                            onClick={() => setAdMode('sidebar')}
                            className={cn("px-3 py-1 text-xs rounded", adMode === 'sidebar' ? 'bg-primary text-primary-foreground' : 'bg-muted')}
                        >
                            Sidebar
                        </button>
                        <button
                            onClick={() => setAdMode('fullscreen')}
                            className={cn("px-3 py-1 text-xs rounded", adMode === 'fullscreen' ? 'bg-primary text-primary-foreground' : 'bg-muted')}
                        >
                            Fullscreen
                        </button>
                        <button
                            onClick={() => setAdMode('split')}
                            className={cn("px-3 py-1 text-xs rounded", adMode === 'split' ? 'bg-primary text-primary-foreground' : 'bg-muted')}
                        >
                            Split
                        </button>
                    </div>
                    <div className="flex-1">
                        <AdCarousel
                            resources={adResources}
                            orientation={adMode === 'fullscreen' ? 'horizontal' : 'vertical'}
                        />
                    </div>
                </div>
            </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">{mainContent}</div>
      )}
    </div>
  );
}

export default function DisplayPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen w-full"><Loader2 className="w-10 h-10 animate-spin" /></div>}>
      <DisplayView />
    </Suspense>
  )
}
