/**
 * API Client for UniTrack Backend
 * Handles HTTP requests to the FastAPI backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';

export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * Base fetch wrapper with error handling
 */
const MAX_RETRIES = 1;
const RETRY_DELAY_MS = 400;

async function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  // Get token from localStorage if available
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add auth token if available
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

    // Handle non-JSON responses (like 204 No Content)
    if (response.status === 204) {
      return {} as T;
    }

    // Try to parse JSON response
    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      // If JSON parsing fails, get text for better error message
      const text = await response.text();
      throw new APIError(
        `Invalid JSON response from server. Status: ${response.status}. Response: ${text.substring(0, 200)}`,
        response.status,
        { text, jsonError }
      );
    }

      if (!response.ok) {
        // Normalize FastAPI error shapes to a readable string
        let message: string;
        const detail = (data && (data.detail ?? data.error ?? data.message)) as any;

      if (Array.isArray(detail)) {
        // FastAPI validation errors array
        message = detail
          .map((e: any) => {
            const loc = Array.isArray(e?.loc) ? e.loc.join('.') : e?.loc;
            const msg = e?.msg || e?.message || JSON.stringify(e);
            return loc ? `${loc}: ${msg}` : String(msg);
          })
          .join('; ');
      } else if (detail && typeof detail === 'object') {
        message = detail.message || detail.error || JSON.stringify(detail);
      } else {
        message = detail || data?.message || `Request failed with status ${response.status}`;
      }

        throw new APIError(message, response.status, data);
      }

      return data;
    } catch (error: any) {
      // Retry once on network/temporary errors
      const msg = (error?.message || '').toLowerCase();
      const isApiError = error instanceof APIError;
      const isNetworkError = !isApiError && (msg.includes('failed to fetch') || msg.includes('network') || msg.includes('aborted'));

      if (isNetworkError && attempt < MAX_RETRIES) {
        await delay(RETRY_DELAY_MS);
        continue;
      }

      if (isApiError) throw error;
      console.error('API Fetch Error:', error);
      throw new APIError(error instanceof Error ? error.message : 'Network error', undefined, error);
    }
  }
  // Unreachable
  throw new APIError('Network error', undefined);
}

/**
 * API client methods
 */
export const api = {
  // GET request
  get: <T>(endpoint: string, options?: RequestInit) =>
    apiFetch<T>(endpoint, { ...options, method: 'GET' }),

  // POST request
  post: <T>(endpoint: string, data?: any, options?: RequestInit) =>
    apiFetch<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),

  // PUT request
  put: <T>(endpoint: string, data?: any, options?: RequestInit) =>
    apiFetch<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),

  // DELETE request
  delete: <T>(endpoint: string, options?: RequestInit) =>
    apiFetch<T>(endpoint, { ...options, method: 'DELETE' }),
};

/**
 * Health check
 */
export async function checkHealth() {
  return api.get<{ status: string; timestamp: string }>('/health');
}
