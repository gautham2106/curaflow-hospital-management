'use client';

import { TokenData } from '@/components/token/print-token';
import { EventEmitter } from 'events';

// Add Bluetooth API type declarations
declare global {
  interface Navigator {
    bluetooth: any;
  }
}

// These will be populated from the global window object by the script tags in layout.tsx
let WebBluetoothReceiptPrinter: any = null;
let ReceiptPrinterEncoder: any = null;

if (typeof window !== 'undefined') {
  WebBluetoothReceiptPrinter = (window as any).WebBluetoothReceiptPrinter;
  ReceiptPrinterEncoder = (window as any).ReceiptPrinterEncoder;
}

let instance: BluetoothPrinterService | null = null;

export class BluetoothPrinterService extends EventEmitter {
  private printer: any = null;
  private lastDevice: any = null;

  constructor() {
    super();
    
    if (typeof window === 'undefined') {
      return;
    }

    if (!navigator.bluetooth) {
      console.warn('⚠️ Web Bluetooth not supported in this browser');
      return;
    }
    
    if (!WebBluetoothReceiptPrinter) {
      console.error('WebBluetoothReceiptPrinter library not found on window object.');
      return;
    }

    this.printer = new WebBluetoothReceiptPrinter();
    this.setupEventListeners();
    this.autoReconnect();
  }

  private setupEventListeners() {
    if (!this.printer) return;

    this.printer.addEventListener('connected', (event: { detail: any; }) => {
      const device = event.detail;
      console.log('✅ Printer connected:', device);
      this.lastDevice = device;
      
      try {
        localStorage.setItem('lastPrinter', JSON.stringify({
          id: device.id,
          name: device.name,
          language: device.language,
          codepageMapping: device.codepageMapping
        }));
      } catch (e) {
        console.error('Failed to save printer info:', e);
      }
      
      this.emit('connected', device);
    });

    this.printer.addEventListener('disconnected', () => {
      console.log('🔌 Printer disconnected');
      this.lastDevice = null;
      this.emit('disconnected');
    });

     this.printer.addEventListener('error', (errorEvent: { message: any; }) => {
      console.error('Printer error:', errorEvent);
      this.emit('error', errorEvent.message || 'An unknown printer error occurred.');
    });
  }

  async connect(): Promise<void> {
    if (!this.printer) {
      throw new Error('Printer library not loaded. Please refresh the page.');
    }

    if (typeof navigator === 'undefined' || !navigator.bluetooth) {
      throw new Error('Web Bluetooth not supported. Please use Chrome or Edge.');
    }

    try {
      this.emit('connecting');
      await this.printer.connect();
    } catch (error: any) {
      console.error('Connection error:', error);
      
      let errorMessage = 'Could not connect to printer';
      if (error.message?.includes('User cancelled')) {
        errorMessage = 'Connection cancelled';
      } else if (error.message?.includes('Bluetooth adapter not available')) {
        errorMessage = 'Bluetooth not available. Please enable Bluetooth.';
      }
      
      this.emit('error', errorMessage);
      throw new Error(errorMessage);
    }
  }

  async autoReconnect(): Promise<void> {
    if (!this.printer) return;

    try {
      const savedDevice = localStorage.getItem('lastPrinter');
      if (!savedDevice) return;

      if (typeof navigator === 'undefined' || !navigator.bluetooth) {
        return;
      }

      const device = JSON.parse(savedDevice);
      console.log('🔄 Auto-reconnecting to:', device.name);
      
      this.emit('connecting');
      await this.printer.reconnect(device);
    } catch (error) {
      console.log('Auto-reconnect failed:', error);
      // Silently fail for auto-reconnect
    }
  }

  async disconnect(): Promise<void> {
    if (this.printer && this.printer.connected) {
        await this.printer.disconnect();
    }
    try {
        localStorage.removeItem('lastPrinter');
    } catch (e) {
        console.error('Failed to remove printer info:', e);
    }
    this.lastDevice = null;
    this.emit('disconnected');
    console.log('🔌 Disconnected');
  }

  isConnected(): boolean {
    return this.printer?.connected && !!this.lastDevice;
  }

  async printToken(tokenData: TokenData): Promise<void> {
    if (!this.isConnected()) {
      throw new Error('Printer not connected. Please connect to a printer first.');
    }

    if (!ReceiptPrinterEncoder) {
      throw new Error('Encoder library not loaded. Please refresh the page.');
    }

    console.log('📄 Printing token:', tokenData);

    try {
      const encoder = new ReceiptPrinterEncoder({
        language: this.lastDevice?.language || 'esc-pos',
        codepageMapping: this.lastDevice?.codepageMapping,
      });

      const trackingUrl = `${window.location.origin}/display?doctorId=${tokenData.doctor.id}&date=${new Date(tokenData.date).toISOString().split('T')[0]}&session=${tokenData.session}&tokenId=${tokenData.id}`;

      const receipt = encoder
        .initialize()
        .align('center')
        .line('================================')
        .bold(true)
        .size('large')
        .line(`TOKEN: ${tokenData.tokenNumber}`)
        .bold(false)
        .size('normal')
        .line('================================')
        .align('left')
        .line(`Patient: ${tokenData.patientName}`)
        .line(`Doctor: ${tokenData.doctor?.name || 'N/A'}`)
        .line(`Session: ${tokenData.session}`)
        .line(`Date: ${new Date(tokenData.date).toLocaleDateString()}`)
        .line('================================')
        .align('center')
        .qrcode(trackingUrl)
        .newline(3)
        .cut()
        .encode();

      await this.printer.print(receipt);
      
      console.log('✅ Print job sent successfully');
      this.emit('printed', tokenData);
    } catch (error: any) {
      console.error('Printing failed:', error);
      this.emit('error', 'Failed to print token');
      throw new Error(`Print failed: ${error.message}`);
    }
  }

  getDevice() {
    return this.lastDevice;
  }

  getStatus() {
    return {
      connected: this.isConnected(),
      printerName: this.lastDevice?.name || null,
    };
  }
}

export function getPrinterService(): BluetoothPrinterService {
  if (typeof window === 'undefined') {
    // Server-side: return mock
    return {
      on: () => {},
      off: () => {},
      emit: () => {},
      connect: async () => {},
      disconnect: async () => {},
      autoReconnect: async () => {},
      isConnected: () => false,
      printToken: async () => {},
      getDevice: () => null,
      getStatus: () => ({ connected: false, printerName: null }),
    } as any;
  }
  
  if (!instance) {
    instance = new BluetoothPrinterService();
  }
  return instance;
}

export default BluetoothPrinterService;
