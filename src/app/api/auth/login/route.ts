
import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service';

export async function POST(request: Request) {
  try {
    const { username, pin } = await request.json();

    // Get clinics from database to get actual UUIDs
    const clinics = await supabaseService.getClinics();
    const curaflowClinic = clinics.find(c => c.name === 'CuraFlow Central Hospital');
    const sunriseClinic = clinics.find(c => c.name === 'Sunrise Medical Clinic');

    // Ensure we have valid clinic IDs
    if (!curaflowClinic || !sunriseClinic) {
      console.error('Clinic lookup failed:', { curaflowClinic, sunriseClinic });
      return NextResponse.json(
        { success: false, message: 'Clinic configuration error' },
        { status: 500 }
      );
    }

    // For now, keep the mock authentication for demo purposes
    // In production, you would use Supabase Auth with proper user management
    if (username === 'admin' && pin === '1234') {
      // On success, return user, token, and tenant information.
      return NextResponse.json({
        success: true,
        user: { name: 'Admin User', username: 'admin', role: 'admin' },
        token: 'mock-jwt-token-for-admin-user',
        clinic: {
          id: curaflowClinic.id,
          name: 'CuraFlow Central Hospital',
        }
      });
    } else if (username === 'sunrise-admin' && pin === '5678') {
        // Second tenant for testing
        return NextResponse.json({
            success: true,
            user: { name: 'Sunrise Admin', username: 'sunrise-admin', role: 'admin' },
            token: 'mock-jwt-token-for-sunrise-admin',
            clinic: {
                id: sunriseClinic.id,
                name: 'Sunrise Medical Clinic',
            }
        });
    }
    else {
      // On failure, return an unauthorized error.
      return NextResponse.json(
        { success: false, message: 'Invalid username or PIN' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
