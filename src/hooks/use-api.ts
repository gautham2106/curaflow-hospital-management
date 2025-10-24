
'use client';

import { useCallback } from 'react';

type FetchOptions = {
  headers?: Record<string, string>;
  method?: string;
  body?: any;
};

// Custom hook to add clinicId to every API request
export const useFetch = () => {

  const makeRequest = useCallback(async (path: string, options: FetchOptions = {}) => {
    const clinicId = sessionStorage.getItem('clinicId');
    if (!clinicId) {
      console.error("No clinicId found in session storage for API call");
      // In a real app, you might want to redirect to login here
      return; 
    }

    const defaultHeaders = {
      'Content-Type': 'application/json',
      'x-clinic-id': clinicId,
    };
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    return fetch(path, config);
  }, []);

  const get = useCallback(async (path: string, queryParams = {}) => {
    const url = new URL(path, window.location.origin);
    Object.entries(queryParams).forEach(([key, value]) => {
      url.searchParams.append(key, String(value));
    });
    return makeRequest(url.toString(), { method: 'GET' });
  }, [makeRequest]);

  const post = useCallback(async (path: string, body: any) => {
    return makeRequest(path, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }, [makeRequest]);
  
  const put = useCallback(async (path: string, body: any) => {
    return makeRequest(path, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }, [makeRequest]);

  const del = useCallback(async (path: string, options: FetchOptions = {}) => {
    return makeRequest(path, {
      ...options,
      method: 'DELETE',
    });
  }, [makeRequest]);

  return { get, post, put, del };
};
