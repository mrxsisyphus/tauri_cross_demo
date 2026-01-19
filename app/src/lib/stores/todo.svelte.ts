import type { Todo, CreateTodoRequest, UpdateTodoRequest, FilterType, SortType } from '$types';
import { backendApi } from '../backend';
import { settingsStore } from './settings.svelte';

// Check if running in Tauri environment
const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

// Svelte 5 reactive state
let todos = $state<Todo[]>([]);
let filter = $state<FilterType>('all');
let sortBy = $state<SortType>('created');
let searchQuery = $state('');
let isLoading = $state(false);
let isSyncing = $state(false);

// Tauri invoke helper
async function invoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
  if (isTauri) {
    const { invoke } = await import('@tauri-apps/api/core');
    return invoke<T>(cmd, args);
  }
  throw new Error('Not running in Tauri environment');
}

// Derived state
function getFilteredTodos(): Todo[] {
  let result = [...todos];

  // Apply search filter
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    result = result.filter(
      (todo) =>
        todo.title.toLowerCase().includes(query) ||
        todo.description?.toLowerCase().includes(query)
    );
  }

  // Apply status filter
  switch (filter) {
    case 'active':
      result = result.filter((todo) => !todo.completed);
      break;
    case 'completed':
      result = result.filter((todo) => todo.completed);
      break;
  }

  // Apply sorting
  result.sort((a, b) => {
    switch (sortBy) {
      case 'priority': {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      case 'due_date': {
        if (!a.due_date && !b.due_date) return 0;
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      }
      case 'title':
        return a.title.localeCompare(b.title);
      case 'created':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  return result;
}

function getStats() {
  const total = todos.length;
  const completed = todos.filter((t) => t.completed).length;
  const active = total - completed;
  const highPriority = todos.filter((t) => t.priority === 'high' && !t.completed).length;
  return { total, completed, active, highPriority };
}

// Actions
async function loadTodos(): Promise<void> {
  isLoading = true;
  try {
    if (!isTauri) {
      // Load from localStorage for web
      const stored = localStorage.getItem('todos');
      if (stored) {
        todos = JSON.parse(stored);
      }
    } else {
      todos = await invoke<Todo[]>('get_todos');
    }

    // Try to sync with backend if configured
    if (settingsStore.isConfigured) {
      await settingsStore.checkConnection();
      if (settingsStore.isConnected) {
        await syncWithBackend();
      }
    }
  } catch (error) {
    console.error('Failed to load todos:', error);
  } finally {
    isLoading = false;
  }
}

async function syncWithBackend(): Promise<void> {
  if (!settingsStore.isConfigured) return;
  
  isSyncing = true;
  try {
    const syncResult = await backendApi.syncTodos(todos);
    if (syncResult) {
      todos = syncResult.todos;
      
      // Update local storage/state
      if (isTauri) {
        await invoke('sync_local', { remoteTodos: todos });
      } else {
        saveTodosToLocalStorage();
      }
    }
  } catch (error) {
    console.error('Failed to sync with backend:', error);
  } finally {
    isSyncing = false;
  }
}

async function createTodo(request: CreateTodoRequest): Promise<Todo | undefined> {
  let newTodo: Todo | undefined;

  // 1. Create locally
  if (!isTauri) {
    newTodo = {
      id: crypto.randomUUID(),
      title: request.title,
      description: request.description,
      completed: false,
      priority: request.priority || 'medium',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      due_date: request.due_date
    };
    todos = [newTodo, ...todos];
    saveTodosToLocalStorage();
  } else {
    try {
      newTodo = await invoke<Todo>('create_todo', { request });
      todos = [newTodo, ...todos];
    } catch (error) {
      console.error('Failed to create todo locally:', error);
    }
  }

  // 2. Sync to backend if configured
  if (newTodo && settingsStore.isConfigured) {
    try {
      const remoteTodo = await backendApi.createTodo({
        ...request,
        id: newTodo.id
      });
      if (remoteTodo) {
        const index = todos.findIndex((t) => t.id === newTodo?.id);
        if (index !== -1) {
          todos[index] = remoteTodo;
          todos = [...todos];
        }
        return remoteTodo;
      }
    } catch (error) {
      console.error('Failed to sync create to backend:', error);
    }
  }

  return newTodo;
}

async function updateTodo(id: string, request: UpdateTodoRequest): Promise<Todo | undefined> {
  let updatedTodo: Todo | undefined;

  // 1. Update locally
  if (!isTauri) {
    const index = todos.findIndex((t) => t.id === id);
    if (index !== -1) {
      todos[index] = {
        ...todos[index],
        ...request,
        updated_at: new Date().toISOString()
      };
      todos = [...todos];
      saveTodosToLocalStorage();
      updatedTodo = todos[index];
    }
  } else {
    try {
      updatedTodo = await invoke<Todo>('update_todo', { id, request });
      const index = todos.findIndex((t) => t.id === id);
      if (index !== -1) {
        todos[index] = updatedTodo;
        todos = [...todos];
      }
    } catch (error) {
      console.error('Failed to update todo locally:', error);
    }
  }

  // 2. Sync to backend if configured
  if (settingsStore.isConfigured) {
    try {
      const remoteUpdated = await backendApi.updateTodo(id, request);
      if (remoteUpdated) {
        const index = todos.findIndex((t) => t.id === id);
        if (index !== -1) {
          todos[index] = remoteUpdated;
          todos = [...todos];
        }
        return remoteUpdated;
      }
    } catch (error) {
      console.error('Failed to sync update to backend:', error);
    }
  }

  return updatedTodo;
}

async function toggleTodo(id: string): Promise<void> {
  const todo = todos.find((t) => t.id === id);
  if (!todo) return;

  const newStatus = !todo.completed;
  await updateTodo(id, { completed: newStatus });
}

async function deleteTodo(id: string): Promise<void> {
  // 1. Delete locally
  if (!isTauri) {
    todos = todos.filter((t) => t.id !== id);
    saveTodosToLocalStorage();
  } else {
    try {
      await invoke('delete_todo', { id });
      todos = todos.filter((t) => t.id !== id);
    } catch (error) {
      console.error('Failed to delete todo locally:', error);
    }
  }

  // 2. Sync to backend if configured
  if (settingsStore.isConfigured) {
    try {
      await backendApi.deleteTodo(id);
    } catch (error) {
      console.error('Failed to sync delete to backend:', error);
    }
  }
}

async function clearCompleted(): Promise<void> {
  const completedIds = todos.filter((t) => t.completed).map((t) => t.id);

  // Local clear
  if (!isTauri) {
    todos = todos.filter((t) => !t.completed);
    saveTodosToLocalStorage();
  } else {
    try {
      todos = await invoke<Todo[]>('clear_completed');
    } catch (error) {
      console.error('Failed to clear completed locally:', error);
    }
  }

  // Backend clear
  if (settingsStore.isConfigured) {
    for (const id of completedIds) {
      await backendApi.deleteTodo(id);
    }
  }
}

function setFilter(newFilter: FilterType): void {
  filter = newFilter;
}

function setSortBy(newSort: SortType): void {
  sortBy = newSort;
}

function setSearchQuery(query: string): void {
  searchQuery = query;
}

function saveTodosToLocalStorage(): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('todos', JSON.stringify(todos));
  }
}

// Export store
export const todoStore = {
  get todos() {
    return todos;
  },
  get filteredTodos() {
    return getFilteredTodos();
  },
  get filter() {
    return filter;
  },
  get sortBy() {
    return sortBy;
  },
  get searchQuery() {
    return searchQuery;
  },
  get isLoading() {
    return isLoading;
  },
  get isSyncing() {
    return isSyncing;
  },
  get stats() {
    return getStats();
  },
  get isTauri() {
    return isTauri;
  },
  loadTodos,
  syncWithBackend,
  createTodo,
  updateTodo,
  toggleTodo,
  deleteTodo,
  clearCompleted,
  setFilter,
  setSortBy,
  setSearchQuery
};
