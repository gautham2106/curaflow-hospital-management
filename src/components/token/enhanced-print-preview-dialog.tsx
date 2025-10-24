
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PrintToken } from './print-token';
import { getPrinterService } from '@/services/BluetoothPrinterService';
import { Printer, Bluetooth, Loader2, AlertCircle, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import type { TokenData } from './print-token';
import { SessionConfig } from '@/lib/types';
import { formatTime } from '@/lib/utils';


interface EnhancedPrintPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tokenData: TokenData;
  sessionConfigs: SessionConfig[];
}

export function EnhancedPrintPreviewDialog({
  open,
  onOpenChange,
  tokenData,
  sessionConfigs,
}: EnhancedPrintPreviewDialogProps) {
  const [isBluetoothConnected, setIsBluetoothConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!open) return;

    const printerService = getPrinterService();
    setIsBluetoothConnected(printerService.isConnected());

    const handleConnected = () => setIsBluetoothConnected(true);
    const handleDisconnected = () => setIsBluetoothConnected(false);
    const handleError = (err: string) => setError(err);

    printerService.on('connected', handleConnected);
    printerService.on('disconnected', handleDisconnected);
    printerService.on('error', handleError);

    return () => {
      printerService.off('connected', handleConnected);
      printerService.off('disconnected', handleDisconnected);
      printerService.off('error', handleError);
    };
  }, [open]);

  const handleBluetoothPrint = async () => {
    setIsPrinting(true);
    setError(null);
    try {
      const printerService = getPrinterService();
      if (!printerService.isConnected()) throw new Error('Printer not connected');
      await printerService.printToken(tokenData);
      toast.success('Token printed successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to print token');
      toast.error(err.message || 'Failed to print token');
    } finally {
      setIsPrinting(false);
    }
  };
  
  const handleSendWhatsApp = async () => {
    setIsSending(true);
    setError(null);
    try {
        const sessionInfo = sessionConfigs.find(s => s.name === tokenData.session);
        const sessionTimeRange = sessionInfo ? `${formatTime(sessionInfo.start)} - ${formatTime(sessionInfo.end)}` : '';
        const clinicName = sessionStorage.getItem('clinicName') || 'CuraFlow Clinic';

        const clinicId = sessionStorage.getItem('clinicId');
        const response = await fetch('/api/notifications/whatsapp', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'x-clinic-id': clinicId || ''
            },
            body: JSON.stringify({ tokenData, sessionTimeRange, clinicName }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to send message');
        }
        toast.success('WhatsApp confirmation sent!');
    } catch (err: any) {
        setError(err.message);
        toast.error(`Failed to send WhatsApp message: ${err.message}`);
    } finally {
        setIsSending(false);
    }
  };


  const handleConnectBluetooth = async () => {
    setIsConnecting(true);
    setError(null);
    try {
      const printerService = getPrinterService();
      await printerService.connect();
      toast.success('Bluetooth printer connected');
    } catch (err: any) {
      setError(err.message || 'Failed to connect');
      toast.error(err.message || 'Failed to connect');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Token Generated</DialogTitle>
          <DialogDescription>
            You can now print a physical token or send a WhatsApp confirmation.
          </DialogDescription>
        </DialogHeader>

        <div className="border rounded-lg p-4 bg-gray-50 my-4">
          <PrintToken tokenData={tokenData} sessionConfigs={sessionConfigs} />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="flex flex-col gap-3 mt-6">
           <Button onClick={handleSendWhatsApp} disabled={isSending}>
                {isSending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Send WhatsApp Confirmation
                  </>
                )}
            </Button>
          <div className="relative flex items-center justify-center text-xs text-muted-foreground my-2">
            <span className="bg-background px-2 z-10">OR</span>
            <div className="absolute left-0 right-0 h-[1px] bg-border"></div>
          </div>
          
          {!isBluetoothConnected ? (
              <Button variant="outline" onClick={handleConnectBluetooth} disabled={isConnecting}>
                {isConnecting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                ) : (
                    <>
                      <Bluetooth className="w-4 h-4 mr-2" />
                      Connect Receipt Printer
                    </>
                )}
              </Button>
          ) : (
              <Button onClick={handleBluetoothPrint} disabled={isPrinting}>
                {isPrinting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Printing...
                  </>
                ) : (
                  <>
                    <Printer className="w-4 h-4 mr-2" />
                    Print Token
                  </>
                )}
              </Button>
          )}

        </div>
        
        <Button variant="ghost" onClick={() => onOpenChange(false)} className="mt-4 w-full">Done</Button>
      </DialogContent>
    </Dialog>
  );
}
