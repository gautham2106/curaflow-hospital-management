
'use client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PrintToken, TokenData } from './print-token';
import { Printer, CheckCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SessionConfig } from '@/lib/types';

interface PrintPreviewDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  tokenData: TokenData;
  sessionConfigs: SessionConfig[];
  onPrint: () => void;
}

export function PrintPreviewDialog({ isOpen, onOpenChange, tokenData, sessionConfigs, onPrint }: PrintPreviewDialogProps) {

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-auto max-w-sm no-print p-4 sm:p-6">
        <DialogHeader className="text-center items-center">
            <div className="bg-green-500 rounded-full p-2 w-12 h-12 flex items-center justify-center text-white mb-2">
                <CheckCircle className="w-8 h-8" />
            </div>
            <DialogTitle>Token Generated!</DialogTitle>
            <DialogDescription>
                Review the token below before printing.
            </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-96 w-full rounded-md border bg-muted/30">
             <div className="scale-[0.85] transform origin-top-left">
                 <PrintToken tokenData={tokenData} sessionConfigs={sessionConfigs} />
            </div>
        </ScrollArea>
        
        <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-between gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">Done</Button>
            <Button onClick={onPrint} className="w-full sm:w-auto">
                <Printer className="mr-2 h-4 w-4" />
                Print Token
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
