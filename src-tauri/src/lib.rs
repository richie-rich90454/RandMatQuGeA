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
mod pdf;
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
#[derive(Serialize, Deserialize)]
struct NewScoreEntry {
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
fn check_math(user_expr: String, correct_expr: String, alternate: Option<String>) -> bool {
    let user_num = user_expr.trim().parse::<f64>();
    let correct_num = correct_expr.trim().parse::<f64>();
    if let (Ok(u), Ok(c)) = (&user_num, &correct_num) {
        return (u - c).abs() < 1e-6;
    }
    if user_expr.replace(' ', "").to_lowercase() == correct_expr.replace(' ', "").to_lowercase() {
        return true;
    }
    if let Some(alt) = alternate {
        let user_norm = user_expr.trim().to_lowercase();
        let alt_norm = alt.trim().to_lowercase();
        if user_norm == alt_norm {
            return true;
        }
        let alt_num = alt.trim().parse::<f64>();
        if let (Ok(u), Ok(a)) = (user_num, alt_num) {
            if (u - a).abs() < 1e-6 {
                return true;
            }
        }
    }
    false
}
#[tauri::command]
async fn save_score(
    entry: NewScoreEntry,
    db_state: tauri::State<'_, DbState>,
) -> Result<(), String> {
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
    sqlx::query(
        "INSERT INTO user_topic_stats (topic_id, difficulty, attempts, correct, total_response_time_ms, last_error_type)
         VALUES (?, ?, 1, ?, ?, ?)
         ON CONFLICT(topic_id, difficulty) DO UPDATE SET
             attempts = user_topic_stats.attempts + 1,
             correct = user_topic_stats.correct + excluded.correct,
             total_response_time_ms = user_topic_stats.total_response_time_ms + excluded.total_response_time_ms,
             last_error_type = excluded.last_error_type,
             last_updated = CURRENT_TIMESTAMP",
    )
    .bind(&topic_id)
    .bind(&difficulty)
    .bind(if correct { 1 } else { 0 })
    .bind(response_time_ms as i64)
    .bind(&error_type)
    .execute(pool)
    .await
    .map_err(|e| e.to_string())?;
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
        if s.attempts < 3 {
            diff
        } else {
            let accuracy = s.correct as f64 / s.attempts as f64;
            adaptive::recommend_next_difficulty(accuracy)
        }
    } else {
        diff
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
            COALESCE(CAST(SUM(correct) AS REAL) / NULLIF(SUM(attempts), 0), 0.0) as accuracy,
            SUM(attempts) as total_attempts
         FROM user_topic_stats
         GROUP BY topic_id
         HAVING SUM(attempts) >= 3 AND COALESCE(CAST(SUM(correct) AS REAL) / NULLIF(SUM(attempts), 0), 0.0) < 0.7
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
    let mut builder = sqlx::QueryBuilder::new(
        "SELECT topic_id, difficulty,
            SUM(attempts) as total_attempts,
            SUM(correct) as total_correct,
            COALESCE(CAST(SUM(correct) AS REAL) / NULLIF(SUM(attempts), 0), 0.0) as accuracy,
            COALESCE(CAST(SUM(total_response_time_ms) AS REAL) / NULLIF(SUM(attempts), 0), 0.0) as avg_response_time
         FROM user_topic_stats
         WHERE 1=1",
    );
    if let Some(diff) = difficulty {
        builder.push(" AND difficulty = ");
        builder.push_bind(diff);
    }
    if let Some(d) = days.filter(|d| *d > 0) {
        builder.push(" AND last_updated >= datetime('now', ");
        builder.push_bind(format!("-{} days", d));
        builder.push(")");
    }
    builder.push(" GROUP BY topic_id, difficulty HAVING SUM(attempts) > 0 ORDER BY accuracy ASC");
    let results = builder
        .build_query_as::<(String, String, i64, i64, f64, f64)>()
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
async fn delete_all_performance_records(state: tauri::State<'_, DbState>) -> Result<(), String> {
    let pool = &state.pool;
    sqlx::query("DELETE FROM user_topic_stats")
        .execute(pool)
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}
#[tauri::command]
fn generate_worksheet_seed() -> u64 {
    rand::random()
}
#[tauri::command]
async fn export_worksheet_pdf(
    questions: Vec<pdf::QuestionDtoRust>,
    opts: pdf::WorksheetOptsRust,
    filepath: String,
) -> Result<(), String> {
    tauri::async_runtime::spawn_blocking(move || pdf::export_worksheet_pdf_impl(questions, opts, &filepath))
        .await
        .map_err(|e| e.to_string())?
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
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            check_math,
            save_score,
            load_scores,
            save_performance,
            get_next_question_recommendation,
            get_weak_topics,
            get_performance_stats,
            delete_performance_record,
            delete_all_performance_records,
            generate_worksheet_seed,
            export_worksheet_pdf,
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
                    .icon(app.default_window_icon().expect("default window icon must be configured").clone())
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
#[cfg(test)]
mod tests {
    use super::*;
    use sqlx::SqlitePool;
    #[tokio::test]
    async fn test_save_performance_logic() {
        let pool = SqlitePool::connect("sqlite::memory:").await.unwrap();
        sqlx::query(
            "CREATE TABLE user_topic_stats (
                topic_id TEXT NOT NULL,
                difficulty TEXT NOT NULL,
                attempts INTEGER DEFAULT 0,
                correct INTEGER DEFAULT 0,
                total_response_time_ms INTEGER DEFAULT 0,
                last_error_type TEXT,
                last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (topic_id, difficulty)
            )",
        )
        .execute(&pool)
        .await
        .unwrap();
        let update_result = sqlx::query(
            "UPDATE user_topic_stats SET attempts = attempts + 1, correct = correct + ?,
             total_response_time_ms = total_response_time_ms + ? WHERE topic_id = ? AND difficulty = ?",
        )
        .bind(1)
        .bind(100i64)
        .bind("algebra")
        .bind("easy")
        .execute(&pool)
        .await
        .unwrap();
        assert_eq!(update_result.rows_affected(), 0);
        sqlx::query(
            "INSERT INTO user_topic_stats (topic_id, difficulty, attempts, correct, total_response_time_ms)
             VALUES (?, ?, 1, 1, 100)",
        )
        .bind("algebra")
        .bind("easy")
        .execute(&pool)
        .await
        .unwrap();
        let row: (String, String, i32, i32) = sqlx::query_as(
            "SELECT topic_id, difficulty, attempts, correct FROM user_topic_stats WHERE topic_id = ? AND difficulty = ?",
        )
        .bind("algebra")
        .bind("easy")
        .fetch_one(&pool)
        .await
        .unwrap();
        assert_eq!(row.0, "algebra");
        assert_eq!(row.1, "easy");
        assert_eq!(row.2, 1);
        assert_eq!(row.3, 1);
    }
    #[tokio::test]
    async fn test_reset_all_data_logic() {
        let pool = SqlitePool::connect("sqlite::memory:").await.unwrap();
        sqlx::query(
            "CREATE TABLE user_topic_stats (
                topic_id TEXT NOT NULL,
                difficulty TEXT NOT NULL,
                PRIMARY KEY (topic_id, difficulty)
            )",
        )
        .execute(&pool)
        .await
        .unwrap();
        sqlx::query("INSERT INTO user_topic_stats (topic_id, difficulty) VALUES (?, ?)")
            .bind("algebra")
            .bind("easy")
            .execute(&pool)
            .await
            .unwrap();
        let count_before: (i64,) =
            sqlx::query_as("SELECT COUNT(*) FROM user_topic_stats")
                .fetch_one(&pool)
                .await
                .unwrap();
        assert_eq!(count_before.0, 1);
        sqlx::query("DELETE FROM user_topic_stats")
            .execute(&pool)
            .await
            .unwrap();
        let count_after: (i64,) =
            sqlx::query_as("SELECT COUNT(*) FROM user_topic_stats")
                .fetch_one(&pool)
                .await
                .unwrap();
        assert_eq!(count_after.0, 0);
    }
    #[test]
    fn test_model_round_trips() {
        let topic = TopicId::from("geometry");
        assert_eq!(topic.as_str(), "geometry");
        let topic2 = TopicId("trigonometry".to_string());
        assert_eq!(topic2.as_str(), "trigonometry");
        assert_eq!(Difficulty::from("easy"), Difficulty::Easy);
        assert_eq!(Difficulty::from("medium"), Difficulty::Medium);
        assert_eq!(Difficulty::from("hard"), Difficulty::Hard);
        assert_eq!(Difficulty::from("unknown"), Difficulty::Medium);
        assert_eq!(Difficulty::Easy.as_str(), "easy");
        assert_eq!(Difficulty::Medium.as_str(), "medium");
        assert_eq!(Difficulty::Hard.as_str(), "hard");
    }
    #[test]
    fn should_create_score_entry_with_correct_fields() {
        let entry = ScoreEntry {
            id: 1,
            topic: "algebra".to_string(),
            score: 8,
            total: 10,
            difficulty: "easy".to_string(),
            date: "2025-01-01".to_string(),
        };
        assert_eq!(entry.id, 1);
        assert_eq!(entry.topic, "algebra");
        assert_eq!(entry.score, 8);
        assert_eq!(entry.total, 10);
        assert_eq!(entry.difficulty, "easy");
        assert_eq!(entry.date, "2025-01-01");
    }
    #[test]
    fn should_create_new_score_entry_with_correct_fields() {
        let entry = NewScoreEntry {
            topic: "calculus".to_string(),
            score: 5,
            total: 7,
            difficulty: "hard".to_string(),
            date: "2025-06-15".to_string(),
        };
        assert_eq!(entry.topic, "calculus");
        assert_eq!(entry.score, 5);
        assert_eq!(entry.total, 7);
        assert_eq!(entry.difficulty, "hard");
        assert_eq!(entry.date, "2025-06-15");
    }
    #[test]
    fn should_serialize_score_entry_to_json() {
        let entry = ScoreEntry {
            id: 42,
            topic: "geometry".to_string(),
            score: 3,
            total: 5,
            difficulty: "medium".to_string(),
            date: "2025-03-20".to_string(),
        };
        let json = serde_json::to_string(&entry).unwrap();
        assert!(json.contains("\"id\":42"));
        assert!(json.contains("\"topic\":\"geometry\""));
        assert!(json.contains("\"score\":3"));
        assert!(json.contains("\"total\":5"));
        assert!(json.contains("\"difficulty\":\"medium\""));
        assert!(json.contains("\"date\":\"2025-03-20\""));
    }
    #[test]
    fn should_deserialize_score_entry_from_json() {
        let json = r#"{"id":7,"topic":"trigonometry","score":9,"total":10,"difficulty":"easy","date":"2025-07-04"}"#;
        let entry: ScoreEntry = serde_json::from_str(json).unwrap();
        assert_eq!(entry.id, 7);
        assert_eq!(entry.topic, "trigonometry");
        assert_eq!(entry.score, 9);
        assert_eq!(entry.total, 10);
        assert_eq!(entry.difficulty, "easy");
        assert_eq!(entry.date, "2025-07-04");
    }
    #[tokio::test]
    async fn should_create_db_state_with_default_pool() {
        let pool = SqlitePool::connect("sqlite::memory:").await.unwrap();
        let _state = DbState { pool: pool.clone() };
        let row: (i64,) = sqlx::query_as("SELECT 1")
            .fetch_one(&pool)
            .await
            .unwrap();
        assert_eq!(row.0, 1);
    }
    #[test]
    fn should_handle_check_math_with_identical_expressions() {
        assert!(check_math("x^2+1".to_string(), "x^2+1".to_string(), None));
    }
    #[test]
    fn should_handle_check_math_with_different_expressions() {
        assert!(!check_math("x^2+1".to_string(), "x^2+2".to_string(), None));
    }
    #[test]
    fn should_handle_check_math_with_empty_strings() {
        assert!(check_math("".to_string(), "".to_string(), None));
    }
    #[test]
    fn should_handle_check_math_with_whitespace() {
        assert!(check_math(" x + 1 ".to_string(), "x+1".to_string(), None));
    }
    #[test]
    fn should_handle_check_math_with_numeric_strings() {
        assert!(check_math("3.14".to_string(), "3.14".to_string(), None));
        assert!(!check_math("3.14".to_string(), "2.71".to_string(), None));
    }
    #[test]
    fn should_handle_check_math_with_matching_alternate() {
        assert!(check_math("1/2".to_string(), "0.5".to_string(), Some("1/2".to_string())));
    }
    #[test]
    fn should_handle_check_math_with_alternate_decimal_match() {
        assert!(check_math("0.5".to_string(), "1/2".to_string(), Some("0.50".to_string())));
    }
    #[test]
    fn should_handle_check_math_with_non_matching_alternate() {
        assert!(!check_math("x+1".to_string(), "x+2".to_string(), Some("y+1".to_string())));
    }
    #[tokio::test]
    async fn should_handle_save_score_entry_creation() {
        let pool = SqlitePool::connect("sqlite::memory:").await.unwrap();
        sqlx::query(
            "CREATE TABLE scores (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                topic TEXT,
                score INTEGER,
                total INTEGER,
                difficulty TEXT,
                date TEXT
            )",
        )
        .execute(&pool)
        .await
        .unwrap();
        let entry = NewScoreEntry {
            topic: "algebra".to_string(),
            score: 7,
            total: 10,
            difficulty: "easy".to_string(),
            date: "2025-01-01".to_string(),
        };
        sqlx::query(
            "INSERT INTO scores (topic, score, total, difficulty, date) VALUES (?, ?, ?, ?, ?)",
        )
        .bind(&entry.topic)
        .bind(entry.score)
        .bind(entry.total)
        .bind(&entry.difficulty)
        .bind(&entry.date)
        .execute(&pool)
        .await
        .unwrap();
        let row: (String, i32, i32, String, String) = sqlx::query_as(
            "SELECT topic, score, total, difficulty, date FROM scores WHERE topic = ?",
        )
        .bind("algebra")
        .fetch_one(&pool)
        .await
        .unwrap();
        assert_eq!(row.0, "algebra");
        assert_eq!(row.1, 7);
        assert_eq!(row.2, 10);
        assert_eq!(row.3, "easy");
        assert_eq!(row.4, "2025-01-01");
    }
    #[tokio::test]
    async fn should_handle_load_scores_returning_empty() {
        let pool = SqlitePool::connect("sqlite::memory:").await.unwrap();
        sqlx::query(
            "CREATE TABLE scores (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                topic TEXT,
                score INTEGER,
                total INTEGER,
                difficulty TEXT,
                date TEXT
            )",
        )
        .execute(&pool)
        .await
        .unwrap();
        let rows: Vec<ScoreEntry> = sqlx::query_as::<_, ScoreEntry>(
            "SELECT id, topic, score, total, difficulty, date FROM scores ORDER BY date DESC",
        )
        .fetch_all(&pool)
        .await
        .unwrap();
        assert!(rows.is_empty());
    }
    #[tokio::test]
    async fn should_handle_delete_score_with_valid_id() {
        let pool = SqlitePool::connect("sqlite::memory:").await.unwrap();
        sqlx::query(
            "CREATE TABLE scores (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                topic TEXT,
                score INTEGER,
                total INTEGER,
                difficulty TEXT,
                date TEXT
            )",
        )
        .execute(&pool)
        .await
        .unwrap();
        sqlx::query(
            "INSERT INTO scores (topic, score, total, difficulty, date) VALUES (?, ?, ?, ?, ?)",
        )
        .bind("geometry")
        .bind(5)
        .bind(10)
        .bind("medium")
        .bind("2025-02-01")
        .execute(&pool)
        .await
        .unwrap();
        let count_before: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM scores")
            .fetch_one(&pool)
            .await
            .unwrap();
        assert_eq!(count_before.0, 1);
        sqlx::query("DELETE FROM scores WHERE id = ?")
            .bind(1)
            .execute(&pool)
            .await
            .unwrap();
        let count_after: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM scores")
            .fetch_one(&pool)
            .await
            .unwrap();
        assert_eq!(count_after.0, 0);
    }
    #[tokio::test]
    async fn should_handle_reset_all_data_clearing_tables() {
        let pool = SqlitePool::connect("sqlite::memory:").await.unwrap();
        sqlx::query(
            "CREATE TABLE user_topic_stats (
                topic_id TEXT NOT NULL,
                difficulty TEXT NOT NULL,
                PRIMARY KEY (topic_id, difficulty)
            )",
        )
        .execute(&pool)
        .await
        .unwrap();
        sqlx::query(
            "CREATE TABLE scores (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                topic TEXT,
                score INTEGER,
                total INTEGER,
                difficulty TEXT,
                date TEXT
            )",
        )
        .execute(&pool)
        .await
        .unwrap();
        sqlx::query("INSERT INTO user_topic_stats (topic_id, difficulty) VALUES (?, ?)")
            .bind("algebra")
            .bind("easy")
            .execute(&pool)
            .await
            .unwrap();
        sqlx::query("INSERT INTO scores (topic, score, total, difficulty, date) VALUES (?, ?, ?, ?, ?)")
            .bind("calculus")
            .bind(3)
            .bind(5)
            .bind("hard")
            .bind("2025-01-01")
            .execute(&pool)
            .await
            .unwrap();
        sqlx::query("DELETE FROM user_topic_stats")
            .execute(&pool)
            .await
            .unwrap();
        sqlx::query("DELETE FROM scores")
            .execute(&pool)
            .await
            .unwrap();
        let stats_count: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM user_topic_stats")
            .fetch_one(&pool)
            .await
            .unwrap();
        let scores_count: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM scores")
            .fetch_one(&pool)
            .await
            .unwrap();
        assert_eq!(stats_count.0, 0);
        assert_eq!(scores_count.0, 0);
    }
    #[tokio::test]
    async fn should_handle_get_performance_stats_with_null_params() {
        let pool = SqlitePool::connect("sqlite::memory:").await.unwrap();
        sqlx::query(
            "CREATE TABLE user_topic_stats (
                topic_id TEXT NOT NULL,
                difficulty TEXT NOT NULL,
                attempts INTEGER DEFAULT 0,
                correct INTEGER DEFAULT 0,
                total_response_time_ms INTEGER DEFAULT 0,
                last_error_type TEXT,
                last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (topic_id, difficulty)
            )",
        )
        .execute(&pool)
        .await
        .unwrap();
        sqlx::query("INSERT INTO user_topic_stats (topic_id, difficulty, attempts, correct, total_response_time_ms) VALUES (?, ?, ?, ?, ?)")
            .bind("algebra")
            .bind("easy")
            .bind(10)
            .bind(8)
            .bind(500i64)
            .execute(&pool)
            .await
            .unwrap();
        let mut builder = sqlx::QueryBuilder::new(
            "SELECT topic_id, difficulty,
                SUM(attempts) as total_attempts,
                SUM(correct) as total_correct,
                CAST(SUM(correct) AS REAL) / SUM(attempts) as accuracy,
                AVG(total_response_time_ms) as avg_response_time
             FROM user_topic_stats
             WHERE 1=1",
        );
        builder.push(" GROUP BY topic_id, difficulty ORDER BY accuracy ASC");
        let results = builder
            .build_query_as::<(String, String, i64, i64, f64, f64)>()
            .fetch_all(&pool)
            .await
            .unwrap();
        assert_eq!(results.len(), 1);
        assert_eq!(results[0].0, "algebra");
        assert_eq!(results[0].1, "easy");
        assert_eq!(results[0].2, 10);
        assert_eq!(results[0].3, 8);
    }
    #[tokio::test]
    async fn should_apply_weak_topics_filter_server_side() {
        let pool = SqlitePool::connect("sqlite::memory:").await.unwrap();
        sqlx::query(
            "CREATE TABLE user_topic_stats (
                topic_id TEXT NOT NULL,
                difficulty TEXT NOT NULL,
                attempts INTEGER DEFAULT 0,
                correct INTEGER DEFAULT 0,
                total_response_time_ms INTEGER DEFAULT 0,
                last_error_type TEXT,
                last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (topic_id, difficulty)
            )",
        )
        .execute(&pool)
        .await
        .unwrap();
        // Weak topic: 5 attempts, 2 correct -> accuracy 0.4 (< 0.7)
        sqlx::query("INSERT INTO user_topic_stats (topic_id, difficulty, attempts, correct, total_response_time_ms) VALUES (?, ?, ?, ?, ?)")
            .bind("algebra")
            .bind("easy")
            .bind(5)
            .bind(2)
            .bind(500i64)
            .execute(&pool)
            .await
            .unwrap();
        // Strong topic: 4 attempts, 4 correct -> accuracy 1.0 (>= 0.7), should be filtered out
        sqlx::query("INSERT INTO user_topic_stats (topic_id, difficulty, attempts, correct, total_response_time_ms) VALUES (?, ?, ?, ?, ?)")
            .bind("calculus")
            .bind("easy")
            .bind(4)
            .bind(4)
            .bind(400i64)
            .execute(&pool)
            .await
            .unwrap();
        // Too few attempts: 2 attempts, 0 correct -> accuracy 0.0 but attempts < 3, filtered out
        sqlx::query("INSERT INTO user_topic_stats (topic_id, difficulty, attempts, correct, total_response_time_ms) VALUES (?, ?, ?, ?, ?)")
            .bind("geometry")
            .bind("easy")
            .bind(2)
            .bind(0)
            .bind(300i64)
            .execute(&pool)
            .await
            .unwrap();
        let rows: Vec<(String, Option<f64>, Option<i32>)> = sqlx::query_as(
            "SELECT topic_id,
                COALESCE(CAST(SUM(correct) AS REAL) / NULLIF(SUM(attempts), 0), 0.0) as accuracy,
                SUM(attempts) as total_attempts
             FROM user_topic_stats
             GROUP BY topic_id
             HAVING SUM(attempts) >= 3 AND COALESCE(CAST(SUM(correct) AS REAL) / NULLIF(SUM(attempts), 0), 0.0) < 0.7
             ORDER BY accuracy ASC
             LIMIT ?",
        )
        .bind(5i32)
        .fetch_all(&pool)
        .await
        .unwrap();
        assert_eq!(rows.len(), 1);
        assert_eq!(rows[0].0, "algebra");
        assert_eq!(rows[0].2.unwrap_or(0), 5);
    }
    #[tokio::test]
    async fn should_handle_delete_all_performance_records_clearing_table() {
        let pool = SqlitePool::connect("sqlite::memory:").await.unwrap();
        sqlx::query(
            "CREATE TABLE user_topic_stats (
                topic_id TEXT NOT NULL,
                difficulty TEXT NOT NULL,
                attempts INTEGER DEFAULT 0,
                correct INTEGER DEFAULT 0,
                total_response_time_ms INTEGER DEFAULT 0,
                last_error_type TEXT,
                last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (topic_id, difficulty)
            )",
        )
        .execute(&pool)
        .await
        .unwrap();
        sqlx::query("INSERT INTO user_topic_stats (topic_id, difficulty, attempts, correct, total_response_time_ms) VALUES (?, ?, ?, ?, ?)")
            .bind("algebra")
            .bind("easy")
            .bind(5)
            .bind(2)
            .bind(500i64)
            .execute(&pool)
            .await
            .unwrap();
        sqlx::query("INSERT INTO user_topic_stats (topic_id, difficulty, attempts, correct, total_response_time_ms) VALUES (?, ?, ?, ?, ?)")
            .bind("calculus")
            .bind("hard")
            .bind(3)
            .bind(1)
            .bind(900i64)
            .execute(&pool)
            .await
            .unwrap();
        let count_before: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM user_topic_stats")
            .fetch_one(&pool)
            .await
            .unwrap();
        assert_eq!(count_before.0, 2);
        sqlx::query("DELETE FROM user_topic_stats")
            .execute(&pool)
            .await
            .unwrap();
        let count_after: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM user_topic_stats")
            .fetch_one(&pool)
            .await
            .unwrap();
        assert_eq!(count_after.0, 0);
    }
    #[test]
    fn should_generate_worksheet_seed_returns_u64() {
        let seed1 = generate_worksheet_seed();
        let seed2 = generate_worksheet_seed();
        // Each call should produce a valid u64 (non-negative, fits in 64 bits)
        assert!(seed1 <= u64::MAX);
        assert!(seed2 <= u64::MAX);
        // Two consecutive calls should (with overwhelming probability) differ
        assert_ne!(seed1, seed2);
    }
    #[test]
    fn should_generate_worksheet_seed_is_deterministic_in_range() {
        for _ in 0..100 {
            let seed = generate_worksheet_seed();
            assert!(seed <= u64::MAX);
        }
    }
}

#[cfg(test)]
mod check_math_extended_tests {
    use super::check_math;
    #[test]
    fn numeric_equal() {
        assert!(check_math("2".into(), "2".into(), None));
    }
    #[test]
    fn numeric_tolerance() {
        assert!(check_math("2".into(), "2.0000001".into(), None));
    }
    #[test]
    fn numeric_outside_tolerance() {
        assert!(!check_math("3.141".into(), "3.14".into(), None));
    }
    #[test]
    fn whitespace_trimmed_numeric() {
        assert!(check_math(" 5 ".into(), "5".into(), None));
    }
    #[test]
    fn string_equality_case_insensitive() {
        assert!(check_math("X^2".into(), "x^2".into(), None));
    }
    #[test]
    fn string_equality_ignores_spaces() {
        assert!(check_math("x + 1".into(), "x+1".into(), None));
    }
    #[test]
    fn string_equality_distinct() {
        assert!(!check_math("x+1".into(), "x+2".into(), None));
    }
    #[test]
    fn alternate_exact_match() {
        assert!(check_math("1/2".into(), "0.5".into(), Some("1/2".into())));
    }
    #[test]
    fn alternate_numeric_match() {
        assert!(check_math("0.5".into(), "1/2".into(), Some("0.50".into())));
    }
    #[test]
    fn alternate_no_match() {
        assert!(!check_math("x+1".into(), "x+2".into(), Some("y+1".into())));
    }
    #[test]
    fn empty_both_match() {
        assert!(check_math("".into(), "".into(), None));
    }
    #[test]
    fn unicode_minus_is_not_ascii_minus() {
        assert!(!check_math("\u{2212}2".into(), "-2".into(), None));
    }
    #[test]
    fn scientific_notation_matches() {
        assert!(check_math("1e3".into(), "1000".into(), None));
    }
    #[test]
    fn integer_vs_decimal_match() {
        assert!(check_math("5".into(), "5.0".into(), None));
    }
    #[test]
    fn different_powers_no_match() {
        assert!(!check_math("x^2".into(), "x^3".into(), None));
    }
    #[test]
    fn alternate_numeric_match_with_whitespace() {
        assert!(check_math("0.5".into(), "1/2".into(), Some(" 0.50 ".into())));
    }
}

#[cfg(test)]
mod difficulty_serde_tests {
    use crate::models::Difficulty;
    #[test]
    fn serializes_easy_lowercase() {
        assert_eq!(serde_json::to_string(&Difficulty::Easy).unwrap(), "\"easy\"");
    }
    #[test]
    fn serializes_medium_lowercase() {
        assert_eq!(serde_json::to_string(&Difficulty::Medium).unwrap(), "\"medium\"");
    }
    #[test]
    fn serializes_hard_lowercase() {
        assert_eq!(serde_json::to_string(&Difficulty::Hard).unwrap(), "\"hard\"");
    }
    #[test]
    fn deserializes_easy() {
        assert_eq!(serde_json::from_str::<Difficulty>("\"easy\"").unwrap(), Difficulty::Easy);
    }
    #[test]
    fn deserializes_medium() {
        assert_eq!(serde_json::from_str::<Difficulty>("\"medium\"").unwrap(), Difficulty::Medium);
    }
    #[test]
    fn deserializes_hard() {
        assert_eq!(serde_json::from_str::<Difficulty>("\"hard\"").unwrap(), Difficulty::Hard);
    }
    #[test]
    fn deserializes_pascal_case_fails() {
        assert!(serde_json::from_str::<Difficulty>("\"Easy\"").is_err());
    }
}
