'use client';
import { useState, useTransition } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Bot, Loader2 } from 'lucide-react';
import { suggestExtensionReason } from '@/ai/flows/queue-extension-reasoning';
import { useToast } from '@/hooks/use-toast';

const availableReasons = [
    "Running fast",
    "Catch up",
    "Urgent",
    "Other"
];

interface ExtendQueueDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onExtend: (slots: number, reason: string) => void;
  initialSlots: 2 | 5;
}

export function ExtendQueueDialog({ isOpen, onOpenChange, onExtend, initialSlots }: ExtendQueueDialogProps) {
  const [doctorRequest, setDoctorRequest] = useState('');
  const [suggestedReason, setSuggestedReason] = useState('');
  const [selectedReason, setSelectedReason] = useState('');
  const [isSuggesting, startSuggestionTransition] = useTransition();
  const { toast } = useToast();

  const handleSuggestReason = () => {
    if (!doctorRequest) {
      toast({ title: 'Please enter a request from the doctor.', variant: 'destructive' });
      return;
    }
    startSuggestionTransition(async () => {
      try {
        const result = await suggestExtensionReason({ doctorRequest, availableReasons });
        setSuggestedReason(result.suggestedReason);
        setSelectedReason(result.suggestedReason);
        toast({ title: 'AI Suggestion', description: `Suggested reason: "${result.suggestedReason}"` });
      } catch (error) {
        console.error('Error suggesting reason:', error);
        toast({ title: 'AI Suggestion Failed', description: 'Could not get a suggestion from the AI.', variant: 'destructive' });
      }
    });
  };

  const handleSubmit = () => {
    if (!selectedReason) {
      toast({ title: 'Please select a reason for extension.', variant: 'destructive' });
      return;
    }
    onExtend(initialSlots, selectedReason);
    onOpenChange(false);
    // Reset state on close
    setTimeout(() => {
        setDoctorRequest('');
        setSuggestedReason('');
        setSelectedReason('');
    }, 300);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
        if(!open) {
            setDoctorRequest('');
            setSuggestedReason('');
            setSelectedReason('');
        }
        onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Extend Queue by +{initialSlots}</DialogTitle>
          <DialogDescription>
            Use AI to help categorize the reason for adding more patient slots.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="doctor-request">Doctor's Request Context (Optional)</Label>
            <Textarea
              id="doctor-request"
              placeholder="e.g., 'Running ahead of schedule, can see a few more' or 'Patient needed urgent tests, I am catching up.'"
              value={doctorRequest}
              onChange={(e) => setDoctorRequest(e.target.value)}
            />
            <Button variant="outline" size="sm" onClick={handleSuggestReason} disabled={isSuggesting || !doctorRequest}>
              {isSuggesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
              Suggest Reason with AI
            </Button>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="reason">Reason for Extension</Label>
            <Select value={selectedReason} onValueChange={setSelectedReason}>
              <SelectTrigger id="reason" className={suggestedReason && selectedReason === suggestedReason ? 'border-primary ring-2 ring-primary/50' : ''}>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {availableReasons.map((reason) => (
                  <SelectItem key={reason} value={reason}>
                    {reason}
                    {suggestedReason === reason && <span className="ml-2 text-xs text-primary font-semibold">(AI Suggestion)</span>}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!selectedReason}>Confirm Extension</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
