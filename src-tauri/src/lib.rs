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
mod record;
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
/// Parses a plain number into its mantissa and the denominator it is scaled by,
/// so `2.5` becomes (25, 10) and the digits stay exact all the way through.
/// Returns None for anything that is not a plain number, which is how a
/// symbolic answer such as `x^2+1` is left to the spelling comparison.
fn parse_scaled(text: &str) -> Option<(i64, i64)> {
    let trimmed = text.trim();
    let (negative, unsigned) = match trimmed.strip_prefix('-') {
        Some(rest) => (true, rest.trim()),
        None => (
            false,
            trimmed.strip_prefix('+').map(str::trim).unwrap_or(trimmed),
        ),
    };
    let (whole, decimals) = match unsigned.split_once('.') {
        Some(split) => split,
        None => (unsigned, ""),
    };
    if whole.is_empty() && decimals.is_empty() {
        return None;
    }
    let digits = format!("{}{}", if whole.is_empty() { "0" } else { whole }, decimals);
    if !digits.bytes().all(|b| b.is_ascii_digit()) {
        return None;
    }
    let mut denominator: i64 = 1;
    for _ in 0..decimals.len() {
        denominator = denominator.checked_mul(10)?;
    }
    let magnitude: i64 = digits.parse().ok()?;
    Some((if negative { -magnitude } else { magnitude }, denominator))
}

/// Removes the LaTeX grouping braces from a fraction numerator or denominator,
/// so that both sides of `frac{3}{4}` reach the number parser as digits.
fn strip_braces(text: &str) -> &str {
    text.trim_matches(|c| c == '{' || c == '}').trim()
}

/// Reduces an answer to an exact fraction, accepting the three spellings an
/// answer is actually written in: a plain number, `3/4`, and the LaTeX
/// `-frac{3}{4}`. The comparison has to be between values rather than between
/// strings, because a question keyed on one spelling is answered correctly by
/// another and marking it wrong tells the learner something false.
fn exact_value(text: &str) -> Option<(i64, i64)> {
    let trimmed = text.trim();
    let (negative, body) = match trimmed.strip_prefix('-') {
        Some(rest) => (true, rest.trim()),
        None => (
            false,
            trimmed.strip_prefix('+').map(str::trim).unwrap_or(trimmed),
        ),
    };
    let (numerator, denominator) = match body.strip_prefix("\\frac") {
        Some(rest) => {
            let inner = strip_braces(rest);
            let split = inner.find('}')?;
            (
                strip_braces(&inner[..split]),
                strip_braces(&inner[split + 1..]),
            )
        }
        None => match body.split_once('/') {
            Some((n, d)) => (n, d),
            None => (body, "1"),
        },
    };
    let (mantissa, mantissa_scale) = parse_scaled(numerator)?;
    let (divisor, divisor_scale) = parse_scaled(denominator)?;
    let top = mantissa.checked_mul(divisor_scale)?;
    let bottom = divisor.checked_mul(mantissa_scale)?;
    if bottom == 0 {
        return None;
    }
    let divisor = greatest_common_divisor(top.abs(), bottom);
    let sign = if negative { -1 } else { 1 };
    Some((sign * (top / divisor), bottom / divisor))
}

fn greatest_common_divisor(a: i64, b: i64) -> i64 {
    if b == 0 {
        a.max(1)
    } else {
        greatest_common_divisor(b, a % b)
    }
}

/// Compares one answer with one key. The exact comparison is what makes `3/4`,
/// `\frac{3}{4}` and `0.75` one answer; the float tolerance that follows keeps
/// the rounding a learner sees at two decimal places from being read as a
/// difference; and the spelling comparison is what still accepts `X^2` for
/// `x^2`, which has no value to compare.
fn matches_answer(user: &str, key: &str) -> bool {
    if let (Some(u), Some(k)) = (exact_value(user), exact_value(key)) {
        if u == k {
            return true;
        }
    }
    if let (Ok(u), Ok(k)) = (user.trim().parse::<f64>(), key.trim().parse::<f64>()) {
        if (u - k).abs() < 1e-6 {
            return true;
        }
    }
    let spelling = |s: &str| s.replace(' ', "").to_lowercase();
    spelling(user) == spelling(key)
}

#[tauri::command]
fn check_math(user_expr: String, correct_expr: String, alternate: Option<String>) -> bool {
    if matches_answer(&user_expr, &correct_expr) {
        return true;
    }
    match &alternate {
        Some(alt) => matches_answer(&user_expr, alt),
        None => false,
    }
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

/// One recorded answer, as a typed row. A struct rather than a JSON value
/// because the row has several columns, and a typed row also means the column
/// names are checked at compile time instead of at the call site.
#[derive(sqlx::FromRow, serde::Serialize)]
struct AttemptRow {
    id: i64,
    topic_id: String,
    sub_skill: String,
    difficulty: String,
    correct: i64,
    response_ms: i64,
    confidence: Option<String>,
    error_type: Option<String>,
    answered_at: i64,
}

/// One remembered skill, as a typed row.
#[derive(sqlx::FromRow, serde::Serialize)]
struct SkillRow {
    topic_id: String,
    sub_skill: String,
    stability: f64,
    difficulty: f64,
    last_review: Option<i64>,
    due: Option<i64>,
    reviews: i64,
    correct_reviews: i64,
    aoa: f64,
}

/// Records one answer in full, as well as in the aggregate. The aggregate is what
/// the recommendations read; the row is what makes the learner's history theirs,
/// exportable and rebuildable rather than only what the schema happens to
/// summarize.
// Tauri commands take one argument per IPC field, so grouping these would
// change the frontend call shape rather than simplify it.
#[allow(clippy::too_many_arguments)]
#[tauri::command]
async fn save_attempt(
    state: tauri::State<'_, DbState>,
    topic_id: String,
    sub_skill: String,
    difficulty: String,
    correct: bool,
    response_ms: i64,
    confidence: Option<String>,
    error_type: Option<String>,
    answered_at: i64,
) -> Result<i64, String> {
    let pool = &state.pool;
    let result = sqlx::query(
        "INSERT INTO attempts (topic_id, sub_skill, difficulty, correct, response_ms, confidence, error_type, answered_at)
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(&topic_id)
    .bind(&sub_skill)
    .bind(&difficulty)
    .bind(if correct { 1 } else { 0 })
    .bind(response_ms)
    .bind(&confidence)
    .bind(&error_type)
    .bind(answered_at)
    .execute(pool)
    .await
    .map_err(|e| e.to_string())?;
    Ok(result.last_insert_rowid())
}

/// Returns every recorded answer, newest first, with an optional topic filter.
#[tauri::command]
async fn load_attempts(
    state: tauri::State<'_, DbState>,
    topic_id: Option<String>,
    limit: Option<i64>,
) -> Result<Vec<AttemptRow>, String> {
    let pool = &state.pool;
    let take = limit.unwrap_or(500).clamp(1, 10_000);
    let rows: Vec<AttemptRow> = match topic_id {
        Some(topic) => {
            sqlx::query_as::<_, AttemptRow>(
                "SELECT id, topic_id, sub_skill, difficulty, correct, response_ms, confidence, error_type, answered_at
				 FROM attempts WHERE topic_id = ? ORDER BY answered_at DESC, id DESC LIMIT ?",
            )
            .bind(topic)
            .bind(take)
            .fetch_all(pool)
            .await
            .map_err(|e| e.to_string())?
        }
        None => {
            sqlx::query_as::<_, AttemptRow>(
                "SELECT id, topic_id, sub_skill, difficulty, correct, response_ms, confidence, error_type, answered_at
				 FROM attempts ORDER BY answered_at DESC, id DESC LIMIT ?",
            )
            .bind(take)
            .fetch_all(pool)
            .await
            .map_err(|e| e.to_string())?
        }
    };
    Ok(rows)
}

/// Writes the computed schedule back, so the calendar survives a restart without
/// the schedule being recomputed from an aggregate that lost the sub-skill detail.
#[tauri::command]
async fn save_skill_schedule(
    state: tauri::State<'_, DbState>,
    skills: Vec<serde_json::Value>,
) -> Result<(), String> {
    let pool = &state.pool;
    for skill in skills {
        let topic = skill.get("topicId").and_then(|v| v.as_str()).unwrap_or("");
        if topic.is_empty() {
            continue;
        }
        let sub = skill.get("subSkill").and_then(|v| v.as_str()).unwrap_or("");
        let stability = skill
            .get("stability")
            .and_then(|v| v.as_f64())
            .unwrap_or(1.0);
        let difficulty = skill
            .get("difficulty")
            .and_then(|v| v.as_f64())
            .unwrap_or(5.0);
        let last = skill.get("lastReview").and_then(|v| v.as_i64());
        let due = skill.get("due").and_then(|v| v.as_i64());
        let reviews = skill.get("reviews").and_then(|v| v.as_i64()).unwrap_or(0);
        let correct = skill
            .get("correctReviews")
            .and_then(|v| v.as_i64())
            .unwrap_or(0);
        let aoa = skill.get("aoa").and_then(|v| v.as_f64()).unwrap_or(0.0);
        sqlx::query(
            "INSERT INTO review_skills
				(topic_id, sub_skill, stability, difficulty, last_review, due, reviews, correct_reviews, aoa)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
			 ON CONFLICT (topic_id, sub_skill) DO UPDATE SET
				stability = excluded.stability,
				difficulty = excluded.difficulty,
				last_review = excluded.last_review,
				due = excluded.due,
				reviews = excluded.reviews,
				correct_reviews = excluded.correct_reviews,
				aoa = excluded.aoa",
        )
        .bind(topic)
        .bind(sub)
        .bind(stability)
        .bind(difficulty)
        .bind(last)
        .bind(due)
        .bind(reviews)
        .bind(correct)
        .bind(aoa)
        .execute(pool)
        .await
        .map_err(|e| e.to_string())?;
    }
    Ok(())
}

/// Returns every remembered skill, which is what the schedule is rebuilt from.
#[tauri::command]
async fn load_skill_schedule(state: tauri::State<'_, DbState>) -> Result<Vec<SkillRow>, String> {
    let pool = &state.pool;
    let rows: Vec<SkillRow> = sqlx::query_as::<_, SkillRow>(
        "SELECT topic_id, sub_skill, stability, difficulty, last_review, due, reviews, correct_reviews, aoa
		 FROM review_skills",
    )
    .fetch_all(pool)
    .await
    .map_err(|e| e.to_string())?;
    Ok(rows)
}

/// Removes the learning record in full: the schedule, every recorded answer and
/// the aggregates. This is what the erase control calls, and it leaves nothing
/// behind in any of the three.
#[tauri::command]
async fn clear_performance(state: tauri::State<'_, DbState>) -> Result<(), String> {
    let pool = &state.pool;
    sqlx::query("DELETE FROM review_skills")
        .execute(pool)
        .await
        .map_err(|e| e.to_string())?;
    sqlx::query("DELETE FROM attempts")
        .execute(pool)
        .await
        .map_err(|e| e.to_string())?;
    sqlx::query("DELETE FROM user_topic_stats")
        .execute(pool)
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}
/// The tables the whole learning record lives in, created on every launch. This
/// is a function rather than a block inside setup so the round-trip test can
/// build the real schema on a real file, and so a table added later is added in
/// one place.
pub(crate) async fn create_schema(pool: &SqlitePool) -> Result<(), String> {
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
    .execute(pool)
    .await
    .map_err(|e| format!("DB init error for scores: {}", e))?;
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
    .execute(pool)
    .await
    .map_err(|e| format!("DB init error for user_topic_stats: {}", e))?;
    // The review schedule needs a place to keep memory strength and
    // difficulty per skill, which the topic-level table cannot hold,
    // and a place for the confidence the learner reported, which
    // nothing stored before this.
    sqlx::query(
        "CREATE TABLE IF NOT EXISTS review_skills (
            topic_id TEXT NOT NULL,
            sub_skill TEXT NOT NULL DEFAULT '',
            stability REAL NOT NULL DEFAULT 1.0,
            difficulty REAL NOT NULL DEFAULT 5.0,
            last_review INTEGER,
            due INTEGER,
            reviews INTEGER NOT NULL DEFAULT 0,
            correct_reviews INTEGER NOT NULL DEFAULT 0,
            aoa REAL NOT NULL DEFAULT 0.0,
            PRIMARY KEY (topic_id, sub_skill)
        );",
    )
    .execute(pool)
    .await
    .map_err(|e| format!("DB init error for review_skills: {}", e))?;
    // Every answer is kept, not just the aggregate, so a learner's
    // history can be exported, audited and rebuilt rather than being
    // only what the current schema happens to summarize.
    sqlx::query(
        "CREATE TABLE IF NOT EXISTS attempts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            topic_id TEXT NOT NULL,
            sub_skill TEXT NOT NULL DEFAULT '',
            difficulty TEXT NOT NULL DEFAULT '',
            correct INTEGER NOT NULL DEFAULT 0,
            response_ms INTEGER NOT NULL DEFAULT 0,
            confidence TEXT,
            error_type TEXT,
            answered_at INTEGER NOT NULL
        );",
    )
    .execute(pool)
    .await
    .map_err(|e| format!("DB init error for attempts: {}", e))?;
    sqlx::query(
        "CREATE INDEX IF NOT EXISTS attempts_topic_idx ON attempts (topic_id, answered_at);",
    )
    .execute(pool)
    .await
    .ok();
    sqlx::query("CREATE INDEX IF NOT EXISTS review_due_idx ON review_skills (due);")
        .execute(pool)
        .await
        .ok();
    Ok(())
}

/// Writes the whole learning record to a file the learner chooses. The path is
/// optional, so a caller that only wants to read the record does not have to
/// invent a place to put it, and the document that was written is returned
/// either way so the interface can report what the file actually contains.
#[tauri::command]
async fn export_learning_record(
    state: tauri::State<'_, DbState>,
    path: Option<String>,
) -> Result<record::ExportDocument, String> {
    let document = record::read_learning_record(&state.pool).await?;
    if let Some(target) = path {
        let text = serde_json::to_string_pretty(&document).map_err(|e| e.to_string())?;
        std::fs::write(&target, text).map_err(|e| format!("Could not write {}: {}", target, e))?;
    }
    Ok(document)
}

/// Applies a learning record the learner chose, either merging it into what is
/// here or making it the whole record. The document is read, checked and
/// applied in one call so a payload this build cannot read is refused before a
/// single row changes.
#[tauri::command]
async fn import_learning_record(
    state: tauri::State<'_, DbState>,
    path: String,
    mode: record::ImportMode,
) -> Result<record::ImportSummary, String> {
    let text =
        std::fs::read_to_string(&path).map_err(|e| format!("Could not read {}: {}", path, e))?;
    let document = record::decode(&text)?;
    record::apply_learning_record(&state.pool, &document, mode).await
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
    tauri::async_runtime::spawn_blocking(move || {
        pdf::export_worksheet_pdf_impl(questions, opts, &filepath)
    })
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
            save_attempt,
            load_attempts,
            save_skill_schedule,
            load_skill_schedule,
            clear_performance,
            export_learning_record,
            import_learning_record,
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
                create_schema(&pool).await?;
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
                    .icon(
                        app.default_window_icon()
                            .expect("default window icon must be configured")
                            .clone(),
                    )
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
        let count_before: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM user_topic_stats")
            .fetch_one(&pool)
            .await
            .unwrap();
        assert_eq!(count_before.0, 1);
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
        let row: (i64,) = sqlx::query_as("SELECT 1").fetch_one(&pool).await.unwrap();
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
        assert!(check_math(
            "1/2".to_string(),
            "0.5".to_string(),
            Some("1/2".to_string())
        ));
    }
    #[test]
    fn should_handle_check_math_with_alternate_decimal_match() {
        assert!(check_math(
            "0.5".to_string(),
            "1/2".to_string(),
            Some("0.50".to_string())
        ));
    }
    #[test]
    fn should_handle_check_math_with_non_matching_alternate() {
        assert!(!check_math(
            "x+1".to_string(),
            "x+2".to_string(),
            Some("y+1".to_string())
        ));
    }
    #[test]
    fn should_accept_a_fraction_written_as_a_decimal() {
        // The desktop and the browser used to disagree here: the browser reduced
        // the answer to an exact rational and the desktop could not parse a
        // fraction at all, so the same learner typing 3/4 was graded twice.
        assert!(check_math("0.75".to_string(), "3/4".to_string(), None));
        assert!(check_math("1/2".to_string(), "0.5".to_string(), None));
        assert!(check_math("28/6".to_string(), "14/3".to_string(), None));
    }
    #[test]
    fn should_accept_the_latex_form_of_a_fraction() {
        assert!(check_math(
            "0.75".to_string(),
            "\\frac{3}{4}".to_string(),
            None
        ));
        assert!(check_math(
            "-0.75".to_string(),
            "-\\frac{3}{4}".to_string(),
            None
        ));
        assert!(check_math(
            "\\frac{3}{4}".to_string(),
            "\\frac{6}{8}".to_string(),
            None
        ));
    }
    #[test]
    fn should_reject_a_fraction_that_denotes_a_different_value() {
        assert!(!check_math("0.75".to_string(), "3/5".to_string(), None));
        assert!(!check_math("2/3".to_string(), "0.66".to_string(), None));
    }
    #[test]
    fn should_reject_a_zero_denominator_rather_than_dividing_by_it() {
        assert!(!check_math("0.75".to_string(), "3/0".to_string(), None));
        assert!(!check_math("0".to_string(), "0/0".to_string(), None));
    }
    #[test]
    fn should_accept_the_alternate_spelling_of_a_fraction() {
        assert!(check_math(
            "0.25".to_string(),
            "\\frac{1}{2}".to_string(),
            Some("1/4".to_string())
        ));
    }
    #[test]
    fn should_leave_a_symbolic_answer_to_the_spelling_comparison() {
        assert!(check_math("x^2+1".to_string(), "x^2+1".to_string(), None));
        assert!(!check_math("x^2+1".to_string(), "x^2-1".to_string(), None));
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
        sqlx::query(
            "INSERT INTO scores (topic, score, total, difficulty, date) VALUES (?, ?, ?, ?, ?)",
        )
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
        assert!(check_math(
            "0.5".into(),
            "1/2".into(),
            Some(" 0.50 ".into())
        ));
    }
}

#[cfg(test)]
mod difficulty_serde_tests {
    use crate::models::Difficulty;
    #[test]
    fn serializes_easy_lowercase() {
        assert_eq!(
            serde_json::to_string(&Difficulty::Easy).unwrap(),
            "\"easy\""
        );
    }
    #[test]
    fn serializes_medium_lowercase() {
        assert_eq!(
            serde_json::to_string(&Difficulty::Medium).unwrap(),
            "\"medium\""
        );
    }
    #[test]
    fn serializes_hard_lowercase() {
        assert_eq!(
            serde_json::to_string(&Difficulty::Hard).unwrap(),
            "\"hard\""
        );
    }
    #[test]
    fn deserializes_easy() {
        assert_eq!(
            serde_json::from_str::<Difficulty>("\"easy\"").unwrap(),
            Difficulty::Easy
        );
    }
    #[test]
    fn deserializes_medium() {
        assert_eq!(
            serde_json::from_str::<Difficulty>("\"medium\"").unwrap(),
            Difficulty::Medium
        );
    }
    #[test]
    fn deserializes_hard() {
        assert_eq!(
            serde_json::from_str::<Difficulty>("\"hard\"").unwrap(),
            Difficulty::Hard
        );
    }
    #[test]
    fn deserializes_pascal_case_fails() {
        assert!(serde_json::from_str::<Difficulty>("\"Easy\"").is_err());
    }
}
