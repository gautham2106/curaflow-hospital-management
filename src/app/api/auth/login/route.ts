
import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service';

export async function POST(request: NextRequest) {
  try {
    const { username, pin } = await request.json();

    // Validate input
    if (!username || !pin) {
      return NextResponse.json(
        { error: 'Username and PIN are required' },
        { status: 400 }
      );
    }

    // Authenticate clinic using database function
    const { data: authResult, error: authError } = await supabaseService.supabase
      .rpc('authenticate_clinic', { 
        p_username: username, 
        p_pin: pin 
      });

    if (authError) {
      console.error('Authentication error:', authError);
      return NextResponse.json(
        { error: 'Authentication service error' },
        { status: 500 }
      );
    }

    // Check authentication result
    if (!authResult || authResult.length === 0 || !authResult[0].is_authenticated) {
      return NextResponse.json(
        { error: 'Invalid username or PIN' },
        { status: 401 }
      );
    }

    const clinic = authResult[0];

    // On success, return user, token, and tenant information
    return NextResponse.json({
      success: true,
      user: { 
        name: clinic.admin_name, 
        username: username, 
        role: 'admin' 
      },
      token: `mock-jwt-token-for-${clinic.clinic_id}`,
      clinic: {
        id: clinic.clinic_id,
        name: clinic.clinic_name,
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
