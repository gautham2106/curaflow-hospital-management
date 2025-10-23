
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { getClinicId, clinicIdNotFoundResponse } from '@/lib/api-utils';

// URL shortening service with multiple fallbacks
async function shortenUrl(longUrl: string): Promise<string> {
    const shorteningServices = [
        // TinyURL
        async () => {
            const response = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`);
            return response.data;
        },
        // Is.gd
        async () => {
            const response = await axios.get(`https://is.gd/create.php?format=simple&url=${encodeURIComponent(longUrl)}`);
            return response.data;
        },
        // 0x0.st
        async () => {
            const response = await axios.post('https://0x0.st', `url=${encodeURIComponent(longUrl)}`, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });
            return response.data.trim();
        }
    ];

    for (const service of shorteningServices) {
        try {
            const shortUrl = await service();
            if (shortUrl && shortUrl.startsWith('http')) {
                console.log('URL shortened successfully:', shortUrl);
                return shortUrl;
            }
        } catch (error) {
            console.log('URL shortening service failed:', error);
            continue;
        }
    }
    
    console.log('All URL shortening services failed, using original URL');
    return longUrl;
}

export async function POST(request: NextRequest) {
    try {
        const clinicId = getClinicId(request);
        if (!clinicId) return clinicIdNotFoundResponse();

        const { tokenData, sessionTimeRange, clinicName } = await request.json();

    // Debug logging
    console.log('WhatsApp API - Received tokenData:', JSON.stringify(tokenData, null, 2));
    console.log('WhatsApp API - tokenNumber:', tokenData.tokenNumber);
    console.log('WhatsApp API - tokenNumber type:', typeof tokenData.tokenNumber);

    const accessToken = 'EAAQzPY217joBPghgZAIW1IQ1u7OlHDH419Y6LQDbJj9aJ1xwgY1zwWCdV1l35yRrYTqy76UwZCZCIsLQzejlv5ro5hEiyNrtSZBx8VyBfJTimZBN7jXjA4ZCBpWbZBLRD35MZCGEPinPoMPGrch7A4B1iqKoaj7TZCIUs80x4Xy4P2b8Cp6eHUjZCbylkTkBpiSHTYNAZDZD';
    const phoneId = '591459790706231';
    const endpointUrl = `https://graph.facebook.com/v22.0/${phoneId}/messages`;

    // Construct the tracking URL using the correct Vercel URL
    const baseUrl = 'https://curaflow-hospital-management123.vercel.app';
    const trackingUrl = `${baseUrl}/display?clinicId=${tokenData.clinicId}&doctorId=${tokenData.doctor.id}&date=${new Date(tokenData.date).toISOString().split('T')[0]}&session=${tokenData.session}&tokenId=${tokenData.id}`;
    
    console.log('Original tracking URL:', trackingUrl);
    
    // Shorten the URL
    const shortUrl = await shortenUrl(trackingUrl);
    console.log('Shortened URL:', shortUrl);


    const parameters = [
        { type: 'text', text: tokenData.patientName },
        { type: 'text', text: clinicName },
        { type: 'text', text: String(tokenData.tokenNumber) },
        { type: 'text', text: tokenData.doctor.name },
        { type: 'text', text: tokenData.doctor.specialty },
        { type: 'text', text: new Date(tokenData.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) },
        { type: 'text', text: tokenData.session },
        { type: 'text', text: sessionTimeRange },
        { type: 'text', text: shortUrl },
    ];

    const messagePayload = {
        messaging_product: 'whatsapp',
        to: tokenData.phone.replace(/\s/g, ''),
        type: 'template',
        template: {
            name: 'new_appointment',
            language: { code: 'en' },
            components: [{
                type: 'body',
                parameters: parameters,
            }],
        },
    };

    try {
        const response = await axios.post(endpointUrl, messagePayload, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            }
        });
        
        return NextResponse.json(response.data, { status: 200 });

    } catch (error: any) {
        console.error('WhatsApp API Error:', error.response?.data || error.message);
        return NextResponse.json({
            error: 'Failed to send WhatsApp message',
            details: error.response?.data || error.message
        }, { status: 500 });
    }
    } catch (error) {
        console.error('Error in WhatsApp API:', error);
        return NextResponse.json(
            { error: 'Failed to process WhatsApp request' },
            { status: 500 }
        );
    }
}
