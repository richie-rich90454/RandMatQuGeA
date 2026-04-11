/**
 * @file models.rs - Strongly‑typed domain models for topics and difficulties.
 * @date 2026-04-12
 * @description Defines TopicId newtype and Difficulty enum with conversions from strings.
 */
use serde::{Deserialize, Serialize};
use std::fmt;
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct TopicId(pub String);
impl TopicId {
    pub fn as_str(&self) -> &str {
        &self.0
    }
}
impl From<&str> for TopicId {
    fn from(s: &str) -> Self {
        TopicId(s.to_string())
    }
}
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum Difficulty {
    Easy,
    Medium,
    Hard,
}
impl Difficulty {
    pub fn as_str(&self) -> &'static str {
        match self {
            Difficulty::Easy => "easy",
            Difficulty::Medium => "medium",
            Difficulty::Hard => "hard",
        }
    }
}
impl From<&str> for Difficulty {
    fn from(s: &str) -> Self {
        match s {
            "easy" => Difficulty::Easy,
            "hard" => Difficulty::Hard,
            _ => Difficulty::Medium,
        }
    }
}
impl fmt::Display for Difficulty {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.as_str())
    }
}
