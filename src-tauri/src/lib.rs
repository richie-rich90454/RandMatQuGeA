#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use std::fs;

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
    fs::write(path, serde_json::to_string(&scores).unwrap()).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn load_scores() -> Result<Vec<ScoreEntry>, String> {
    let path = "scores.json";
    let data = fs::read_to_string(path).map_err(|e| e.to_string())?;
    serde_json::from_str(&data).map_err(|e| e.to_string())
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
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
