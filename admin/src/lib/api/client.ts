import { ApiEnvelope } from '../types/auth';

const getApiBaseUrl = (): string => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!envUrl) {
    return 'http://localhost:5000/api/v1';
  }
  return envUrl.replace(/\/+$/, '');
};

const API_BASE_URL = getApiBaseUrl();

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

// In-memory token storage (synced with both sessionStorage and localStorage for persistence and multi-tab sync)
let memoryToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  memoryToken = token;
  if (typeof window !== 'undefined') {
    try {
      if (token) {
        sessionStorage.setItem('erkab_admin_token', token);
        localStorage.setItem('erkab_admin_token', token);
      } else {
        sessionStorage.removeItem('erkab_admin_token');
        localStorage.removeItem('erkab_admin_token');
      }
    } catch {
      // Ignore storage quota or access errors in restricted browser contexts
    }
  }
};

export const getAuthToken = (): string | null => {
  if (memoryToken) return memoryToken;
  if (typeof window !== 'undefined') {
    try {
      memoryToken = sessionStorage.getItem('erkab_admin_token') || localStorage.getItem('erkab_admin_token');
    } catch {
      memoryToken = null;
    }
  }
  return memoryToken;
};

export async function apiClient<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  let cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  // Prevent duplicate prefixes if both API_BASE_URL and endpoint contain /api/v1 or /api
  if (API_BASE_URL.endsWith('/api/v1') && cleanEndpoint.startsWith('/api/v1/')) {
    cleanEndpoint = cleanEndpoint.substring('/api/v1'.length);
  } else if (API_BASE_URL.endsWith('/api') && cleanEndpoint.startsWith('/api/')) {
    cleanEndpoint = cleanEndpoint.substring('/api'.length);
  }

  const url = `${API_BASE_URL}${cleanEndpoint}`;

  const headers: Record<string, string> = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
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
