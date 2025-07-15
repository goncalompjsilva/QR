import { useState, useEffect, useCallback } from 'react';
import { api, isApiError, getErrorMessage, ApiResponse, RequestOptions } from './api';

// Hook state interface
interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  status: number | null;
}

// Hook options
interface UseApiOptions extends RequestOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

/**
 * Custom hook for API requests with loading and error states
 */
export function useApi<T = any>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET',
  options: UseApiOptions = {}
) {
  const { immediate = true, onSuccess, onError, ...requestOptions } = options;

  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
    status: null,
  });

  const execute = useCallback(async (body?: any) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      let response: ApiResponse<T>;

      switch (method) {
        case 'POST':
          response = await api.post<T>(endpoint, body, requestOptions);
          break;
        case 'PUT':
          response = await api.put<T>(endpoint, body, requestOptions);
          break;
        case 'PATCH':
          response = await api.patch<T>(endpoint, body, requestOptions);
          break;
        case 'DELETE':
          response = await api.delete<T>(endpoint, requestOptions);
          break;
        default:
          response = await api.get<T>(endpoint, requestOptions);
      }

      setState({
        data: response.data,
        loading: false,
        error: null,
        status: response.status,
      });

      onSuccess?.(response.data);
      return response.data;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      const status = isApiError(error) ? error.status || null : null;

      setState({
        data: null,
        loading: false,
        error: errorMessage,
        status,
      });

      onError?.(error);
      throw error;
    }
  }, [endpoint, method, requestOptions, onSuccess, onError]);

  useEffect(() => {
    if (immediate && method === 'GET') {
      execute();
    }
  }, [execute, immediate, method]);

  return {
    ...state,
    execute,
    refetch: execute,
  };
}

/**
 * Hook for managing form submissions
 */
export function useApiSubmit<T = any>(
  endpoint: string,
  method: 'POST' | 'PUT' | 'PATCH' = 'POST',
  options: UseApiOptions = {}
) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
    status: null,
  });

  const submit = useCallback(async (formData: any) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      let response: ApiResponse<T>;

      switch (method) {
        case 'PUT':
          response = await api.put<T>(endpoint, formData, options);
          break;
        case 'PATCH':
          response = await api.patch<T>(endpoint, formData, options);
          break;
        default:
          response = await api.post<T>(endpoint, formData, options);
      }

      setState({
        data: response.data,
        loading: false,
        error: null,
        status: response.status,
      });

      options.onSuccess?.(response.data);
      return response.data;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      const status = isApiError(error) ? error.status || null : null;

      setState({
        data: null,
        loading: false,
        error: errorMessage,
        status,
      });

      options.onError?.(error);
      throw error;
    }
  }, [endpoint, method, options]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      status: null,
    });
  }, []);

  return {
    ...state,
    submit,
    reset,
  };
}

/**
 * Hook for pagination
 */
export function useApiPagination<T = any>(
  endpoint: string,
  options: UseApiOptions & { pageSize?: number } = {}
) {
  const { pageSize = 10, ...apiOptions } = options;
  const [page, setPage] = useState(1);
  const [allData, setAllData] = useState<T[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const { data, loading, error, execute } = useApi<{
    items: T[];
    total: number;
    page: number;
    pageSize: number;
  }>(
    endpoint,
    'GET',
    {
      ...apiOptions,
      params: {
        ...apiOptions.params,
        page,
        pageSize,
      },
      immediate: false,
    }
  );

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    try {
      await execute();
    } catch (error) {
      console.error('Failed to load more data:', getErrorMessage(error));
    }
  }, [execute, loading, hasMore]);

  const refresh = useCallback(() => {
    setPage(1);
    setAllData([]);
    setHasMore(true);
    execute();
  }, [execute]);

  useEffect(() => {
    if (data) {
      if (page === 1) {
        setAllData(data.items);
      } else {
        setAllData(prev => [...prev, ...data.items]);
      }
      setHasMore(data.items.length === pageSize);
    }
  }, [data, page, pageSize]);

  useEffect(() => {
    execute();
  }, [page]);

  return {
    data: allData,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    nextPage: () => setPage(prev => prev + 1),
  };
}

export default {
  useApi,
  useApiSubmit,
  useApiPagination,
};
