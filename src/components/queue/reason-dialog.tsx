
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

interface ReasonDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (reason: string) => void;
}

const reasons = [
    "Emergency",
    "Doctor Requested",
    "Elderly/Special Needs",
    "Post-procedure Review",
    "Other"
];

export function ReasonDialog({ isOpen, onOpenChange, onSubmit }: ReasonDialogProps) {
  const [reason, setReason] = useState('');
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!reason) {
      toast({
        title: 'Reason Required',
        description: 'Please select a reason for calling this patient out of turn.',
        variant: 'destructive',
      });
      return;
    }
    onSubmit(reason);
    setReason('');
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
        setReason(''); // Reset reason when dialog is closed
    }
    onOpenChange(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reason Required</DialogTitle>
          <DialogDescription>
            You are calling a patient out of turn. Please provide a reason for this action.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason-select">Reason</Label>
             <Select value={reason} onValueChange={setReason}>
                <SelectTrigger id="reason-select">
                    <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                    {reasons.map(r => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>Confirm and Call</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
