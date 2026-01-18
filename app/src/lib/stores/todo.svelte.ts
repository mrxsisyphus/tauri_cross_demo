import type { Todo, CreateTodoRequest, UpdateTodoRequest, FilterType, SortType } from '$types';

// Check if running in Tauri environment
const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

// Svelte 5 reactive state
let todos = $state<Todo[]>([]);
let filter = $state<FilterType>('all');
let sortBy = $state<SortType>('created');
let searchQuery = $state('');
let isLoading = $state(false);

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
  if (!isTauri) {
    // Load from localStorage for web
    const stored = localStorage.getItem('todos');
    if (stored) {
      todos = JSON.parse(stored);
    }
    return;
  }

  try {
    isLoading = true;
    todos = await invoke<Todo[]>('get_todos');
  } catch (error) {
    console.error('Failed to load todos:', error);
  } finally {
    isLoading = false;
  }
}

async function createTodo(request: CreateTodoRequest): Promise<Todo | undefined> {
  console.log('todoStore.createTodo called', request);

  if (!isTauri) {
    // Create locally for web
    const newTodo: Todo = {
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
    return newTodo;
  }

  try {
    const newTodo = await invoke<Todo>('create_todo', { request });
    todos = [newTodo, ...todos];
    return newTodo;
  } catch (error) {
    console.error('Failed to create todo:', error);
  }
}

async function updateTodo(id: string, request: UpdateTodoRequest): Promise<Todo | undefined> {
  if (!isTauri) {
    // Update locally for web
    const index = todos.findIndex((t) => t.id === id);
    if (index !== -1) {
      todos[index] = {
        ...todos[index],
        ...request,
        updated_at: new Date().toISOString()
      };
      todos = [...todos];
      saveTodosToLocalStorage();
      return todos[index];
    }
    return;
  }

  try {
    const updated = await invoke<Todo>('update_todo', { id, request });
    const index = todos.findIndex((t) => t.id === id);
    if (index !== -1) {
      todos[index] = updated;
      todos = [...todos];
    }
    return updated;
  } catch (error) {
    console.error('Failed to update todo:', error);
  }
}

async function toggleTodo(id: string): Promise<void> {
  if (!isTauri) {
    const index = todos.findIndex((t) => t.id === id);
    if (index !== -1) {
      todos[index].completed = !todos[index].completed;
      todos[index].updated_at = new Date().toISOString();
      todos = [...todos];
      saveTodosToLocalStorage();
    }
    return;
  }

  try {
    const updated = await invoke<Todo>('toggle_todo', { id });
    const index = todos.findIndex((t) => t.id === id);
    if (index !== -1) {
      todos[index] = updated;
      todos = [...todos];
    }
  } catch (error) {
    console.error('Failed to toggle todo:', error);
  }
}

async function deleteTodo(id: string): Promise<void> {
  if (!isTauri) {
    todos = todos.filter((t) => t.id !== id);
    saveTodosToLocalStorage();
    return;
  }

  try {
    await invoke('delete_todo', { id });
    todos = todos.filter((t) => t.id !== id);
  } catch (error) {
    console.error('Failed to delete todo:', error);
  }
}

async function clearCompleted(): Promise<void> {
  if (!isTauri) {
    todos = todos.filter((t) => !t.completed);
    saveTodosToLocalStorage();
    return;
  }

  try {
    todos = await invoke<Todo[]>('clear_completed');
  } catch (error) {
    console.error('Failed to clear completed:', error);
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
  get stats() {
    return getStats();
  },
  get isTauri() {
    return isTauri;
  },
  loadTodos,
  createTodo,
  updateTodo,
  toggleTodo,
  deleteTodo,
  clearCompleted,
  setFilter,
  setSortBy,
  setSearchQuery
};
