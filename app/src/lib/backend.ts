import { fetch } from '@tauri-apps/plugin-http';
import { settingsStore } from './stores/settings.svelte';
import type { Todo, CreateTodoRequest, UpdateTodoRequest } from './types';

// API Response wrapper from server
interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

// Check if running in Tauri environment
const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

async function getBaseUrl() {
  const url = settingsStore.backendUrl;
  if (!url) return null;
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

async function getUserId() {
  return settingsStore.userId || 'default-user';
}

async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T | null> {
  const baseUrl = await getBaseUrl();
  if (!baseUrl) {
    console.warn('[API] No base URL configured');
    return null;
  }

  const url = `${baseUrl}${path}`;
  const userId = await getUserId();
  
  const headers = {
    ...options.headers,
    'Content-Type': 'application/json',
    'X-User-ID': userId
  };

  console.log(`[API] ${options.method || 'GET'} ${url}`);

  try {
    let response;
    if (isTauri) {
      console.log('[API] Using Tauri HTTP plugin');
      response = await fetch(url, {
        ...options,
        headers
      });
    } else {
      console.log('[API] Using browser fetch');
      response = await window.fetch(url, {
        ...options,
        headers
      });
    }

    console.log(`[API] Response: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[API] Error (${response.status}): ${errorText}`);
      return null;
    }

    const apiResponse = await response.json() as ApiResponse<T>;
    if (!apiResponse.success) {
      console.error(`[API] API Error for ${path}:`, apiResponse.error);
      return null;
    }
    console.log(`[API] Success:`, apiResponse.data);
    return apiResponse.data as T;
  } catch (error) {
    console.error(`[API] Request failed for ${path}:`, error);
    return null;
  }
}

export const backendApi = {
  async healthCheck(): Promise<boolean> {
    const baseUrl = await getBaseUrl();
    if (!baseUrl) return false;
    
    try {
      const url = `${baseUrl}/health`;
      const response = await (isTauri ? fetch(url) : window.fetch(url));
      console.log(`Health check to ${url}: ${response.status} ${response.ok}`);
      return response.ok;
    } catch (e) {
      console.error('Health check failed:', e);
      return false;
    }
  },

  async getTodos(): Promise<Todo[] | null> {
    const userId = await getUserId();
    return apiRequest<Todo[]>(`/api/users/${userId}/todos`);
  },

  async createTodo(request: CreateTodoRequest): Promise<Todo | null> {
    const userId = await getUserId();
    return apiRequest<Todo>(`/api/users/${userId}/todos`, {
      method: 'POST',
      body: JSON.stringify(request)
    });
  },

  async updateTodo(id: string, request: UpdateTodoRequest): Promise<Todo | null> {
    const userId = await getUserId();
    return apiRequest<Todo>(`/api/users/${userId}/todos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(request)
    });
  },

  async deleteTodo(id: string): Promise<boolean> {
    const userId = await getUserId();
    const result = await apiRequest<any>(`/api/users/${userId}/todos/${id}`, {
      method: 'DELETE'
    });
    return result !== null;
  },

  async syncTodos(todos: Todo[], lastSync?: string): Promise<{ todos: Todo[], sync_time: string } | null> {
    const userId = await getUserId();
    return apiRequest<{ todos: Todo[], sync_time: string }>(`/api/users/${userId}/sync`, {
      method: 'POST',
      body: JSON.stringify({
        last_sync: lastSync,
        todos: todos
      })
    });
  }
};
