use crate::models::{CreateTodoRequest, Priority, Todo, UpdateTodoRequest};
use chrono::Utc;
use std::sync::Mutex;
use tauri::State;

/// Application state holding todos
pub struct AppState {
    pub todos: Mutex<Vec<Todo>>,
}

impl Default for AppState {
    fn default() -> Self {
        Self {
            todos: Mutex::new(Vec::new()),
        }
    }
}

/// Get all todos
#[tauri::command]
pub fn get_todos(state: State<AppState>) -> Result<Vec<Todo>, String> {
    let todos = state.todos.lock().map_err(|e| e.to_string())?;
    Ok(todos.clone())
}

/// Create a new todo
#[tauri::command]
pub fn create_todo(request: CreateTodoRequest, state: State<AppState>) -> Result<Todo, String> {
    let mut todos = state.todos.lock().map_err(|e| e.to_string())?;
    
    let mut todo = Todo::new(
        request.title,
        request.description,
        request.priority.unwrap_or(Priority::Medium),
    );
    todo.due_date = request.due_date;
    
    todos.push(todo.clone());
    Ok(todo)
}

/// Update an existing todo
#[tauri::command]
pub fn update_todo(id: String, request: UpdateTodoRequest, state: State<AppState>) -> Result<Todo, String> {
    let mut todos = state.todos.lock().map_err(|e| e.to_string())?;
    
    let todo = todos
        .iter_mut()
        .find(|t| t.id == id)
        .ok_or_else(|| format!("Todo with id {} not found", id))?;
    
    if let Some(title) = request.title {
        todo.title = title;
    }
    if let Some(description) = request.description {
        todo.description = Some(description);
    }
    if let Some(completed) = request.completed {
        todo.completed = completed;
    }
    if let Some(priority) = request.priority {
        todo.priority = priority;
    }
    if let Some(due_date) = request.due_date {
        todo.due_date = Some(due_date);
    }
    todo.updated_at = Utc::now();
    
    Ok(todo.clone())
}

/// Toggle todo completion status
#[tauri::command]
pub fn toggle_todo(id: String, state: State<AppState>) -> Result<Todo, String> {
    let mut todos = state.todos.lock().map_err(|e| e.to_string())?;
    
    let todo = todos
        .iter_mut()
        .find(|t| t.id == id)
        .ok_or_else(|| format!("Todo with id {} not found", id))?;
    
    todo.completed = !todo.completed;
    todo.updated_at = Utc::now();
    
    Ok(todo.clone())
}

/// Delete a todo
#[tauri::command]
pub fn delete_todo(id: String, state: State<AppState>) -> Result<(), String> {
    let mut todos = state.todos.lock().map_err(|e| e.to_string())?;
    
    let index = todos
        .iter()
        .position(|t| t.id == id)
        .ok_or_else(|| format!("Todo with id {} not found", id))?;
    
    todos.remove(index);
    Ok(())
}

/// Clear all completed todos
#[tauri::command]
pub fn clear_completed(state: State<AppState>) -> Result<Vec<Todo>, String> {
    let mut todos = state.todos.lock().map_err(|e| e.to_string())?;
    todos.retain(|t| !t.completed);
    Ok(todos.clone())
}
