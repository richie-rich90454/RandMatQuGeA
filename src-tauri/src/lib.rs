#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use std::fs;
use tauri::Emitter;

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
fn save_score(entry: ScoreEntry) -> Result<(), String> {
    let path = "scores.json";
    let mut scores: Vec<ScoreEntry> = if let Ok(data) = fs::read_to_string(path) {
        serde_json::from_str(&data).unwrap_or_default()
    } else {
        Vec::new()
    };
    scores.push(entry);
    fs::write(
        path,
        serde_json::to_string(&scores).map_err(|e| e.to_string())?,
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn load_scores() -> Result<Vec<ScoreEntry>, String> {
    let path = "scores.json";
    let data = fs::read_to_string(path).map_err(|e| e.to_string())?;
    serde_json::from_str(&data).map_err(|e| e.to_string())
}

fn spawn_show_window(app_handle: tauri::AppHandle) {
    async_runtime::spawn(async move {
        if let Some(window) = app_handle.get_webview_window("main") {
            let _ = window.show();
            let _ = window.set_focus();
        }
    });
}

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
            #[cfg(not(any(target_os = "android", target_os = "ios")))]
            {
                let icon = tauri::image::Image::from_path("icons/32x32.png")?;

                let new_question =
                    MenuItem::with_id(app, "new", "New Question", true, None::<&str>)?;
                let toggle_mental = MenuItem::with_id(
                    app,
                    "toggle_mental",
                    "Toggle Mental Mode",
                    true,
                    None::<&str>,
                )?;
                let leaderboard =
                    MenuItem::with_id(app, "leaderboard", "Show Leaderboard", true, None::<&str>)?;
                let quit = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;

                let menu =
                    Menu::with_items(app, &[&new_question, &toggle_mental, &leaderboard, &quit])?;

                let _tray = TrayIconBuilder::with_id("main")
                    .icon(icon)
                    .menu(&menu)
                    .show_menu_on_left_click(false)
                    .on_menu_event(|app, event| match event.id.as_ref() {
                        "quit" => {
                            app.exit(0);
                        }
                        "new" => {
                            let _ = app.emit("generate-question", ());
                            spawn_show_window(app.clone());
                        }
                        "toggle_mental" => {
                            let _ = app.emit("toggle-mental", ());
                            spawn_show_window(app.clone());
                        }
                        "leaderboard" => {
                            let _ = app.emit("show-leaderboard", ());
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
