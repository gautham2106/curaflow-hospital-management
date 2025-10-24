
'use client';
import { CuraFlowLogo } from '@/components/icons';
import type { Doctor, SessionConfig } from '@/lib/types';
import { format } from 'date-fns';
import QRCode from 'qrcode.react';
import { useEffect, useState } from 'react';

export interface TokenData {
    id: string;
    patientName: string;
    age: number;
    gender: 'Male' | 'Female' | 'Other' | '';
    phone: string; // Added phone number
    doctor: Doctor;
    session: string;
    tokenNumber: number;
    date: Date;
    status: 'Scheduled' | 'In-consultation' | 'Completed' | 'Cancelled';
}


interface PrintTokenProps {
    tokenData: TokenData | null;
    sessionConfigs: SessionConfig[];
}

const formatTime = (time: string) => {
    const [hour, minute] = time.split(':');
    const hourNum = parseInt(hour, 10);
    const ampm = hourNum >= 12 ? 'PM' : 'AM';
    const formattedHour = hourNum % 12 === 0 ? 12 : hourNum % 12;
    return `${String(formattedHour).padStart(2, '0')}:${minute} ${ampm}`;
}

export function PrintToken({ tokenData, sessionConfigs }: PrintTokenProps) {
    const [clinicName, setClinicName] = useState('CuraFlow Clinic');
    const [clinicId, setClinicId] = useState<string | null>(null);

    useEffect(() => {
        setClinicName(sessionStorage.getItem('clinicName') || 'CuraFlow Clinic');
        setClinicId(sessionStorage.getItem('clinicId'));
    }, []);

    if (!tokenData) {
        return null;
    }

    const { id, patientName, age, gender, doctor, session, tokenNumber, date } = tokenData;
    
    // Construct the URL for the QR code
    const trackingUrl = (typeof window !== 'undefined' && clinicId)
      ? `${window.location.origin}/display?clinicId=${clinicId}&doctorId=${doctor.id}&date=${format(new Date(date), 'yyyy-MM-dd')}&session=${session}&tokenId=${id}`
      : '';

    const sessionInfo = sessionConfigs.find(s => s.name === session);
    const sessionTimeRange = sessionInfo ? `${formatTime(sessionInfo.start)} - ${formatTime(sessionInfo.end)}` : '';

    return (
        <div id="token-to-print" className="print-only p-4 bg-white text-black font-sans w-full sm:w-[302px] sm:border-2 sm:border-dashed sm:border-gray-400 sm:rounded-lg sm:h-auto sm:mx-auto">
            <div className="text-center pb-2 border-b border-gray-300">
                <CuraFlowLogo className="w-12 h-12 mx-auto text-gray-800" />
                <h1 className="text-xl font-bold">{clinicName}</h1>
                <p className="text-xs">Patient Token</p>
            </div>
            <div className="py-4 text-center">
                <p className="text-sm font-mono">TOKEN NO.</p>
                <p className="text-7xl font-extrabold tracking-wider font-mono">{tokenNumber}</p>
            </div>
            <div className="text-sm space-y-1 border-t border-gray-300 pt-2 font-mono">
                <div className="flex justify-between">
                    <span className="font-medium">Patient:</span>
                    <span className="font-bold text-right">{patientName} ({age}, {gender.charAt(0)})</span>
                </div>
                <div className="flex justify-between">
                    <span className="font-medium">Doctor:</span>
                    <span className="text-right">{doctor.name}</span>
                </div>
                 <div className="flex justify-between">
                    <span className="font-medium">Department:</span>
                    <span className="text-right">{doctor.specialty}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="font-medium">Time Slot:</span>
                    <span className='text-right'>{sessionTimeRange}</span>
                </div>
                <div className="flex justify-between">
                    <span className="font-medium">Appt. Date:</span>
                    <span className="text-right">{format(new Date(date), 'dd/MM/yyyy')}</span>
                </div>
                <div className="flex justify-between">
                    <span className="font-medium">Issue Time:</span>
                    <span className="text-right">{format(new Date(), 'dd/MM/yy, h:mm a')}</span>
                </div>
            </div>

            {trackingUrl && (
              <div className="text-center pt-3 mt-3 border-t border-dashed border-gray-300">
                  <QRCode value={trackingUrl} size={128} level="H" renderAs="svg" className="mx-auto mb-2" />
                  <p className="text-xs italic mt-2">Scan QR for LIVE updates</p>
              </div>
            )}
        </div>
    );
}
