import Constants from 'expo-constants';

// API Configuration
export const API_CONFIG = {
  baseURL: Constants.expoConfig?.extra?.apiBaseUrl || 'http://localhost:8000/api/v1',
  timeout: parseInt(Constants.expoConfig?.extra?.apiTimeout || '10000', 10),
  defaultHeaders: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

// Debug: Log the configuration on load
console.log('API_CONFIG loaded:', {
  baseURL: API_CONFIG.baseURL,
  expoConfigExtra: Constants.expoConfig?.extra,
  constantsLoaded: !!Constants.expoConfig
});

// API Error Types
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
}

export class ApiErrorHandler extends Error {
  status?: number;
  code?: string;
  details?: any;

  constructor(message: string, status?: number, code?: string, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

// HTTP Methods
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// Request Options
export interface RequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
  params?: Record<string, any>;
  signal?: AbortSignal;
}

// Response wrapper
export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

/**
 * Creates a formatted URL with query parameters
 */
function createURL(endpoint: string, params?: Record<string, any>): string {
  // Remove leading slash from endpoint if present to ensure proper concatenation
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  
  // Ensure baseURL ends with a slash for proper URL joining
  const baseURL = API_CONFIG.baseURL.endsWith('/') ? API_CONFIG.baseURL : `${API_CONFIG.baseURL}/`;
  
  console.log('createURL debug:', {
    originalEndpoint: endpoint,
    cleanEndpoint,
    baseURL,
    finalURL: new URL(cleanEndpoint, baseURL).toString()
  });
  
  const url = new URL(cleanEndpoint, baseURL);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }
  
  return url.toString();
}

/**
 * Processes and handles different types of API errors
 */
function handleApiError(error: any, status?: number): never {
  console.error('API Error:', error);

  // Network errors
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    throw new ApiErrorHandler(
      'Network error. Please check your internet connection.',
      0,
      'NETWORK_ERROR',
      error
    );
  }

  // Timeout errors
  if (error.name === 'AbortError') {
    throw new ApiErrorHandler(
      'Request timeout. Please try again.',
      408,
      'TIMEOUT_ERROR',
      error
    );
  }

  // HTTP errors
  if (status) {
    switch (status) {
      case 400:
        throw new ApiErrorHandler(
          'Bad request. Please check your input.',
          400,
          'BAD_REQUEST',
          error
        );
      case 401:
        throw new ApiErrorHandler(
          'Unauthorized. Please login again.',
          401,
          'UNAUTHORIZED',
          error
        );
      case 403:
        throw new ApiErrorHandler(
          'Forbidden. You do not have permission to access this resource.',
          403,
          'FORBIDDEN',
          error
        );
      case 404:
        throw new ApiErrorHandler(
          'Resource not found.',
          404,
          'NOT_FOUND',
          error
        );
      case 422:
        throw new ApiErrorHandler(
          'Validation error. Please check your input.',
          422,
          'VALIDATION_ERROR',
          error
        );
      case 429:
        throw new ApiErrorHandler(
          'Too many requests. Please try again later.',
          429,
          'RATE_LIMIT_EXCEEDED',
          error
        );
      case 500:
        throw new ApiErrorHandler(
          'Internal server error. Please try again later.',
          500,
          'INTERNAL_SERVER_ERROR',
          error
        );
      case 502:
        throw new ApiErrorHandler(
          'Bad gateway. Service temporarily unavailable.',
          502,
          'BAD_GATEWAY',
          error
        );
      case 503:
        throw new ApiErrorHandler(
          'Service unavailable. Please try again later.',
          503,
          'SERVICE_UNAVAILABLE',
          error
        );
      default:
        throw new ApiErrorHandler(
          `HTTP error ${status}: ${error.message || 'Unknown error'}`,
          status,
          'HTTP_ERROR',
          error
        );
    }
  }

  // Generic error
  throw new ApiErrorHandler(
    error.message || 'An unexpected error occurred',
    undefined,
    'UNKNOWN_ERROR',
    error
  );
}

/**
 * Makes an API request with comprehensive error handling
 */
export async function makeApiRequest<T = any>(
  endpoint: string,
  method: HttpMethod = 'GET',
  body?: any,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const {
    headers: customHeaders = {},
    timeout = API_CONFIG.timeout,
    params,
    signal,
  } = options;

  // Create abort controller for timeout if no signal provided
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  const requestSignal = signal || controller.signal;

  try {
    // Prepare headers
    const headers = {
      ...API_CONFIG.defaultHeaders,
      ...customHeaders,
    };

    // Prepare request options
    const requestOptions: RequestInit = {
      method,
      headers,
      signal: requestSignal,
    };

    // Add body for non-GET requests
    if (body && method !== 'GET') {
      if (body instanceof FormData) {
        // Remove Content-Type for FormData (browser will set it with boundary)
        const { 'Content-Type': _, ...headersWithoutContentType } = headers;
        requestOptions.headers = headersWithoutContentType;
        requestOptions.body = body;
      } else {
        requestOptions.body = JSON.stringify(body);
      }
    }

    // Create URL with parameters
    const url = createURL(endpoint, params);

    console.log(`API Request: ${method} ${url}`);

    // Make the request
    const response = await fetch(url, requestOptions);

    // Clear timeout
    clearTimeout(timeoutId);

    // Check if response is ok
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: response.statusText };
      }
      handleApiError(errorData, response.status);
    }

    // Parse response
    let data: T;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text() as any;
    }

    // Convert headers to object
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    console.log(`API Response: ${response.status} ${response.statusText}`);

    return {
      data,
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    };

  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof ApiErrorHandler) {
      throw error;
    }
    
    handleApiError(error);
  }
}

// Convenience methods for common HTTP operations
export const api = {
  /**
   * GET request
   */
  get: <T = any>(endpoint: string, options?: RequestOptions) =>
    makeApiRequest<T>(endpoint, 'GET', undefined, options),

  /**
   * POST request
   */
  post: <T = any>(endpoint: string, body?: any, options?: RequestOptions) =>
    makeApiRequest<T>(endpoint, 'POST', body, options),

  /**
   * PUT request
   */
  put: <T = any>(endpoint: string, body?: any, options?: RequestOptions) =>
    makeApiRequest<T>(endpoint, 'PUT', body, options),

  /**
   * PATCH request
   */
  patch: <T = any>(endpoint: string, body?: any, options?: RequestOptions) =>
    makeApiRequest<T>(endpoint, 'PATCH', body, options),

  /**
   * DELETE request
   */
  delete: <T = any>(endpoint: string, options?: RequestOptions) =>
    makeApiRequest<T>(endpoint, 'DELETE', undefined, options),
};

// Helper function to check if error is an API error
export function isApiError(error: any): error is ApiErrorHandler {
  return error instanceof ApiErrorHandler;
}

// Helper function to get error message
export function getErrorMessage(error: any): string {
  if (isApiError(error)) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
}

export default api;
