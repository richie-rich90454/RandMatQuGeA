#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use sqlx::SqlitePool;
use std::sync::atomic::{AtomicBool, Ordering};
use tauri::window::Effect;
use tauri::Manager;
use tauri_utils::config::WindowEffectsConfig;

#[cfg(desktop)]
use tauri::{
    async_runtime,
    menu::{Menu, MenuItem},
    tray::{MouseButton, TrayIconBuilder, TrayIconEvent},
    Runtime,
};

#[derive(Serialize, Deserialize, Clone, sqlx::FromRow)]
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

static ALLOW_CLOSE: AtomicBool = AtomicBool::new(false);

#[tauri::command]
fn check_math(user_expr: String, correct_expr: String) -> bool {
    let user_num = user_expr.trim().parse::<f64>();
    let correct_num = correct_expr.trim().parse::<f64>();
    if let (Ok(u), Ok(c)) = (user_num, correct_num) {
        return (u - c).abs() < 1e-8;
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
        "SELECT topic, score, total, difficulty, date FROM scores ORDER BY date DESC",
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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
		.plugin(tauri_plugin_shell::init())
		.plugin(tauri_plugin_process::init())
		.plugin(tauri_plugin_updater::Builder::new().build())
		.invoke_handler(tauri::generate_handler![
			check_math,
			save_score,
			load_scores
		])
		.setup(|app| {
			let handle = app.handle().clone();

			let pool = tauri::async_runtime::block_on(async move {
				let data_dir = handle
					.path()
					.app_data_dir()
					.unwrap_or_else(|_| std::env::temp_dir());

				let _ = std::fs::create_dir_all(&data_dir);

				let db_path = data_dir.join("scores.db");
				let db_url = format!(
					"sqlite://{}",
					db_path.to_string_lossy().replace('\\', "/")
				);

				let p = SqlitePool::connect(&db_url)
					.await
					.map_err(|e| e.to_string())?;

				sqlx::query("CREATE TABLE IF NOT EXISTS scores (id INTEGER PRIMARY KEY AUTOINCREMENT, topic TEXT, score INTEGER, total INTEGER, difficulty TEXT, date TEXT);")
					.execute(&p)
					.await
					.map_err(|e| e.to_string())?;

				Ok::<SqlitePool, String>(p)
			})
			.expect("Database initialization failed");

			app.manage(DbState { pool });

			if let Some(window) = app.get_webview_window("main") {
				#[cfg(desktop)]
				{
					let w_clone = window.clone();
					window.on_window_event(move |event| {
						if let tauri::WindowEvent::CloseRequested { api, .. } = event {
							if !ALLOW_CLOSE.load(Ordering::SeqCst) {
								api.prevent_close();
								let _ = w_clone.hide();
							}
						}
					});
				}

				#[cfg(target_os = "windows")]
				{
					let _ = window.set_effects(WindowEffectsConfig {
						effects: vec![Effect::Mica],
						..Default::default()
					});
				}
			}

			#[cfg(not(any(target_os = "android", target_os = "ios")))]
			{
				let show_item =
					MenuItem::with_id(app, "show", "Show", true, None::<&str>)?;
				let quit_item =
					MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;

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
