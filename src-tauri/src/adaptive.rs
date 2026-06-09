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
        Difficulty::Easy
    } else if accuracy > 0.8 {
        Difficulty::Hard
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
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_recommend_easy_low_accuracy() {
        assert_eq!(recommend_next_difficulty(0.3), Difficulty::Easy);
    }
    #[test]
    fn test_recommend_medium_accuracy() {
        assert_eq!(recommend_next_difficulty(0.5), Difficulty::Medium);
    }
    #[test]
    fn test_recommend_hard_high_accuracy() {
        assert_eq!(recommend_next_difficulty(0.9), Difficulty::Hard);
    }
    #[test]
    fn test_recommend_boundary_below_medium() {
        assert_eq!(recommend_next_difficulty(0.4), Difficulty::Medium);
    }
    #[test]
    fn test_recommend_boundary_below_hard() {
        assert_eq!(recommend_next_difficulty(0.8), Difficulty::Medium);
    }
    #[test]
    fn test_recommend_zero_accuracy() {
        assert_eq!(recommend_next_difficulty(0.0), Difficulty::Easy);
    }
    #[test]
    fn test_recommend_perfect_accuracy() {
        assert_eq!(recommend_next_difficulty(1.0), Difficulty::Hard);
    }
    #[test]
    fn test_very_low_accuracy_returns_easy() {
        assert_eq!(recommend_next_difficulty(0.1), Difficulty::Easy);
    }
    #[test]
    fn test_accuracy_twenty_percent_returns_easy() {
        assert_eq!(recommend_next_difficulty(0.2), Difficulty::Easy);
    }
    #[test]
    fn test_accuracy_forty_percent_boundary() {
        assert_eq!(recommend_next_difficulty(0.4), Difficulty::Medium);
    }
    #[test]
    fn test_accuracy_just_above_easy_boundary() {
        assert_eq!(recommend_next_difficulty(0.41), Difficulty::Medium);
    }
    #[test]
    fn test_accuracy_fifty_percent_returns_medium() {
        assert_eq!(recommend_next_difficulty(0.5), Difficulty::Medium);
    }
    #[test]
    fn test_accuracy_sixty_percent_returns_medium() {
        assert_eq!(recommend_next_difficulty(0.6), Difficulty::Medium);
    }
    #[test]
    fn test_accuracy_seventy_percent_returns_medium() {
        assert_eq!(recommend_next_difficulty(0.7), Difficulty::Medium);
    }
    #[test]
    fn test_accuracy_eighty_percent_boundary() {
        assert_eq!(recommend_next_difficulty(0.8), Difficulty::Medium);
    }
    #[test]
    fn test_accuracy_just_above_medium_boundary() {
        assert_eq!(recommend_next_difficulty(0.81), Difficulty::Hard);
    }
    #[test]
    fn test_accuracy_ninety_percent_returns_hard() {
        assert_eq!(recommend_next_difficulty(0.9), Difficulty::Hard);
    }
    #[test]
    fn test_accuracy_one_hundred_percent_returns_hard() {
        assert_eq!(recommend_next_difficulty(1.0), Difficulty::Hard);
    }
    #[test]
    fn test_accuracy_zero_returns_easy() {
        assert_eq!(recommend_next_difficulty(0.0), Difficulty::Easy);
    }
    #[test]
    fn test_very_small_positive_accuracy() {
        assert_eq!(recommend_next_difficulty(0.001), Difficulty::Easy);
    }
    #[test]
    fn test_accuracy_close_to_one() {
        assert_eq!(recommend_next_difficulty(0.99), Difficulty::Hard);
    }
    #[test]
    fn test_negative_accuracy_edge_case() {
        assert_eq!(recommend_next_difficulty(-0.1), Difficulty::Easy);
    }
}
