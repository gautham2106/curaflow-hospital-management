import type { Metadata } from 'next';
import { Toaster as ShadcnToaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from '@/components/ui/sonner';
import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'CuraFlow',
  description: 'Streamlining Clinic and Hospital Management',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Bluetooth Printer Libraries */}
        <script 
          src="https://cdn.jsdelivr.net/npm/webbluetooth-receipt-printer@latest/dist/webbluetooth-receipt-printer.umd.js"
        ></script>
        <script 
          src="https://cdn.jsdelivr.net/npm/receipt-printer-encoder@latest/dist/receipt-printer-encoder.umd.js"
        ></script>
      </head>
      <body className={`font-sans antialiased ${inter.variable}`}>
        {children}
        <ShadcnToaster />
        <SonnerToaster />
      </body>
    </html>
  );
}
