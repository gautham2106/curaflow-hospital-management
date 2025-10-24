import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        console.log('WhatsApp API - Request received');
        
        // Get clinic ID from headers
        const clinicId = request.headers.get('x-clinic-id');
        console.log('Clinic ID:', clinicId);
        
        if (!clinicId) {
            return NextResponse.json(
                { error: 'Clinic ID not found in request headers' },
                { status: 400 }
            );
        }

        // Parse request body
        const body = await request.json();
        console.log('Request body:', JSON.stringify(body, null, 2));

        // Simple validation
        if (!body.tokenData || !body.tokenData.patientName) {
            return NextResponse.json(
                { error: 'Missing required data' },
                { status: 400 }
            );
        }

        // Return success response
        return NextResponse.json({
            success: true,
            message: 'WhatsApp notification would be sent',
            data: {
                patientName: body.tokenData.patientName,
                clinicName: body.clinicName || 'Unknown Clinic',
                tokenNumber: body.tokenData.tokenNumber || 'N/A',
                doctorName: body.tokenData.doctor?.name || 'Unknown Doctor',
                session: body.tokenData.session || 'Unknown Session',
                phone: body.tokenData.phone || 'N/A'
            }
        });

    } catch (error) {
        console.error('Error in WhatsApp API:', error);
        return NextResponse.json(
            { error: 'Failed to process WhatsApp request' },
            { status: 500 }
        );
    }
}