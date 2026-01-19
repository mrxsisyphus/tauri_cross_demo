use crate::models::{CreateTodoRequest, Priority, Todo, UpdateTodoRequest};
use chrono::Utc;
use sqlx::SqlitePool;
use tauri::State;

/// Application state holding database pool
pub struct AppState {
    pub db: SqlitePool,
}

/// Get all todos
#[tauri::command]
pub async fn get_todos(state: State<'_, AppState>) -> Result<Vec<Todo>, String> {
    sqlx::query_as::<_, Todo>("SELECT * FROM todos ORDER BY created_at DESC")
        .fetch_all(&state.db)
        .await
        .map_err(|e| e.to_string())
}

/// Create a new todo
#[tauri::command]
pub async fn create_todo(request: CreateTodoRequest, state: State<'_, AppState>) -> Result<Todo, String> {
    let mut todo = Todo::new(
        request.title,
        request.description,
        request.priority.unwrap_or(Priority::Medium),
    );
    todo.due_date = request.due_date;
    
    sqlx::query(
        r#"
        INSERT INTO todos (id, title, description, completed, priority, created_at, updated_at, due_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        "#
    )
    .bind(&todo.id)
    .bind(&todo.title)
    .bind(&todo.description)
    .bind(todo.completed)
    .bind(&todo.priority)
    .bind(&todo.created_at)
    .bind(&todo.updated_at)
    .bind(&todo.due_date)
    .execute(&state.db)
    .await
    .map_err(|e| e.to_string())?;
    
    Ok(todo)
}

/// Update an existing todo
#[tauri::command]
pub async fn update_todo(id: String, request: UpdateTodoRequest, state: State<'_, AppState>) -> Result<Todo, String> {
    let mut todo: Todo = sqlx::query_as("SELECT * FROM todos WHERE id = ?")
        .bind(&id)
        .fetch_one(&state.db)
        .await
        .map_err(|e| e.to_string())?;
    
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
    
    sqlx::query(
        r#"
        UPDATE todos 
        SET title = ?, description = ?, completed = ?, priority = ?, updated_at = ?, due_date = ?
        WHERE id = ?
        "#
    )
    .bind(&todo.title)
    .bind(&todo.description)
    .bind(todo.completed)
    .bind(&todo.priority)
    .bind(&todo.updated_at)
    .bind(&todo.due_date)
    .bind(&todo.id)
    .execute(&state.db)
    .await
    .map_err(|e| e.to_string())?;
    
    Ok(todo)
}

/// Toggle todo completion status
#[tauri::command]
pub async fn toggle_todo(id: String, state: State<'_, AppState>) -> Result<Todo, String> {
    let mut todo: Todo = sqlx::query_as("SELECT * FROM todos WHERE id = ?")
        .bind(&id)
        .fetch_one(&state.db)
        .await
        .map_err(|e| e.to_string())?;
    
    todo.completed = !todo.completed;
    todo.updated_at = Utc::now();
    
    sqlx::query("UPDATE todos SET completed = ?, updated_at = ? WHERE id = ?")
        .bind(todo.completed)
        .bind(&todo.updated_at)
        .bind(&id)
        .execute(&state.db)
        .await
        .map_err(|e| e.to_string())?;
    
    Ok(todo)
}

/// Delete a todo
#[tauri::command]
pub async fn delete_todo(id: String, state: State<'_, AppState>) -> Result<(), String> {
    sqlx::query("DELETE FROM todos WHERE id = ?")
        .bind(&id)
        .execute(&state.db)
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}

/// Sync local state with remote todos
#[tauri::command]
pub async fn sync_local(remote_todos: Vec<Todo>, state: State<'_, AppState>) -> Result<(), String> {
    let mut tx = state.db.begin().await.map_err(|e| e.to_string())?;
    
    sqlx::query("DELETE FROM todos")
        .execute(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;
        
    for todo in remote_todos {
        sqlx::query(
            r#"
            INSERT INTO todos (id, title, description, completed, priority, created_at, updated_at, due_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            "#
        )
        .bind(&todo.id)
        .bind(&todo.title)
        .bind(&todo.description)
        .bind(todo.completed)
        .bind(&todo.priority)
        .bind(&todo.created_at)
        .bind(&todo.updated_at)
        .bind(&todo.due_date)
        .execute(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;
    }
    
    tx.commit().await.map_err(|e| e.to_string())?;
    Ok(())
}

/// Clear all completed todos
#[tauri::command]
pub async fn clear_completed(state: State<'_, AppState>) -> Result<Vec<Todo>, String> {
    sqlx::query("DELETE FROM todos WHERE completed = 1")
        .execute(&state.db)
        .await
        .map_err(|e| e.to_string())?;
        
    get_todos(state).await
}
