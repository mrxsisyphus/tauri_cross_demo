export type Priority = 'low' | 'medium' | 'high';

export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: Priority;
  created_at: string;
  updated_at: string;
  due_date?: string;
}

export interface CreateTodoRequest {
  title: string;
  description?: string;
  priority?: Priority;
  due_date?: string;
}

export interface UpdateTodoRequest {
  title?: string;
  description?: string;
  completed?: boolean;
  priority?: Priority;
  due_date?: string;
}

export interface SyncStatus {
  connected: boolean;
  lastSync?: string;
  pendingChanges: number;
}

export type FilterType = 'all' | 'active' | 'completed';
export type SortType = 'created' | 'priority' | 'due_date' | 'title';
