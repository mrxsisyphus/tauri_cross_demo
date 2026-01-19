mod commands;
mod models;
mod db;

pub use commands::*;
pub use models::*;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mut builder = tauri::Builder::default();
    
    // Add single-instance plugin only for desktop
    #[cfg(not(any(target_os = "android", target_os = "ios")))]
    {
        builder = builder.plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.set_focus();
            }
        }));
    }
    
    builder
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let handle = app.handle().clone();
            tauri::async_runtime::block_on(async move {
                let db_pool = db::init_db(&handle).await.expect("failed to initialize database");
                handle.manage(AppState { db: db_pool });
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_todos,
            create_todo,
            update_todo,
            toggle_todo,
            delete_todo,
            sync_local,
            clear_completed,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
