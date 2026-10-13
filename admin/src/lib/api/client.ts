import { ApiEnvelope } from '../types/auth';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1').replace(/\/+$/, '');

export class ApiError extends Error {
  statusCode: number;
  data: any;

  constructor(message: string, statusCode: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.data = data;
  }
}

// In-memory token storage (also synced with sessionStorage for page refreshes)
let memoryToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  memoryToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      sessionStorage.setItem('erkab_admin_token', token);
    } else {
      sessionStorage.removeItem('erkab_admin_token');
    }
  }
};

export const getAuthToken = (): string | null => {
  if (memoryToken) return memoryToken;
  if (typeof window !== 'undefined') {
    memoryToken = sessionStorage.getItem('erkab_admin_token');
  }
  return memoryToken;
};

export async function apiClient<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  const token = getAuthToken();
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    credentials: 'include', // Ensure HttpOnly cookies are transmitted
    headers,
  });

  const contentType = response.headers.get('content-type') || '';
  let responseData: any = null;

  if (contentType.includes('application/json')) {
    responseData = await response.json();
  } else {
    const text = await response.text();
    responseData = { message: text };
  }

  if (!response.ok) {
    const errorMessage =
      responseData?.message ||
      responseData?.error ||
      `Request failed with status ${response.status}`;
    throw new ApiError(errorMessage, response.status, responseData);
  }

  return responseData;
}
