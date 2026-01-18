mod db;
mod handlers;
mod models;

use axum::{
    routing::{get, post, put, delete},
    Router,
};
use tower_http::cors::{Any, CorsLayer};
use tower_http::trace::TraceLayer;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Initialize tracing
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "todo_server=debug,tower_http=debug".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();
    
    // Initialize database
    let pool = db::init_db().await?;
    tracing::info!("Database initialized");
    
    // CORS configuration
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);
    
    // Build router
    let app = Router::new()
        .route("/health", get(handlers::health_check))
        .route("/api/users/{user_id}/todos", get(handlers::get_todos))
        .route("/api/users/{user_id}/todos", post(handlers::create_todo))
        .route("/api/users/{user_id}/todos/{todo_id}", put(handlers::update_todo))
        .route("/api/users/{user_id}/todos/{todo_id}", delete(handlers::delete_todo))
        .route("/api/users/{user_id}/sync", post(handlers::sync_todos))
        .layer(TraceLayer::new_for_http())
        .layer(cors)
        .with_state(pool);
    
    // Start server
    let addr = std::env::var("SERVER_ADDR").unwrap_or_else(|_| "0.0.0.0:3001".to_string());
    let listener = tokio::net::TcpListener::bind(&addr).await?;
    
    tracing::info!("Server listening on {}", addr);
    axum::serve(listener, app).await?;
    
    Ok(())
}
