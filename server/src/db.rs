use sqlx::{Pool, Sqlite, sqlite::SqlitePoolOptions};
use std::path::Path;

pub type DbPool = Pool<Sqlite>;

/// Initialize the database connection pool
pub async fn init_db() -> Result<DbPool, sqlx::Error> {
    let db_path = std::env::var("DATABASE_URL")
        .unwrap_or_else(|_| "sqlite:./todos.db?mode=rwc".to_string());
    
    // Create database file if it doesn't exist
    if !db_path.contains(":memory:") {
        let path = db_path
            .strip_prefix("sqlite:")
            .unwrap_or(&db_path)
            .split('?')
            .next()
            .unwrap_or("./todos.db");
        
        if !Path::new(path).exists() {
            std::fs::File::create(path)?;
        }
    }
    
    let pool = SqlitePoolOptions::new()
        .max_connections(5)
        .connect(&db_path)
        .await?;
    
    // Run migrations
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS todos (
            id TEXT PRIMARY KEY NOT NULL,
            user_id TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            completed BOOLEAN NOT NULL DEFAULT 0,
            priority TEXT NOT NULL DEFAULT 'medium',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            due_date TEXT
        );
        
        CREATE INDEX IF NOT EXISTS idx_todos_user_id ON todos(user_id);
        CREATE INDEX IF NOT EXISTS idx_todos_updated_at ON todos(updated_at);
        "#
    )
    .execute(&pool)
    .await?;
    
    Ok(pool)
}
