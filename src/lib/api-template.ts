// Standard API route template for consistency
import { NextRequest } from 'next/server';
import { supabaseService } from './supabase/service';
import { validateClinicId, validateRequiredFields } from './api-utils';
import { ApiResponse } from './api-response';

// Template for GET routes
export const createGetHandler = (
  serviceMethod: (clinicId: string, ...args: any[]) => Promise<any>,
  additionalValidation?: (request: NextRequest) => { error: any } | null
) => {
  return async (request: NextRequest) => {
    try {
      // Validate clinic ID
      const { error: clinicError, clinicId } = validateClinicId(request);
      if (clinicError) return clinicError;

      // Additional validation if provided
      if (additionalValidation) {
        const validationError = additionalValidation(request);
        if (validationError) return validationError.error;
      }

      // Extract additional parameters from URL
      const { searchParams } = new URL(request.url);
      const params = Object.fromEntries(searchParams.entries());

      // Call service method
      const data = await serviceMethod(clinicId, params);
      
      return ApiResponse.success(data);
    } catch (error) {
      console.error('API Error:', error);
      return ApiResponse.internalServerError('Failed to fetch data');
    }
  };
};

// Template for POST routes
export const createPostHandler = (
  serviceMethod: (clinicId: string, data: any) => Promise<any>,
  requiredFields: string[] = []
) => {
  return async (request: NextRequest) => {
    try {
      // Validate clinic ID
      const { error: clinicError, clinicId } = validateClinicId(request);
      if (clinicError) return clinicError;

      // Parse request body
      const data = await request.json();

      // Validate required fields
      const validationError = validateRequiredFields(data, requiredFields);
      if (validationError) return validationError;

      // Call service method
      const result = await serviceMethod(clinicId, data);
      
      return ApiResponse.created(result);
    } catch (error) {
      console.error('API Error:', error);
      return ApiResponse.internalServerError('Failed to create resource');
    }
  };
};

// Template for PUT routes
export const createPutHandler = (
  serviceMethod: (id: string, clinicId: string, data: any) => Promise<any>,
  requiredFields: string[] = []
) => {
  return async (request: NextRequest, { params }: { params: { id: string } }) => {
    try {
      // Validate clinic ID
      const { error: clinicError, clinicId } = validateClinicId(request);
      if (clinicError) return clinicError;

      // Validate ID parameter
      const { id } = params;
      if (!id) {
        return ApiResponse.badRequest('ID parameter is required');
      }

      // Parse request body
      const data = await request.json();

      // Validate required fields
      const validationError = validateRequiredFields(data, requiredFields);
      if (validationError) return validationError;

      // Call service method
      const result = await serviceMethod(id, clinicId, data);
      
      return ApiResponse.success(result);
    } catch (error) {
      console.error('API Error:', error);
      return ApiResponse.internalServerError('Failed to update resource');
    }
  };
};

// Template for DELETE routes
export const createDeleteHandler = (
  serviceMethod: (id: string, clinicId: string) => Promise<any>
) => {
  return async (request: NextRequest, { params }: { params: { id: string } }) => {
    try {
      // Validate clinic ID
      const { error: clinicError, clinicId } = validateClinicId(request);
      if (clinicError) return clinicError;

      // Validate ID parameter
      const { id } = params;
      if (!id) {
        return ApiResponse.badRequest('ID parameter is required');
      }

      // Call service method
      await serviceMethod(id, clinicId);
      
      return ApiResponse.noContent();
    } catch (error) {
      console.error('API Error:', error);
      return ApiResponse.internalServerError('Failed to delete resource');
    }
  };
};

// Example usage:
/*
// GET /api/doctors
export const GET = createGetHandler(
  (clinicId, params) => supabaseService.getDoctors(clinicId, params.status)
);

// POST /api/doctors
export const POST = createPostHandler(
  (clinicId, data) => supabaseService.createDoctor(clinicId, data),
  ['name', 'specialty']
);

// PUT /api/doctors/[id]
export const PUT = createPutHandler(
  (id, clinicId, data) => supabaseService.updateDoctor(id, clinicId, data),
  ['name']
);
*/

