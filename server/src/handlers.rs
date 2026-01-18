use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};
use chrono::Utc;

use crate::db::DbPool;
use crate::models::*;

/// Health check endpoint
pub async fn health_check() -> &'static str {
    "OK"
}

/// Get all todos for a user
pub async fn get_todos(
    State(pool): State<DbPool>,
    Path(user_id): Path<String>,
) -> Result<Json<ApiResponse<Vec<Todo>>>, StatusCode> {
    let todos = sqlx::query_as::<_, Todo>(
        "SELECT * FROM todos WHERE user_id = ? ORDER BY created_at DESC"
    )
    .bind(&user_id)
    .fetch_all(&pool)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    Ok(Json(ApiResponse::success(todos)))
}

/// Create a new todo
pub async fn create_todo(
    State(pool): State<DbPool>,
    Path(user_id): Path<String>,
    Json(request): Json<CreateTodoRequest>,
) -> Result<Json<ApiResponse<Todo>>, StatusCode> {
    let mut todo = Todo::new(
        user_id,
        request.title,
        request.description,
        request.priority.unwrap_or(Priority::Medium),
    );
    todo.due_date = request.due_date;
    
    sqlx::query(
        r#"
        INSERT INTO todos (id, user_id, title, description, completed, priority, created_at, updated_at, due_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        "#
    )
    .bind(&todo.id)
    .bind(&todo.user_id)
    .bind(&todo.title)
    .bind(&todo.description)
    .bind(todo.completed)
    .bind(&todo.priority)
    .bind(&todo.created_at)
    .bind(&todo.updated_at)
    .bind(&todo.due_date)
    .execute(&pool)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    Ok(Json(ApiResponse::success(todo)))
}

/// Update a todo
pub async fn update_todo(
    State(pool): State<DbPool>,
    Path((user_id, todo_id)): Path<(String, String)>,
    Json(request): Json<UpdateTodoRequest>,
) -> Result<Json<ApiResponse<Todo>>, StatusCode> {
    // First fetch the existing todo
    let mut todo: Todo = sqlx::query_as(
        "SELECT * FROM todos WHERE id = ? AND user_id = ?"
    )
    .bind(&todo_id)
    .bind(&user_id)
    .fetch_optional(&pool)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
    .ok_or(StatusCode::NOT_FOUND)?;
    
    // Apply updates
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
        todo.priority = priority.to_string();
    }
    if let Some(due_date) = request.due_date {
        todo.due_date = Some(due_date);
    }
    todo.updated_at = Utc::now();
    
    // Save updates
    sqlx::query(
        r#"
        UPDATE todos 
        SET title = ?, description = ?, completed = ?, priority = ?, updated_at = ?, due_date = ?
        WHERE id = ? AND user_id = ?
        "#
    )
    .bind(&todo.title)
    .bind(&todo.description)
    .bind(todo.completed)
    .bind(&todo.priority)
    .bind(&todo.updated_at)
    .bind(&todo.due_date)
    .bind(&todo_id)
    .bind(&user_id)
    .execute(&pool)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    Ok(Json(ApiResponse::success(todo)))
}

/// Delete a todo
pub async fn delete_todo(
    State(pool): State<DbPool>,
    Path((user_id, todo_id)): Path<(String, String)>,
) -> Result<Json<ApiResponse<()>>, StatusCode> {
    let result = sqlx::query(
        "DELETE FROM todos WHERE id = ? AND user_id = ?"
    )
    .bind(&todo_id)
    .bind(&user_id)
    .execute(&pool)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    if result.rows_affected() == 0 {
        return Err(StatusCode::NOT_FOUND);
    }
    
    Ok(Json(ApiResponse::success(())))
}

/// Sync todos between client and server
pub async fn sync_todos(
    State(pool): State<DbPool>,
    Path(user_id): Path<String>,
    Json(request): Json<SyncRequest>,
) -> Result<Json<SyncResponse>, StatusCode> {
    let now = Utc::now();
    
    // Process incoming todos from client
    for todo in request.todos {
        // Check if todo exists
        let existing: Option<Todo> = sqlx::query_as(
            "SELECT * FROM todos WHERE id = ? AND user_id = ?"
        )
        .bind(&todo.id)
        .bind(&user_id)
        .fetch_optional(&pool)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
        
        match existing {
            Some(existing_todo) => {
                // Update if client version is newer
                if todo.updated_at > existing_todo.updated_at {
                    sqlx::query(
                        r#"
                        UPDATE todos 
                        SET title = ?, description = ?, completed = ?, priority = ?, updated_at = ?, due_date = ?
                        WHERE id = ? AND user_id = ?
                        "#
                    )
                    .bind(&todo.title)
                    .bind(&todo.description)
                    .bind(todo.completed)
                    .bind(&todo.priority)
                    .bind(&todo.updated_at)
                    .bind(&todo.due_date)
                    .bind(&todo.id)
                    .bind(&user_id)
                    .execute(&pool)
                    .await
                    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
                }
            }
            None => {
                // Insert new todo
                sqlx::query(
                    r#"
                    INSERT INTO todos (id, user_id, title, description, completed, priority, created_at, updated_at, due_date)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    "#
                )
                .bind(&todo.id)
                .bind(&user_id)
                .bind(&todo.title)
                .bind(&todo.description)
                .bind(todo.completed)
                .bind(&todo.priority)
                .bind(&todo.created_at)
                .bind(&todo.updated_at)
                .bind(&todo.due_date)
                .execute(&pool)
                .await
                .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
            }
        }
    }
    
    // Get all todos updated since last sync (or all if first sync)
    let todos = if let Some(last_sync) = request.last_sync {
        sqlx::query_as::<_, Todo>(
            "SELECT * FROM todos WHERE user_id = ? AND updated_at > ? ORDER BY updated_at DESC"
        )
        .bind(&user_id)
        .bind(last_sync)
        .fetch_all(&pool)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
    } else {
        sqlx::query_as::<_, Todo>(
            "SELECT * FROM todos WHERE user_id = ? ORDER BY updated_at DESC"
        )
        .bind(&user_id)
        .fetch_all(&pool)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
    };
    
    Ok(Json(SyncResponse {
        todos,
        sync_time: now,
    }))
}
