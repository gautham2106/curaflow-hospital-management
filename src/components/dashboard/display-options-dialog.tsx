
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
import { Label } from '@/components/ui/label';
import type { Doctor } from '@/lib/types';
import { Switch } from '../ui/switch';

interface DisplayOptionsDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  doctors: Doctor[];
}

export function DisplayOptionsDialog({ isOpen, onOpenChange, doctors }: DisplayOptionsDialogProps) {
  const [selectedDoctorIds, setSelectedDoctorIds] = useState<string[]>([]);
  const [enableAds, setEnableAds] = useState(false);

  const handleDoctorSelection = (doctorId: string, isChecked: boolean) => {
    setSelectedDoctorIds(prev =>
      isChecked ? [...prev, doctorId] : prev.filter(id => id !== doctorId)
    );
  };
  
  const handleLaunch = () => {
    let url = '/display?';
    
    if (selectedDoctorIds.length > 0) {
      url += `doctorIds=${selectedDoctorIds.join(',')}`;
    }

    if (enableAds) {
        url += `${selectedDoctorIds.length > 0 ? '&' : ''}ads=true`;
    }

    window.open(url, '_blank');
    onOpenChange(false);
  };

  const availableDoctors = doctors.filter(d => d.status === 'Available');

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Live Display Options</DialogTitle>
          <DialogDescription>
            Configure and launch the waiting room display. Select doctors to include in the cycle.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
           <div className="space-y-3">
              <Label>Doctors to Display</Label>
              <p className="text-xs text-muted-foreground">
                Select which doctors to cycle through. If none are selected, all available doctors will be shown.
              </p>
              <div className="space-y-3 rounded-md border p-4 max-h-60 overflow-y-auto">
                {availableDoctors.length > 0 ? availableDoctors.map(doc => (
                    <div key={doc.id} className="flex items-center justify-between">
                        <Label htmlFor={`doc-switch-${doc.id}`} className="font-normal cursor-pointer">{doc.name}</Label>
                        <Switch
                            id={`doc-switch-${doc.id}`}
                            onCheckedChange={(checked) => handleDoctorSelection(doc.id, checked)}
                            checked={selectedDoctorIds.includes(doc.id)}
                        />
                    </div>
                )) : (
                    <p className="text-sm text-muted-foreground text-center">No doctors are currently available.</p>
                )}
              </div>
           </div>
          
           <div className="flex items-center space-x-2">
              <Switch id="enable-ads" checked={enableAds} onCheckedChange={setEnableAds} />
              <Label htmlFor="enable-ads">Enable Ad Carousel</Label>
           </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleLaunch}>Launch Display</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
