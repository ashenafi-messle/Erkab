import { ApiError } from './errors';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
}

export async function apiClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, headers, ...customConfig } = options;

  let url = `${BASE_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      searchParams.append(key, String(val));
    });
    url += `?${searchParams.toString()}`;
  }

  const isFormData = customConfig.body instanceof FormData;

  const config: RequestInit = {
    ...customConfig,
    headers: {
      ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
      Accept: 'application/json',
      ...headers,
    },
  };

  try {
    const res = await fetch(url, config);

    if (!res.ok) {
      let errorData: any;
      try {
        errorData = await res.json();
      } catch {
        // Response was not JSON
      }

      const validationDetails = Array.isArray(errorData?.error?.details)
        ? errorData.error.details.map((d: any) => `${d.field ? d.field + ': ' : ''}${d.message}`).join(', ')
        : null;

      const message =
        validationDetails ||
        errorData?.error?.message ||
        errorData?.message ||
        `HTTP Request failed with status ${res.status}`;

      throw new ApiError(message, res.status, errorData);
    }

    return (await res.json()) as T;
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      throw err;
    }
    const message = err instanceof Error ? err.message : 'Network error or backend unreachable';
    throw new ApiError(message, 0);
  }
}
