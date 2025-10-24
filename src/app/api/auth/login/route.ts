
import { NextRequest } from 'next/server';
import { supabaseService } from '@/lib/supabase/service';
import { ApiResponse } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    const { username, pin } = await request.json();

    // Validate input
    if (!username || !pin) {
      return ApiResponse.badRequest('Username and PIN are required');
    }

    // Authenticate clinic using database function
    const { data: authResult, error: authError } = await supabaseService.supabase
      .rpc('authenticate_clinic', {
        p_username: username,
        p_pin: pin
      });

    if (authError) {
      console.error('Authentication error:', authError);
      return ApiResponse.internalServerError('Authentication service error');
    }

    // Check authentication result
    if (!authResult || authResult.length === 0 || !authResult[0].is_authenticated) {
      return ApiResponse.unauthorized('Invalid username or PIN');
    }

    const clinic = authResult[0];

    // On success, return user, token, and tenant information
    return ApiResponse.success({
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
    return ApiResponse.internalServerError('Internal server error');
  }
}
