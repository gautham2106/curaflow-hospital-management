'use client';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { SessionConfig } from '@/lib/types';

interface SessionExtensionDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  currentSession: SessionConfig | null;
  nextSession: SessionConfig | null;
  waitingPatientsCount: number;
  onExtend: () => void;
  onEndSession: () => void;
}

export function SessionExtensionDialog({
  isOpen,
  onOpenChange,
  currentSession,
  nextSession,
  waitingPatientsCount,
  onExtend,
  onEndSession
}: SessionExtensionDialogProps) {
  const [isExtending, setIsExtending] = useState(false);

  if (!currentSession) return null;

  // Calculate if extension would overlap with next session
  const willOverlap = () => {
    if (!nextSession) return false;

    const [currentEndHour, currentEndMinute] = currentSession.end.split(':').map(Number);
    const [nextStartHour, nextStartMinute] = nextSession.start.split(':').map(Number);

    // Add 30 minutes to current end time
    const extendedEndMinutes = currentEndHour * 60 + currentEndMinute + 30;
    const nextStartMinutes = nextStartHour * 60 + nextStartMinute;

    return extendedEndMinutes > nextStartMinutes;
  };

  const handleExtend = async () => {
    setIsExtending(true);
    await onExtend();
    setIsExtending(false);
    onOpenChange(false);
  };

  const handleEndSession = () => {
    onEndSession();
    onOpenChange(false);
  };

  const overlap = willOverlap();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-500" />
            Session Ending Soon
          </DialogTitle>
          <DialogDescription>
            {currentSession.name} session is ending in 5 minutes
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Waiting Patients Alert */}
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-center gap-2 text-amber-800">
              <AlertTriangle className="h-5 w-5" />
              <div>
                <p className="font-semibold">
                  {waitingPatientsCount} patient{waitingPatientsCount > 1 ? 's' : ''} still waiting
                </p>
                <p className="text-sm text-amber-700">
                  Doctor can continue or end session now
                </p>
              </div>
            </div>
          </div>

          {/* Extension Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-blue-500" />
              <span className="font-medium">Option 1: Extend by 30 Minutes</span>
            </div>
            <div className="ml-6 space-y-1 text-sm text-muted-foreground">
              <p>
                Current: {currentSession.name} ({currentSession.start} - {currentSession.end})
              </p>
              <p className="font-medium text-foreground">
                Extended: {currentSession.name} ({currentSession.start} - {calculateExtendedTime(currentSession.end)})
              </p>

              {overlap && nextSession && (
                <div className="mt-2 rounded border border-blue-200 bg-blue-50 p-2">
                  <p className="text-xs font-medium text-blue-800">
                    ⚠️ Will shift {nextSession.name} session
                  </p>
                  <p className="text-xs text-blue-700">
                    From: {nextSession.start} - {nextSession.end}
                  </p>
                  <p className="text-xs text-blue-700">
                    To: {calculateExtendedTime(nextSession.start)} - {calculateExtendedTime(nextSession.end)}
                  </p>
                </div>
              )}

              {!overlap && nextSession && (
                <p className="text-xs text-green-600">
                  ✓ No conflict with {nextSession.name} session
                </p>
              )}

              {!nextSession && (
                <p className="text-xs text-green-600">
                  ✓ No next session today
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-red-500" />
              <span className="font-medium">Option 2: End Session Now</span>
            </div>
            <div className="ml-6 text-sm text-muted-foreground">
              <p>Waiting patients will be marked as "No-show"</p>
              <p className="text-xs">Statistics will be recorded</p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleEndSession}
            className="w-full sm:w-auto"
          >
            End Session Now
          </Button>
          <Button
            onClick={handleExtend}
            disabled={isExtending}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
          >
            {isExtending ? (
              <>Extending...</>
            ) : (
              <>
                <Clock className="mr-2 h-4 w-4" />
                Extend 30 Minutes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Helper function to add 30 minutes to time string
function calculateExtendedTime(timeString: string): string {
  const [hours, minutes] = timeString.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + 30;
  const newHours = Math.floor(totalMinutes / 60);
  const newMinutes = totalMinutes % 60;
  return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
}
