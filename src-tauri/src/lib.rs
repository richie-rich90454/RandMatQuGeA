#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use serde::{Deserialize, Serialize};
use sqlx::{Row, SqlitePool};
use std::sync::atomic::{AtomicBool, Ordering};
use tauri::{
    async_runtime,
    menu::{Menu, MenuItem},
    tray::{MouseButton, TrayIconBuilder, TrayIconEvent},
    Manager,
};

#[derive(Serialize, Deserialize, Clone)]
struct ScoreEntry {
    topic: String,
    score: i32,
    total: i32,
    difficulty: String,
    date: String,
}

struct DbState {
    pool: SqlitePool,
}

#[tauri::command]
fn check_math(user_expr: String, correct_expr: String) -> bool {
    let user_num = user_expr.trim().parse::<f64>();
    let correct_num = correct_expr.trim().parse::<f64>();
    if let (Ok(u), Ok(c)) = (user_num, correct_num) {
        return (u - c).abs() < 1e-8;
    }
    user_expr.replace(" ", "").to_lowercase() == correct_expr.replace(" ", "").to_lowercase()
}

#[tauri::command]
async fn save_score(entry: ScoreEntry, db_state: tauri::State<'_, DbState>) -> Result<(), String> {
    sqlx::query(
        "INSERT INTO scores (topic, score, total, difficulty, date) VALUES (?, ?, ?, ?, ?)",
    )
    .bind(&entry.topic)
    .bind(entry.score)
    .bind(entry.total)
    .bind(&entry.difficulty)
    .bind(&entry.date)
    .execute(&db_state.pool)
    .await
    .map_err(|e: sqlx::Error| e.to_string())?;
    Ok(())
}

#[tauri::command]
async fn load_scores(db_state: tauri::State<'_, DbState>) -> Result<Vec<ScoreEntry>, String> {
    let rows =
        sqlx::query("SELECT topic, score, total, difficulty, date FROM scores ORDER BY date DESC")
            .fetch_all(&db_state.pool)
            .await
            .map_err(|e: sqlx::Error| e.to_string())?;

    let mut scores = Vec::new();
    for row in rows {
        let topic: String = row
            .try_get("topic")
            .map_err(|e: sqlx::Error| e.to_string())?;
        let score: i32 = row
            .try_get("score")
            .map_err(|e: sqlx::Error| e.to_string())?;
        let total: i32 = row
            .try_get("total")
            .map_err(|e: sqlx::Error| e.to_string())?;
        let difficulty: String = row
            .try_get("difficulty")
            .map_err(|e: sqlx::Error| e.to_string())?;
        let date: String = row
            .try_get("date")
            .map_err(|e: sqlx::Error| e.to_string())?;
        scores.push(ScoreEntry {
            topic,
            score,
            total,
            difficulty,
            date,
        });
    }
    Ok(scores)
}

fn spawn_show_window(app_handle: tauri::AppHandle) {
    async_runtime::spawn(async move {
        if let Some(window) = app_handle.get_webview_window("main") {
            let _ = window.show();
            let _ = window.set_focus();
        }
    });
}

static ALLOW_CLOSE: AtomicBool = AtomicBool::new(false);

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    #[cfg(target_os = "android")]
    rustls_platform_verifier::init();

    tauri::Builder::default()
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            check_math,
            save_score,
            load_scores
        ])
        .setup(|app| {
            let pool: SqlitePool = async_runtime::block_on(async {
                let data_dir = match app.path().app_data_dir() {
                    Ok(dir) => dir,
                    Err(e) => {
                        eprintln!("Failed to get app data dir: {}, falling back to temp", e);
                        std::env::temp_dir().join("randmatqugea")
                    }
                };
                let db_path = data_dir.join("scores.db");
                eprintln!("Attempting database at: {:?}", db_path);

                if let Some(parent) = db_path.parent() {
                    if let Err(e) = std::fs::create_dir_all(parent) {
                        eprintln!("Failed to create dir {:?}: {}", parent, e);
                        return Err(format!("Failed to create directory: {}", e));
                    }
                    eprintln!("Directory created: {:?}", parent);
                }

                let test_file = db_path.with_extension("test");
                match std::fs::write(&test_file, b"test") {
                    Ok(_) => {
                        let _ = std::fs::remove_file(&test_file);
                        eprintln!("Write permission OK");
                    }
                    Err(e) => {
                        eprintln!("Write test failed: {}", e);
                        return Err(format!("No write permission: {}", e));
                    }
                }

                let db_path_str = db_path.to_str().unwrap();
                eprintln!("Attempting raw path: {}", db_path_str);
                match SqlitePool::connect(db_path_str).await {
                    Ok(pool) => {
                        if let Err(e) = sqlx::query(
                            r#"
                            CREATE TABLE IF NOT EXISTS scores (
                                id INTEGER PRIMARY KEY AUTOINCREMENT,
                                topic TEXT NOT NULL,
                                score INTEGER NOT NULL,
                                total INTEGER NOT NULL,
                                difficulty TEXT NOT NULL,
                                date TEXT NOT NULL
                            );
                            "#,
                        )
                        .execute(&pool)
                        .await
                        {
                            eprintln!("Table creation failed: {}", e);
                            return Err(format!("Table creation failed: {}", e));
                        }
                        eprintln!("Database ready at: {:?}", db_path);
                        Ok(pool)
                    }
                    Err(e) => {
                        eprintln!("Raw path failed: {}", e);
                        let db_url = format!("sqlite:///{}", db_path_str.replace('\\', "/"));
                        eprintln!("Trying URL scheme: {}", db_url);
                        match SqlitePool::connect(&db_url).await {
                            Ok(pool) => {
                                if let Err(e) = sqlx::query(
                                    r#"
                                    CREATE TABLE IF NOT EXISTS scores (
                                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                                        topic TEXT NOT NULL,
                                        score INTEGER NOT NULL,
                                        total INTEGER NOT NULL,
                                        difficulty TEXT NOT NULL,
                                        date TEXT NOT NULL
                                    );
                                    "#,
                                )
                                .execute(&pool)
                                .await
                                {
                                    eprintln!("Table creation failed: {}", e);
                                    return Err(format!("Table creation failed: {}", e));
                                }
                                eprintln!("Database ready (URL) at: {:?}", db_path);
                                Ok(pool)
                            }
                            Err(e2) => {
                                eprintln!("URL scheme also failed: {}", e2);
                                Err(format!(
                                    "Both connection attempts failed: raw: {}, URL: {}",
                                    e, e2
                                ))
                            }
                        }
                    }
                }
            })
            .or_else(|e| {
                eprintln!("Falling back to in-memory database due to: {}", e);
                async_runtime::block_on(async {
                    let in_mem = SqlitePool::connect("sqlite::memory:")
                        .await
                        .map_err(|e| format!("In-memory connection failed: {}", e))?;
                    sqlx::query(
                        r#"
                        CREATE TABLE IF NOT EXISTS scores (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            topic TEXT NOT NULL,
                            score INTEGER NOT NULL,
                            total INTEGER NOT NULL,
                            difficulty TEXT NOT NULL,
                            date TEXT NOT NULL
                        );
                        "#,
                    )
                    .execute(&in_mem)
                    .await
                    .map_err(|e| format!("Failed to create in-memory table: {}", e))?;
                    eprintln!("Using in-memory database (scores will not persist)");
                    Ok::<_, String>(in_mem)
                })
            })?;

            app.manage(DbState { pool });

            if let Some(window) = app.get_webview_window("main") {
                let window_clone = window.clone();
                window.on_window_event(move |event| {
                    if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                        if ALLOW_CLOSE.load(Ordering::SeqCst) {
                        } else {
                            api.prevent_close();
                            let _ = window_clone.hide();
                        }
                    }
                });
            }

            #[cfg(not(any(target_os = "android", target_os = "ios")))]
            {
                let icon = tauri::image::Image::from_path("icons/32x32.png")?;
                let show_item = MenuItem::with_id(app, "show", "Show", true, None::<&str>)?;
                let quit_item = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
                let menu = Menu::with_items(app, &[&show_item, &quit_item])?;
                let _tray = TrayIconBuilder::with_id("main")
                    .icon(icon)
                    .menu(&menu)
                    .show_menu_on_left_click(false)
                    .tooltip("RandMatQuGeA - Math Quiz")
                    .on_menu_event(move |app, event| match event.id.as_ref() {
                        "quit" => {
                            ALLOW_CLOSE.store(true, Ordering::SeqCst);
                            if let Some(window) = app.get_webview_window("main") {
                                let _ = window.close();
                            }
                            let app_handle = app.clone();
                            async_runtime::spawn(async move {
                                tokio::time::sleep(std::time::Duration::from_millis(100)).await;
                                app_handle.exit(0);
                            });
                        }
                        "show" => {
                            spawn_show_window(app.clone());
                        }
                        _ => {}
                    })
                    .on_tray_icon_event(|tray, event| {
                        if let TrayIconEvent::Click { button, .. } = event {
                            if button == MouseButton::Left {
                                spawn_show_window(tray.app_handle().clone());
                            }
                        }
                    })
                    .build(app)?;
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
