/**
 * @file record.rs - The whole learning record as one versioned document.
 * @date 2026-10-01
 * @description Export and import read and write the same document, so a learner
 * can move between devices without losing the history behind the recommendations.
 *
 * The document is versioned and typed rather than a blob, because a record that
 * cannot be checked is a record that has to be trusted blindly on import. A
 * payload this build cannot read is refused with the reason rather than being
 * half-applied, and an import is one transaction so a failure leaves the local
 * record exactly as it was.
 *
 * The document carries the schedule twice over, as the desktop keeps it in a
 * table and the browser keeps it as a map in the storage module. Both spellings
 * are in the format so a file written by one build can be read by the other:
 * `review` is the browser's spelling, `skills` is the table's, and an import
 * takes whichever it is given.
 */
use serde::{Deserialize, Serialize};
use sqlx::{Sqlite, SqlitePool, Transaction};
use std::collections::BTreeMap;
use std::time::{SystemTime, UNIX_EPOCH};

/// The version of the document this build writes and is willing to read.
pub const EXPORT_VERSION: u32 = 1;

/// The application that wrote a document, so a file from somewhere else is refused.
pub const EXPORT_APP: &str = "randmatqugea";

/// One recorded answer, as the document carries it.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, sqlx::FromRow)]
#[serde(rename_all = "camelCase")]
pub struct ExportAttempt {
    pub id: i64,
    pub topic_id: String,
    pub sub_skill: String,
    pub difficulty: String,
    pub correct: i64,
    pub response_ms: i64,
    pub confidence: Option<String>,
    pub error_type: Option<String>,
    pub answered_at: i64,
}

/// One remembered skill, as the document carries it.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, sqlx::FromRow)]
#[serde(rename_all = "camelCase")]
pub struct ExportSkill {
    pub topic_id: String,
    pub sub_skill: String,
    pub stability: f64,
    pub difficulty: f64,
    pub last_review: Option<i64>,
    pub due: Option<i64>,
    pub reviews: i64,
    pub correct_reviews: i64,
    pub aoa: f64,
}

/// One row of the aggregate the recommendations read.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, sqlx::FromRow)]
#[serde(rename_all = "camelCase")]
pub struct ExportStat {
    pub topic_id: String,
    pub difficulty: String,
    pub attempts: i64,
    pub correct: i64,
    pub total_response_time_ms: i64,
    pub last_error_type: Option<String>,
    pub last_updated: Option<String>,
}

/// One remembered skill in the browser's spelling, which is a single number per
/// field rather than a row.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ReviewRecord {
    pub stability: f64,
    pub difficulty: f64,
    #[serde(default)]
    pub last_review: Option<i64>,
    #[serde(default)]
    pub due: Option<i64>,
    pub reviews: i64,
    pub correct_reviews: i64,
    pub aoa: f64,
}

/// The document a browser build persists the review record as, keyed by skill.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct ReviewDocument {
    pub version: u32,
    pub records: BTreeMap<String, ReviewRecord>,
}

/// The whole learning record.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExportDocument {
    pub app: String,
    pub version: u32,
    pub exported_at: i64,
    #[serde(default)]
    pub review: Option<ReviewDocument>,
    #[serde(default)]
    pub stats: Vec<ExportStat>,
    #[serde(default)]
    pub attempts: Vec<ExportAttempt>,
    #[serde(default)]
    pub skills: Vec<ExportSkill>,
}

/// What an import does with the record that is already here.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ImportMode {
    /// Keep what is here and add the file to it.
    Merge,
    /// Make the file the whole record.
    Replace,
}

/// What an import wrote, so the interface can say what happened rather than
/// leaving the learner to guess.
#[derive(Debug, Clone, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ImportSummary {
    pub mode: ImportMode,
    pub attempts: usize,
    pub skills: usize,
    pub stats: usize,
    pub records: usize,
}

/// The current time in epoch milliseconds, which is how every date in the
/// database is already stored.
fn now_ms() -> i64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_millis() as i64)
        .unwrap_or(0)
}

/// Reads the whole learning record out of the database. Nothing is summarized
/// on the way out: the aggregate, every recorded answer and every remembered
/// skill are carried as they are, so that a file is the record rather than a
/// summary of it.
pub async fn read_learning_record(pool: &SqlitePool) -> Result<ExportDocument, String> {
    let stats = sqlx::query_as::<_, ExportStat>(
        "SELECT topic_id, difficulty, attempts, correct, total_response_time_ms, last_error_type, last_updated
		 FROM user_topic_stats ORDER BY topic_id, difficulty",
    )
    .fetch_all(pool)
    .await
    .map_err(|e| e.to_string())?;
    let attempts = sqlx::query_as::<_, ExportAttempt>(
        "SELECT id, topic_id, sub_skill, difficulty, correct, response_ms, confidence, error_type, answered_at
		 FROM attempts ORDER BY answered_at, id",
    )
    .fetch_all(pool)
    .await
    .map_err(|e| e.to_string())?;
    let skills = sqlx::query_as::<_, ExportSkill>(
        "SELECT topic_id, sub_skill, stability, difficulty, last_review, due, reviews, correct_reviews, aoa
		 FROM review_skills ORDER BY topic_id, sub_skill",
    )
    .fetch_all(pool)
    .await
    .map_err(|e| e.to_string())?;
    Ok(ExportDocument {
        app: EXPORT_APP.to_string(),
        version: EXPORT_VERSION,
        exported_at: now_ms(),
        // The desktop's record of last resort is the database, so the browser's
        // spelling of it is absent rather than duplicated. The browser fills it
        // in on the way out, and reads either spelling on the way in.
        review: None,
        stats,
        attempts,
        skills,
    })
}

/// Refuses a document this build cannot read. The version is checked rather than
/// assumed, because a file from a later build may mean something different by
/// the same name and silently reading it as version one would be worse than
/// refusing it.
pub fn validate(document: &ExportDocument) -> Result<(), String> {
    if document.app != EXPORT_APP {
        return Err(format!(
            "That file was written by {}, not by {}, so nothing was imported",
            document.app, EXPORT_APP
        ));
    }
    if document.version != EXPORT_VERSION {
        return Err(format!(
            "That file is version {} and this build reads version {}, so nothing was imported",
            document.version, EXPORT_VERSION
        ));
    }
    Ok(())
}

/// Parses a document out of the text a file held, refusing anything unreadable
/// with the reason rather than panicking on it.
pub fn decode(text: &str) -> Result<ExportDocument, String> {
    let document: ExportDocument = serde_json::from_str(text)
        .map_err(|e| format!("That file is not a learning record: {}", e))?;
    validate(&document)?;
    Ok(document)
}

/// Turns one stored record key and its state into a schedule row. The browser
/// keys its record by `topic` or `topic/subSkill` and the desktop keys its table
/// the same way, so one document can say either.
fn skill_from_record(key: &str, record: &ReviewRecord) -> ExportSkill {
    let (topic_id, sub_skill) = match key.split_once('/') {
        Some((topic, sub)) => (topic.to_string(), sub.to_string()),
        None => (key.to_string(), String::new()),
    };
    ExportSkill {
        topic_id,
        sub_skill,
        stability: record.stability,
        difficulty: record.difficulty,
        last_review: record.last_review,
        due: record.due,
        reviews: record.reviews,
        correct_reviews: record.correct_reviews,
        aoa: record.aoa,
    }
}

/// Writes one schedule row, replacing whatever was there for the same skill.
/// Neither the schedule nor the aggregate can be recomputed from the answers,
/// because the aggregate is keyed by difficulty and the answers are not, so a
/// merge takes the file's row for a skill it mentions.
async fn upsert_skill(tx: &mut Transaction<'_, Sqlite>, skill: &ExportSkill) -> Result<(), String> {
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
    .bind(&skill.topic_id)
    .bind(&skill.sub_skill)
    .bind(skill.stability)
    .bind(skill.difficulty)
    .bind(skill.last_review)
    .bind(skill.due)
    .bind(skill.reviews)
    .bind(skill.correct_reviews)
    .bind(skill.aoa)
    .execute(&mut **tx)
    .await
    .map_err(|e| e.to_string())?;
    Ok(())
}

/// Writes one aggregate row, replacing whatever was there for the same topic and
/// difficulty, for the same reason as the schedule above.
async fn upsert_stat(tx: &mut Transaction<'_, Sqlite>, stat: &ExportStat) -> Result<(), String> {
    sqlx::query(
        "INSERT INTO user_topic_stats
			(topic_id, difficulty, attempts, correct, total_response_time_ms, last_error_type, last_updated)
		 VALUES (?, ?, ?, ?, ?, ?, ?)
		 ON CONFLICT (topic_id, difficulty) DO UPDATE SET
			attempts = excluded.attempts,
			correct = excluded.correct,
			total_response_time_ms = excluded.total_response_time_ms,
			last_error_type = excluded.last_error_type,
			last_updated = excluded.last_updated",
    )
    .bind(&stat.topic_id)
    .bind(&stat.difficulty)
    .bind(stat.attempts)
    .bind(stat.correct)
    .bind(stat.total_response_time_ms)
    .bind(&stat.last_error_type)
    .bind(&stat.last_updated)
    .execute(&mut **tx)
    .await
    .map_err(|e| e.to_string())?;
    Ok(())
}

/// Applies an imported document. Every write happens in one transaction, so a
/// failure part-way through leaves the learner's own record untouched rather
/// than half of a file on top of it.
///
/// The two modes differ only where they have to. Replacing clears the three
/// tables first, which is what makes the file the whole record; merging adds to
/// them. Either way the schedule and the aggregate are written per key, because
/// neither can be derived from the answers.
pub async fn apply_learning_record(
    pool: &SqlitePool,
    document: &ExportDocument,
    mode: ImportMode,
) -> Result<ImportSummary, String> {
    validate(document)?;
    let replacing = mode == ImportMode::Replace;
    let mut tx = pool.begin().await.map_err(|e| e.to_string())?;
    if replacing {
        sqlx::query("DELETE FROM attempts")
            .execute(&mut *tx)
            .await
            .map_err(|e| e.to_string())?;
        sqlx::query("DELETE FROM review_skills")
            .execute(&mut *tx)
            .await
            .map_err(|e| e.to_string())?;
        sqlx::query("DELETE FROM user_topic_stats")
            .execute(&mut *tx)
            .await
            .map_err(|e| e.to_string())?;
    }
    for attempt in &document.attempts {
        // A merge lets the table number the new answer, because a number that
        // was given on another device says nothing about this one.
        if replacing {
            sqlx::query(
                "INSERT INTO attempts
					(id, topic_id, sub_skill, difficulty, correct, response_ms, confidence, error_type, answered_at)
				 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            )
            .bind(attempt.id)
            .bind(&attempt.topic_id)
            .bind(&attempt.sub_skill)
            .bind(&attempt.difficulty)
            .bind(attempt.correct)
            .bind(attempt.response_ms)
            .bind(&attempt.confidence)
            .bind(&attempt.error_type)
            .bind(attempt.answered_at)
            .execute(&mut *tx)
            .await
            .map_err(|e| e.to_string())?;
        } else {
            sqlx::query(
                "INSERT INTO attempts
					(topic_id, sub_skill, difficulty, correct, response_ms, confidence, error_type, answered_at)
				 VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            )
            .bind(&attempt.topic_id)
            .bind(&attempt.sub_skill)
            .bind(&attempt.difficulty)
            .bind(attempt.correct)
            .bind(attempt.response_ms)
            .bind(&attempt.confidence)
            .bind(&attempt.error_type)
            .bind(attempt.answered_at)
            .execute(&mut *tx)
            .await
            .map_err(|e| e.to_string())?;
        }
    }
    for skill in &document.skills {
        upsert_skill(&mut tx, skill).await?;
    }
    let records = match &document.review {
        Some(review) => review.records.len(),
        None => 0,
    };
    if let Some(review) = &document.review {
        for (key, record) in &review.records {
            let skill = skill_from_record(key, record);
            upsert_skill(&mut tx, &skill).await?;
        }
    }
    for stat in &document.stats {
        upsert_stat(&mut tx, stat).await?;
    }
    if replacing {
        // Restoring the answers' own numbers leaves the counter that numbers new
        // ones behind, so the next answer recorded here would collide with an
        // imported one. The table only exists once an autoincrement table has
        // been written to, and without it SQLite numbers the next row from the
        // largest one present, which is already right.
        let sequenced: i64 = sqlx::query_scalar(
            "SELECT COUNT(*) FROM sqlite_master WHERE type = 'table' AND name = 'sqlite_sequence'",
        )
        .fetch_one(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;
        if sequenced > 0 {
            sqlx::query(
                "UPDATE sqlite_sequence SET seq = MAX(seq, COALESCE((SELECT MAX(id) FROM attempts), 0)) WHERE name = 'attempts'",
            )
            .execute(&mut *tx)
            .await
            .map_err(|e| e.to_string())?;
        }
    }
    tx.commit().await.map_err(|e| e.to_string())?;
    Ok(ImportSummary {
        mode,
        attempts: document.attempts.len(),
        skills: document.skills.len() + records,
        stats: document.stats.len(),
        records,
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::create_schema;

    /// A fresh path in the temporary directory, so a round trip runs through a
    /// real file the way the running app does rather than an in-memory database
    /// that would not exercise the same path.
    fn temp_db_path(name: &str) -> std::path::PathBuf {
        let unique = now_ms();
        std::env::temp_dir().join(format!("randmatqugea-record-{}-{}.db", name, unique))
    }

    /// Opens a real database file with the shipped schema and hands it back with
    /// the path, so a test can remove the file when it is finished.
    async fn open_real_db(name: &str) -> (SqlitePool, std::path::PathBuf) {
        let path = temp_db_path(name);
        let pool = SqlitePool::connect(&format!("sqlite:{}?mode=rwc", path.to_string_lossy()))
            .await
            .unwrap();
        create_schema(&pool).await.unwrap();
        (pool, path)
    }

    async fn seed(pool: &SqlitePool) {
        sqlx::query(
            "INSERT INTO attempts (id, topic_id, sub_skill, difficulty, correct, response_ms, confidence, error_type, answered_at)
			 VALUES (7, 'linear_eq', 'two_step', 'medium', 1, 4200, 'high', NULL, 1700000000000)",
        )
        .execute(pool)
        .await
        .unwrap();
        sqlx::query(
            "INSERT INTO attempts (id, topic_id, sub_skill, difficulty, correct, response_ms, confidence, error_type, answered_at)
			 VALUES (8, 'geometry', '', 'easy', 0, 9100, NULL, 'sign', 1700000060000)",
        )
        .execute(pool)
        .await
        .unwrap();
        sqlx::query(
            "INSERT INTO review_skills (topic_id, sub_skill, stability, difficulty, last_review, due, reviews, correct_reviews, aoa)
			 VALUES ('linear_eq', 'two_step', 4.5, 6.0, 1700000000000, 1700600000000, 3, 2, 0.25)",
        )
        .execute(pool)
        .await
        .unwrap();
        sqlx::query(
            "INSERT INTO user_topic_stats (topic_id, difficulty, attempts, correct, total_response_time_ms, last_error_type, last_updated)
			 VALUES ('linear_eq', 'medium', 3, 2, 12600, NULL, '2026-01-02 03:04:05')",
        )
        .execute(pool)
        .await
        .unwrap();
    }

    #[tokio::test]
    async fn round_trip_through_a_real_file_preserves_the_answers_the_schedule_and_the_aggregate() {
        let (source, source_path) = open_real_db("round-trip-source").await;
        seed(&source).await;
        let document = read_learning_record(&source).await.unwrap();
        assert_eq!(document.app, EXPORT_APP);
        assert_eq!(document.version, EXPORT_VERSION);
        assert_eq!(document.attempts.len(), 2);
        assert_eq!(document.skills.len(), 1);
        assert_eq!(document.stats.len(), 1);
        let text = serde_json::to_string(&document).unwrap();
        source.close().await;
        let _ = std::fs::remove_file(&source_path);

        let (target, target_path) = open_real_db("round-trip-target").await;
        let imported = decode(&text).unwrap();
        let summary = apply_learning_record(&target, &imported, ImportMode::Replace)
            .await
            .unwrap();
        assert_eq!(summary.attempts, 2);
        assert_eq!(summary.skills, 1);
        assert_eq!(summary.stats, 1);

        let after = read_learning_record(&target).await.unwrap();
        assert_eq!(after.attempts, document.attempts);
        assert_eq!(after.skills, document.skills);
        assert_eq!(after.stats, document.stats);
        target.close().await;
        let _ = std::fs::remove_file(&target_path);
    }

    #[tokio::test]
    async fn a_replaced_record_becomes_exactly_what_the_file_carried() {
        let (pool, path) = open_real_db("replace").await;
        seed(&pool).await;
        sqlx::query("INSERT INTO attempts (topic_id, sub_skill, difficulty, correct, response_ms, answered_at) VALUES ('calculus', '', 'hard', 1, 1000, 1700000120000)")
            .execute(&pool)
            .await
            .unwrap();
        let document = read_learning_record(&pool).await.unwrap();
        let mut smaller = document.clone();
        smaller.attempts.retain(|a| a.topic_id == "linear_eq");
        smaller.skills.clear();
        smaller.stats.clear();
        apply_learning_record(&pool, &smaller, ImportMode::Replace)
            .await
            .unwrap();
        let after = read_learning_record(&pool).await.unwrap();
        assert_eq!(after.attempts.len(), 1);
        assert_eq!(after.attempts[0].topic_id, "linear_eq");
        assert!(after.skills.is_empty());
        assert!(after.stats.is_empty());
        pool.close().await;
        let _ = std::fs::remove_file(&path);
    }

    #[tokio::test]
    async fn a_merged_record_keeps_what_is_here_and_adds_the_file_to_it() {
        let (pool, path) = open_real_db("merge").await;
        sqlx::query("INSERT INTO review_skills (topic_id, sub_skill, stability, reviews, correct_reviews) VALUES ('calculus', '', 1.0, 1, 0)")
            .execute(&pool)
            .await
            .unwrap();
        let document = read_learning_record(&pool).await.unwrap();
        let mut incoming = document.clone();
        incoming.skills = vec![ExportSkill {
            topic_id: "geometry".to_string(),
            sub_skill: "circle".to_string(),
            stability: 9.0,
            difficulty: 3.0,
            last_review: Some(1700000000000),
            due: Some(1700600000000),
            reviews: 4,
            correct_reviews: 4,
            aoa: 0.0,
        }];
        incoming.attempts.clear();
        incoming.stats.clear();
        let summary = apply_learning_record(&pool, &incoming, ImportMode::Merge)
            .await
            .unwrap();
        assert_eq!(summary.mode, ImportMode::Merge);
        let after = read_learning_record(&pool).await.unwrap();
        let topics: Vec<String> = after.skills.iter().map(|s| s.topic_id.clone()).collect();
        assert!(topics.contains(&"calculus".to_string()));
        assert!(topics.contains(&"geometry".to_string()));
        assert_eq!(after.skills[1].stability, 9.0);
        pool.close().await;
        let _ = std::fs::remove_file(&path);
    }

    #[tokio::test]
    async fn a_merged_record_takes_the_files_schedule_for_a_skill_both_carry() {
        let (pool, path) = open_real_db("merge-skill").await;
        seed(&pool).await;
        let document = read_learning_record(&pool).await.unwrap();
        let mut incoming = document;
        incoming.skills[0].stability = 12.5;
        incoming.attempts.clear();
        incoming.stats.clear();
        apply_learning_record(&pool, &incoming, ImportMode::Merge)
            .await
            .unwrap();
        let after = read_learning_record(&pool).await.unwrap();
        assert_eq!(after.skills[0].stability, 12.5);
        assert_eq!(after.attempts.len(), 2);
        pool.close().await;
        let _ = std::fs::remove_file(&path);
    }

    #[tokio::test]
    async fn a_merged_record_numbers_a_new_answer_itself() {
        let (pool, path) = open_real_db("merge-attempt").await;
        seed(&pool).await;
        let document = read_learning_record(&pool).await.unwrap();
        let summary = apply_learning_record(&pool, &document, ImportMode::Merge)
            .await
            .unwrap();
        assert_eq!(summary.attempts, 2);
        let after = read_learning_record(&pool).await.unwrap();
        assert_eq!(after.attempts.len(), 4);
        let new_ids: Vec<i64> = after
            .attempts
            .iter()
            .filter(|a| !document.attempts.iter().any(|d| d.id == a.id))
            .map(|a| a.id)
            .collect();
        assert_eq!(new_ids.len(), 2);
        assert!(new_ids.iter().all(|id| *id > 8));
        pool.close().await;
        let _ = std::fs::remove_file(&path);
    }

    #[tokio::test]
    async fn an_import_after_a_replacement_can_still_record_a_new_answer() {
        let (pool, path) = open_real_db("sequence").await;
        seed(&pool).await;
        let document = read_learning_record(&pool).await.unwrap();
        apply_learning_record(&pool, &document, ImportMode::Replace)
            .await
            .unwrap();
        let inserted = sqlx::query("INSERT INTO attempts (topic_id, sub_skill, difficulty, correct, response_ms, answered_at) VALUES ('vectors', '', 'medium', 1, 2500, 1700000180000)")
            .execute(&pool)
            .await
            .unwrap();
        assert!(inserted.last_insert_rowid() > 8);
        pool.close().await;
        let _ = std::fs::remove_file(&path);
    }

    #[tokio::test]
    async fn a_documents_browser_record_is_read_as_the_schedule_it_names() {
        let (pool, path) = open_real_db("review").await;
        let text = r#"{
            "app": "randmatqugea",
            "version": 1,
            "exportedAt": 1700000000000,
            "review": {
                "version": 2,
                "records": {
                    "linear_eq": {"stability": 2.5, "difficulty": 5, "reviews": 2, "correctReviews": 1, "aoa": 0},
                    "geometry/circle": {"stability": 6.0, "difficulty": 4, "lastReview": 1700000000000, "due": 1700600000000, "reviews": 3, "correctReviews": 3, "aoa": 0.1}
                }
            },
            "stats": [],
            "attempts": [],
            "skills": []
        }"#;
        let document = decode(text).unwrap();
        let summary = apply_learning_record(&pool, &document, ImportMode::Replace)
            .await
            .unwrap();
        assert_eq!(summary.records, 2);
        let after = read_learning_record(&pool).await.unwrap();
        assert_eq!(after.skills.len(), 2);
        assert_eq!(after.skills[0].topic_id, "geometry");
        assert_eq!(after.skills[0].sub_skill, "circle");
        assert_eq!(after.skills[0].due, Some(1700600000000));
        assert_eq!(after.skills[1].topic_id, "linear_eq");
        assert_eq!(after.skills[1].sub_skill, "");
        pool.close().await;
        let _ = std::fs::remove_file(&path);
    }

    #[test]
    fn a_document_from_another_application_is_refused() {
        let text = r#"{"app":"something-else","version":1,"exportedAt":0,"review":null,"stats":[],"attempts":[],"skills":[]}"#;
        let error = decode(text).unwrap_err();
        assert!(error.contains("something-else"));
    }

    #[test]
    fn a_document_from_a_later_build_is_refused() {
        let text = r#"{"app":"randmatqugea","version":2,"exportedAt":0,"review":null,"stats":[],"attempts":[],"skills":[]}"#;
        let error = decode(text).unwrap_err();
        assert!(error.contains("version 2"));
    }

    #[test]
    fn text_that_is_not_a_document_is_refused_rather_than_guessed_at() {
        assert!(decode("not json at all").is_err());
        assert!(decode("[]").is_err());
        assert!(decode(r#"{"app":"randmatqugea"}"#).is_err());
    }

    #[test]
    fn an_attempt_without_its_answered_time_is_refused() {
        let text = r#"{"app":"randmatqugea","version":1,"exportedAt":0,"review":null,"stats":[],"attempts":[{"id":1,"topicId":"add","subSkill":"","difficulty":"","correct":1,"responseMs":1,"confidence":null,"errorType":null}],"skills":[]}"#;
        assert!(decode(text).is_err());
    }

    #[test]
    fn the_document_names_the_camel_case_fields_the_typescript_side_reads() {
        let text = r#"{"app":"randmatqugea","version":1,"exportedAt":0,"review":null,"stats":[{"topicId":"add","difficulty":"easy","attempts":1,"correct":1,"totalResponseTimeMs":10,"lastErrorType":null,"lastUpdated":"2026-01-01 00:00:00"}],"attempts":[],"skills":[]}"#;
        let document = decode(text).unwrap();
        assert_eq!(document.stats[0].total_response_time_ms, 10);
        assert_eq!(
            document.stats[0].last_updated.as_deref(),
            Some("2026-01-01 00:00:00")
        );
    }
}
