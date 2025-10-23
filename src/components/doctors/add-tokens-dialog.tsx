
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { Doctor } from '@/lib/types';

interface AddTokensDialogProps {
  isOpen: boolean;
  onOpenChange: () => void;
  doctor: Doctor;
  onAddTokens: (doctorId: string, amount: number) => void;
}

export function AddTokensDialog({ isOpen, onOpenChange, doctor, onAddTokens }: AddTokensDialogProps) {
  const [amount, setAmount] = useState(5);
  const { toast } = useToast();

  const handleSubmit = () => {
    if (amount <= 0) {
      toast({ title: "Invalid Amount", description: "Please enter a number greater than zero.", variant: "destructive" });
      return;
    }
    onAddTokens(doctor.id, amount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Tokens for {doctor.name}</DialogTitle>
          <DialogDescription>
            Increase the total token limit for the current session.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="tokens-to-add">Number of Tokens to Add</Label>
            <Input
              id="tokens-to-add"
              type="number"
              value={amount}
              onChange={(e) => setAmount(parseInt(e.target.value, 10) || 0)}
              placeholder="e.g., 5"
              min="1"
            />
          </div>
           <div className="text-sm text-muted-foreground">
              Current Limit: {doctor.dailyLimit || 0} tokens. After adding, the new limit will be {(doctor.dailyLimit || 0) + amount}.
            </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onOpenChange}>Cancel</Button>
          <Button onClick={handleSubmit}>Confirm and Add</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
