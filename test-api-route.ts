// =====================================================
// SIMPLE SUPERADMIN TEST API
// =====================================================
// 
// Copy this code to: src/app/api/superadmin/test/route.ts
// This will test if the database function works from Vercel
// =====================================================

import { NextRequest } from 'next/server';
import { supabaseService } from '@/lib/supabase/service';
import { ApiResponse } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return ApiResponse.badRequest('Username and password are required');
    }

    // Test the database function directly
    const { data: authResult, error: authError } = await supabaseService.supabase
      .rpc('authenticate_superadmin', {
        p_user: username,
        p_pass: password
      });

    if (authError) {
      console.error('Database function error:', authError);
      return ApiResponse.internalServerError(`Database error: ${authError.message}`);
    }

    if (!authResult || authResult.length === 0 || !authResult[0].is_authenticated) {
      return ApiResponse.unauthorized('Invalid username or password');
    }

    const superadmin = authResult[0];

    return ApiResponse.success({
      success: true,
      message: 'Database function works!',
      superadmin: {
        id: superadmin.superadmin_id,
        name: superadmin.full_name,
        username: superadmin.username,
        email: superadmin.email,
        role: 'superadmin'
      },
      token: superadmin.token
    });

  } catch (error) {
    console.error('Test API error:', error);
    return ApiResponse.internalServerError(`Test error: ${error.message}`);
  }
}
