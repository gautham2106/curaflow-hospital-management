import { NextResponse } from 'next/server';

// Standardized API response helper for consistency
export class ApiResponse {
  // Success responses
  static success(data: any, status: number = 200) {
    return NextResponse.json(data, { status });
  }

  static created(data: any) {
    return NextResponse.json(data, { status: 201 });
  }

  static noContent() {
    return NextResponse.json(null, { status: 204 });
  }

  // Error responses
  static badRequest(message: string, details?: any) {
    return NextResponse.json(
      { 
        error: message,
        ...(details && { details })
      },
      { status: 400 }
    );
  }

  static unauthorized(message: string = 'Unauthorized') {
    return NextResponse.json(
      { error: message },
      { status: 401 }
    );
  }

  static forbidden(message: string = 'Forbidden') {
    return NextResponse.json(
      { error: message },
      { status: 403 }
    );
  }

  static notFound(message: string = 'Resource not found') {
    return NextResponse.json(
      { error: message },
      { status: 404 }
    );
  }

  static conflict(message: string, details?: any) {
    return NextResponse.json(
      { 
        error: message,
        ...(details && { details })
      },
      { status: 409 }
    );
  }

  static unprocessableEntity(message: string, details?: any) {
    return NextResponse.json(
      { 
        error: message,
        ...(details && { details })
      },
      { status: 422 }
    );
  }

  static internalServerError(message: string = 'Internal server error', details?: any) {
    return NextResponse.json(
      { 
        error: message,
        ...(details && { details })
      },
      { status: 500 }
    );
  }

  static serviceUnavailable(message: string = 'Service unavailable') {
    return NextResponse.json(
      { error: message },
      { status: 503 }
    );
  }

  // Validation error response
  static validationError(errors: Record<string, string[]>) {
    return NextResponse.json(
      { 
        error: 'Validation failed',
        details: errors
      },
      { status: 422 }
    );
  }

  // Custom error response
  static error(message: string, status: number, details?: any) {
    return NextResponse.json(
      { 
        error: message,
        ...(details && { details })
      },
      { status }
    );
  }
}

// Common validation helpers
export const validateRequired = (value: any, fieldName: string): string | null => {
  if (value === undefined || value === null || value === '') {
    return `${fieldName} is required`;
  }
  return null;
};

export const validateEmail = (email: string): string | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Invalid email format';
  }
  return null;
};

export const validatePhone = (phone: string): string | null => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
    return 'Invalid phone number format';
  }
  return null;
};

export const validateUUID = (uuid: string): string | null => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(uuid)) {
    return 'Invalid UUID format';
  }
  return null;
};

