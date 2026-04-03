use serde::Serialize;
use sqlx::SqlitePool;

#[derive(Debug, Serialize)]
pub struct TopicStats {
    pub topic_id: String,
    pub difficulty: String,
    pub attempts: i32,
    pub correct: i32,
    pub avg_response_time_ms: f64,
}

#[derive(Debug, Serialize)]
pub struct Recommendation {
    pub difficulty: String,
    pub weak_topic: Option<String>,
}

pub async fn fetch_stats_for_topic(
    pool: &SqlitePool,
    topic_id: &str,
    difficulty: &str,
) -> Result<Option<TopicStats>, sqlx::Error> {
    let row: Option<(i32, i32, i32)> = sqlx::query_as(
        "SELECT attempts, correct, total_response_time_ms FROM user_topic_stats
         WHERE topic_id = ? AND difficulty = ?",
    )
    .bind(topic_id)
    .bind(difficulty)
    .fetch_optional(pool)
    .await?;

    if let Some((attempts, correct, total_time)) = row {
        let avg_time = total_time as f64 / attempts as f64;
        Ok(Some(TopicStats {
            topic_id: topic_id.to_string(),
            difficulty: difficulty.to_string(),
            attempts,
            correct,
            avg_response_time_ms: avg_time,
        }))
    } else {
        Ok(None)
    }
}

pub fn recommend_next_difficulty(accuracy: f64) -> String {
    if accuracy < 0.4 {
        "hard".to_string()
    } else if accuracy > 0.8 {
        "easy".to_string()
    } else {
        "medium".to_string()
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

    Ok(row.map(|(topic_id, _)| topic_id))
}
