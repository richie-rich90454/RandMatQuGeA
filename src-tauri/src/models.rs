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
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_difficulty_as_str() {
        assert_eq!(Difficulty::Easy.as_str(), "easy");
        assert_eq!(Difficulty::Medium.as_str(), "medium");
        assert_eq!(Difficulty::Hard.as_str(), "hard");
    }
    #[test]
    fn test_difficulty_from_str() {
        assert_eq!(Difficulty::from("easy"), Difficulty::Easy);
        assert_eq!(Difficulty::from("medium"), Difficulty::Medium);
        assert_eq!(Difficulty::from("hard"), Difficulty::Hard);
        assert_eq!(Difficulty::from("unknown"), Difficulty::Medium);
    }
    #[test]
    fn test_difficulty_display() {
        assert_eq!(format!("{}", Difficulty::Easy), "easy");
        assert_eq!(format!("{}", Difficulty::Medium), "medium");
        assert_eq!(format!("{}", Difficulty::Hard), "hard");
    }
    #[test]
    fn test_topic_id_creation_and_as_str() {
        let topic = TopicId("algebra".to_string());
        assert_eq!(topic.as_str(), "algebra");
        let topic2 = TopicId("geometry".to_string());
        assert_eq!(topic2.as_str(), "geometry");
    }
    #[test]
    fn test_topic_id_from_str() {
        let topic = TopicId::from("trigonometry");
        assert_eq!(topic.0, "trigonometry");
        assert_eq!(topic.as_str(), "trigonometry");
        let topic2 = TopicId::from("calculus");
        assert_eq!(topic2.as_str(), "calculus");
    }
}
