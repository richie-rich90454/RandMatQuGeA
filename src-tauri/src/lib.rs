#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use serde::{Deserialize, Serialize};
use sqlx::SqlitePool;
#[cfg(desktop)]
use std::sync::atomic::{AtomicBool, Ordering};
#[cfg(desktop)]
use tauri::window::Effect;
use tauri::Manager;
#[cfg(desktop)]
use tauri::{
    async_runtime,
    menu::{Menu, MenuItem},
    tray::{MouseButton, TrayIconBuilder, TrayIconEvent},
    Runtime,
};
#[cfg(desktop)]
use tauri_utils::config::WindowEffectsConfig;
mod adaptive;
mod models;
use models::{Difficulty, TopicId};
#[derive(Serialize, Deserialize, Clone, sqlx::FromRow)]
struct ScoreEntry {
    id: i32,
    topic: String,
    score: i32,
    total: i32,
    difficulty: String,
    date: String,
}
struct DbState {
    pool: SqlitePool,
}
#[cfg(desktop)]
static ALLOW_CLOSE: AtomicBool = AtomicBool::new(false);
#[tauri::command]
fn check_math(user_expr: String, correct_expr: String) -> bool {
    let user_num = user_expr.trim().parse::<f64>();
    let correct_num = correct_expr.trim().parse::<f64>();
    if let (Ok(u), Ok(c)) = (user_num, correct_num) {
        return (u - c).abs() < 1e-6;
    }
    user_expr.replace(' ', "").to_lowercase() == correct_expr.replace(' ', "").to_lowercase()
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
    .map_err(|e| e.to_string())?;
    Ok(())
}
#[tauri::command]
async fn load_scores(db_state: tauri::State<'_, DbState>) -> Result<Vec<ScoreEntry>, String> {
    sqlx::query_as::<_, ScoreEntry>(
        "SELECT id, topic, score, total, difficulty, date FROM scores ORDER BY date DESC",
    )
    .fetch_all(&db_state.pool)
    .await
    .map_err(|e| e.to_string())
}
#[cfg(desktop)]
fn spawn_show_window<R: Runtime>(handle: tauri::AppHandle<R>) {
    async_runtime::spawn(async move {
        if let Some(window) = handle.get_webview_window("main") {
            let _ = window.show();
            let _ = window.set_focus();
        }
    });
}
#[tauri::command]
async fn save_performance(
    state: tauri::State<'_, DbState>,
    topic_id: String,
    difficulty: String,
    correct: bool,
    response_time_ms: u64,
    error_type: Option<String>,
) -> Result<(), String> {
    let pool = &state.pool;
    let update_result = sqlx::query(
        "UPDATE user_topic_stats 
		 SET attempts = attempts + 1,
			 correct = correct + ?,
			 total_response_time_ms = total_response_time_ms + ?,
			 last_error_type = ?,
			 last_updated = CURRENT_TIMESTAMP
		 WHERE topic_id = ? AND difficulty = ?",
    )
    .bind(if correct { 1 } else { 0 })
    .bind(response_time_ms as i64)
    .bind(&error_type)
    .bind(&topic_id)
    .bind(&difficulty)
    .execute(pool)
    .await
    .map_err(|e| e.to_string())?;
    if update_result.rows_affected() == 0 {
        sqlx::query(
			"INSERT INTO user_topic_stats (topic_id, difficulty, attempts, correct, total_response_time_ms, last_error_type)
			 VALUES (?, ?, 1, ?, ?, ?)"
		)
		.bind(&topic_id)
		.bind(&difficulty)
		.bind(if correct { 1 } else { 0 })
		.bind(response_time_ms as i64)
		.bind(&error_type)
		.execute(pool)
		.await
		.map_err(|e| e.to_string())?;
    }
    Ok(())
}
#[tauri::command]
async fn get_next_question_recommendation(
    state: tauri::State<'_, DbState>,
    current_topic: String,
    current_difficulty: String,
) -> Result<adaptive::Recommendation, String> {
    let pool = &state.pool;
    let topic_id = TopicId::from(current_topic.as_str());
    let diff = Difficulty::from(current_difficulty.as_str());
    let stats = adaptive::fetch_stats_for_topic(pool, &topic_id, diff)
        .await
        .map_err(|e| e.to_string())?;
    let new_difficulty = if let Some(s) = stats {
        let accuracy = s.correct as f64 / s.attempts as f64;
        adaptive::recommend_next_difficulty(accuracy)
    } else {
        Difficulty::Medium
    };
    let weak_topic = adaptive::find_weakest_topic(pool)
        .await
        .map_err(|e| e.to_string())?;
    Ok(adaptive::Recommendation {
        difficulty: new_difficulty,
        weak_topic: weak_topic.as_deref().map(TopicId::from),
    })
}
#[tauri::command]
async fn get_weak_topics(
    state: tauri::State<'_, DbState>,
    limit: Option<usize>,
) -> Result<Vec<serde_json::Value>, String> {
    let pool = &state.pool;
    let limit_val = limit.unwrap_or(5);
    let rows: Vec<(String, Option<f64>, Option<i32>)> = sqlx::query_as(
        "SELECT topic_id, 
				CAST(SUM(correct) AS REAL) / SUM(attempts) as accuracy,
				SUM(attempts) as total_attempts
		 FROM user_topic_stats
		 GROUP BY topic_id
		 ORDER BY accuracy ASC
		 LIMIT ?",
    )
    .bind(limit_val as i32)
    .fetch_all(pool)
    .await
    .map_err(|e| e.to_string())?;
    let mut result = Vec::new();
    for (topic_id, accuracy_opt, attempts_opt) in rows {
        result.push(serde_json::json!({
            "topic_id": topic_id,
            "accuracy": accuracy_opt.unwrap_or(0.0),
            "attempts": attempts_opt.unwrap_or(0)
        }));
    }
    Ok(result)
}
#[tauri::command]
async fn get_performance_stats(
    state: tauri::State<'_, DbState>,
    difficulty: Option<String>,
    days: Option<i32>,
) -> Result<Vec<serde_json::Value>, String> {
    let pool = &state.pool;
    let mut query = String::from(
        "SELECT topic_id, difficulty, 
				SUM(attempts) as total_attempts,
				SUM(correct) as total_correct,
				CAST(SUM(correct) AS REAL) / SUM(attempts) as accuracy,
				AVG(total_response_time_ms) as avg_response_time
		 FROM user_topic_stats
		 WHERE 1=1",
    );
    let mut params: Vec<String> = Vec::new();
    if let Some(diff) = difficulty {
        query.push_str(" AND difficulty = ?");
        params.push(diff);
    }
    if let Some(d) = days {
        query.push_str(" AND last_updated >= datetime('now', ?)");
        params.push(format!("-{} days", d));
    }
    query.push_str(" GROUP BY topic_id, difficulty ORDER BY accuracy ASC");
    let mut rows_query = sqlx::query_as::<_, (String, String, i64, i64, f64, f64)>(&query);
    for p in params {
        rows_query = rows_query.bind(p);
    }
    let results = rows_query
        .fetch_all(pool)
        .await
        .map_err(|e| e.to_string())?;
    let mut out = Vec::new();
    for (topic_id, difficulty, attempts, correct, accuracy, avg_time) in results {
        out.push(serde_json::json!({
            "topic_id": topic_id,
            "difficulty": difficulty,
            "attempts": attempts,
            "correct": correct,
            "accuracy": accuracy,
            "avg_time_ms": avg_time
        }));
    }
    Ok(out)
}
#[tauri::command]
async fn delete_performance_record(
    state: tauri::State<'_, DbState>,
    topic_id: String,
    difficulty: String,
) -> Result<(), String> {
    let pool = &state.pool;
    sqlx::query("DELETE FROM user_topic_stats WHERE topic_id = ? AND difficulty = ?")
        .bind(&topic_id)
        .bind(&difficulty)
        .execute(pool)
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}
#[tauri::command]
async fn delete_score(state: tauri::State<'_, DbState>, id: i32) -> Result<(), String> {
    let pool = &state.pool;
    sqlx::query("DELETE FROM scores WHERE id = ?")
        .bind(id)
        .execute(pool)
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}
#[tauri::command]
async fn reset_all_data(state: tauri::State<'_, DbState>) -> Result<(), String> {
    let pool = &state.pool;
    sqlx::query("DELETE FROM user_topic_stats")
        .execute(pool)
        .await
        .map_err(|e| e.to_string())?;
    sqlx::query("DELETE FROM scores")
        .execute(pool)
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            check_math,
            save_score,
            load_scores,
            save_performance,
            get_next_question_recommendation,
            get_weak_topics,
            get_performance_stats,
            delete_performance_record,
            delete_score,
            reset_all_data,
        ])
        .setup(|app| {
            let handle = app.handle().clone();
            let pool = tauri::async_runtime::block_on(async move {
                let data_dir = handle
                    .path()
                    .app_data_dir()
                    .unwrap_or_else(|_| std::env::temp_dir());
                std::fs::create_dir_all(&data_dir).map_err(|e| e.to_string())?;
                let db_path = data_dir.join("scores.db");
                let db_url = format!("sqlite:{}?mode=rwc", db_path.to_string_lossy());
                let pool = SqlitePool::connect(&db_url)
                    .await
                    .map_err(|e| format!("DB connect error: {}", e))?;
                sqlx::query(
                    "CREATE TABLE IF NOT EXISTS scores (
						id INTEGER PRIMARY KEY AUTOINCREMENT,
						topic TEXT,
						score INTEGER,
						total INTEGER,
						difficulty TEXT,
						date TEXT
					);",
                )
                .execute(&pool)
                .await
                .map_err(|e| format!("DB init error: {}", e))?;
                sqlx::query(
                    "CREATE TABLE IF NOT EXISTS user_topic_stats (
						topic_id TEXT NOT NULL,
						difficulty TEXT NOT NULL,
						attempts INTEGER DEFAULT 0,
						correct INTEGER DEFAULT 0,
						total_response_time_ms INTEGER DEFAULT 0,
						last_error_type TEXT,
						last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
						PRIMARY KEY (topic_id, difficulty)
					);",
                )
                .execute(&pool)
                .await
                .map_err(|e| format!("DB init error for user_topic_stats: {}", e))?;
                Ok::<SqlitePool, String>(pool)
            })
            .map_err(|e| {
                eprintln!("DB init failed: {}", e);
                e
            })?;
            app.manage(DbState { pool });
            #[cfg(desktop)]
            if let Some(window) = app.get_webview_window("main") {
                let w_clone = window.clone();
                window.on_window_event(move |event| {
                    if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                        if !ALLOW_CLOSE.load(Ordering::SeqCst) {
                            api.prevent_close();
                            let _ = w_clone.hide();
                        }
                    }
                });
                #[cfg(target_os = "windows")]
                {
                    let _ = window.set_effects(WindowEffectsConfig {
                        effects: vec![Effect::Mica],
                        ..Default::default()
                    });
                }
            }
            #[cfg(desktop)]
            {
                let show_item = MenuItem::with_id(app, "show", "Show", true, None::<&str>)?;
                let quit_item = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
                let menu = Menu::with_items(app, &[&show_item, &quit_item])?;
                let _tray = TrayIconBuilder::with_id("main")
                    .icon(app.default_window_icon().unwrap().clone())
                    .menu(&menu)
                    .on_menu_event(move |app, event| match event.id.as_ref() {
                        "quit" => {
                            ALLOW_CLOSE.store(true, Ordering::SeqCst);
                            if let Some(window) = app.get_webview_window("main") {
                                let _ = window.close();
                            }
                            let app_handle = app.clone();
                            async_runtime::spawn(async move {
                                tokio::time::sleep(std::time::Duration::from_millis(150)).await;
                                app_handle.exit(0);
                            });
                        }
                        "show" => spawn_show_window(app.clone()),
                        _ => {}
                    })
                    .on_tray_icon_event(|tray, event| {
                        if let TrayIconEvent::Click {
                            button: MouseButton::Left,
                            ..
                        } = event
                        {
                            spawn_show_window(tray.app_handle().clone());
                        }
                    })
                    .build(app)?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
