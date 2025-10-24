import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    const { tokenData, sessionTimeRange, clinicName } = await request.json();

    const accessToken = 'EAAQzPY217joBPghgZAIW1IQ1u7OlHDH419Y6LQDbJj9aJ1xwgY1zwWCdV1l35yRrYTqy76UwZCZCIsLQzejlv5ro5hEiyNrtSZBx8VyBfJTimZBN7jXjA4ZCBpWbZBLRD35MZCGEPinPoMPGrch7A4B1iqKoaj7TZCIUs80x4Xy4P2b8Cp6eHUjZCbylkTkBpiSHTYNAZDZD';
    const phoneId = '591459790706231';
    const endpointUrl = `https://graph.facebook.com/v22.0/${phoneId}/messages`;

    // Construct the tracking URL
    const trackingUrl = (typeof window !== 'undefined' && tokenData.clinicId)
      ? `${window.location.origin}/display?clinicId=${tokenData.clinicId}&doctorId=${tokenData.doctor.id}&date=${new Date(tokenData.date).toISOString().split('T')[0]}&session=${tokenData.session}&tokenId=${tokenData.id}`
      : `http://localhost:3000/display?clinicId=curaflow-central&doctorId=${tokenData.doctor.id}&date=${new Date(tokenData.date).toISOString().split('T')[0]}&session=${tokenData.session}&tokenId=${tokenData.id}`; // Fallback for server-side

    const parameters = [
        { type: 'text', text: tokenData.patientName },
        { type: 'text', text: clinicName },
        { type: 'text', text: String(tokenData.tokenNumber) },
        { type: 'text', text: tokenData.doctor.name },
        { type: 'text', text: tokenData.doctor.specialty },
        { type: 'text', text: new Date(tokenData.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) },
        { type: 'text', text: tokenData.session },
        { type: 'text', text: sessionTimeRange },
        { type: 'text', text: trackingUrl },
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
        const response = await fetch(endpointUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(messagePayload)
        });
        
        const responseData = await response.json();
        
        if (!response.ok) {
            throw new Error(`WhatsApp API Error: ${response.status} - ${JSON.stringify(responseData)}`);
        }
        
        return NextResponse.json(responseData, { status: 200 });

    } catch (error: any) {
        console.error('WhatsApp API Error:', error.message);
        return NextResponse.json({
            message: 'Failed to send WhatsApp message',
            error: error.message
        }, { status: 500 });
    }
}