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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const availableReasons = [
    "Doctor Running Fast",
    "Catch Up on Delays",
    "Urgent Cases",
    "Doctor's Request",
    "Other"
];

interface ExtendQueueDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onExtend: (slots: number, reason: string) => void;
  initialSlots: 2 | 5;
}

export function ExtendQueueDialog({ isOpen, onOpenChange, onExtend, initialSlots }: ExtendQueueDialogProps) {
  const [selectedReason, setSelectedReason] = useState('');
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!selectedReason) {
      toast({
        title: 'Reason Required',
        description: 'Please select a reason for extending the queue.',
        variant: 'destructive'
      });
      return;
    }
    onExtend(initialSlots, selectedReason);
    onOpenChange(false);
    // Reset state on close
    setTimeout(() => {
        setSelectedReason('');
    }, 300);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
        setSelectedReason(''); // Reset reason when dialog is closed
    }
    onOpenChange(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Extend Queue by +{initialSlots} Slots</DialogTitle>
          <DialogDescription>
            Select a reason for adding {initialSlots} more patient slots to this session.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason-select">Reason for Extension</Label>
            <Select value={selectedReason} onValueChange={setSelectedReason}>
              <SelectTrigger id="reason-select">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {availableReasons.map((reason) => (
                  <SelectItem key={reason} value={reason}>
                    {reason}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>Confirm Extension</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
