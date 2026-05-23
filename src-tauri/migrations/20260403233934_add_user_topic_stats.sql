CREATE TABLE IF NOT EXISTS user_topic_stats (
    topic_id TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    attempts INTEGER DEFAULT 0,
    correct INTEGER DEFAULT 0,
    total_response_time_ms INTEGER DEFAULT 0,
    last_error_type TEXT,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (topic_id, difficulty)
);
