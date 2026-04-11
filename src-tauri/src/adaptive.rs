/**
 * @file adaptive.rs - Core adaptive learning logic with strongly‑typed topics and difficulties.
 * @date 2026-04-12
 * @description Provides functions to fetch user performance stats, recommend next difficulty,
 * and find the weakest topic using SQLite. Uses TopicId and Difficulty enums for type safety.
 */
use crate::models::{Difficulty, TopicId};
use serde::Serialize;
use sqlx::SqlitePool;
#[derive(Debug, Serialize)]
pub struct TopicStats {
    pub topic_id: TopicId,
    pub difficulty: Difficulty,
    pub attempts: i32,
    pub correct: i32,
    pub avg_response_time_ms: f64,
}
#[derive(Debug, Serialize)]
pub struct Recommendation {
    pub difficulty: Difficulty,
    pub weak_topic: Option<TopicId>,
}
pub async fn fetch_stats_for_topic(
    pool: &SqlitePool,
    topic_id: &TopicId,
    difficulty: Difficulty,
) -> Result<Option<TopicStats>, sqlx::Error> {
    let diff_str = difficulty.as_str();
    let row: Option<(i32, i32, i32)> = sqlx::query_as(
        "SELECT attempts, correct, total_response_time_ms FROM user_topic_stats
		 WHERE topic_id = ? AND difficulty = ?",
    )
    .bind(topic_id.as_str())
    .bind(diff_str)
    .fetch_optional(pool)
    .await?;
    if let Some((attempts, correct, total_time)) = row {
        let avg_time = total_time as f64 / attempts as f64;
        Ok(Some(TopicStats {
            topic_id: topic_id.clone(),
            difficulty,
            attempts,
            correct,
            avg_response_time_ms: avg_time,
        }))
    } else {
        Ok(None)
    }
}
pub fn recommend_next_difficulty(accuracy: f64) -> Difficulty {
    if accuracy < 0.4 {
        Difficulty::Hard
    } else if accuracy > 0.8 {
        Difficulty::Easy
    } else {
        Difficulty::Medium
    }
}
pub async fn find_weakest_topic(pool: &SqlitePool) -> Result<Option<String>, sqlx::Error> {
    let row: Option<(String, f64)> = sqlx::query_as(
        "SELECT topic_id, 
				CAST(SUM(correct) AS REAL) / SUM(attempts) as accuracy
		 FROM user_topic_stats
		 GROUP BY topic_id
		 ORDER BY accuracy ASC
		 LIMIT 1",
    )
    .fetch_optional(pool)
    .await?;
    Ok(row.map(|(id, _)| id))
}
