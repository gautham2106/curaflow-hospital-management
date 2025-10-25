import { NextRequest, NextResponse } from 'next/server';

// Helper function to create TinyURL
async function createTinyUrl(longUrl: string): Promise<string> {
    try {
        const response = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`);
        const tinyUrl = await response.text();
        return tinyUrl.startsWith('http') ? tinyUrl : longUrl; // Fallback to original URL if TinyURL fails
    } catch (error) {
        console.error('Error creating TinyURL:', error);
        return longUrl; // Fallback to original URL
    }
}

export async function POST(request: NextRequest) {
    const { tokenData, sessionTimeRange, clinicName } = await request.json();

    const accessToken = 'EAAQzPY217joBPghgZAIW1IQ1u7OlHDH419Y6LQDbJj9aJ1xwgY1zwWCdV1l35yRrYTqy76UwZCZCIsLQzejlv5ro5hEiyNrtSZBx8VyBfJTimZBN7jXjA4ZCBpWbZBLRD35MZCGEPinPoMPGrch7A4B1iqKoaj7TZCIUs80x4Xy4P2b8Cp6eHUjZCbylkTkBpiSHTYNAZDZD';
    const phoneId = '591459790706231';
    const endpointUrl = `https://graph.facebook.com/v22.0/${phoneId}/messages`;

    // Construct the tracking URL with proper domain
    const baseUrl = process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}` 
        : 'https://curaflow-saas-5ishsvhl4-gs-projects-13b73890.vercel.app';
    
    const longUrl = `${baseUrl}/display?clinicId=${tokenData.clinicId}&doctorId=${tokenData.doctor.id}&date=${new Date(tokenData.date).toISOString().split('T')[0]}&session=${tokenData.session}&tokenId=${tokenData.id}`;
    
    // Create TinyURL for the tracking link
    const trackingUrl = await createTinyUrl(longUrl);

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