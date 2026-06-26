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
        let lower = s.to_lowercase();
        match lower.as_str() {
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
    #[test]
    fn should_convert_difficulty_easy_to_easy_via_as_str() {
        assert_eq!(Difficulty::Easy.as_str(), "easy");
    }
    #[test]
    fn should_convert_difficulty_medium_to_medium_via_as_str() {
        assert_eq!(Difficulty::Medium.as_str(), "medium");
    }
    #[test]
    fn should_convert_difficulty_hard_to_hard_via_as_str() {
        assert_eq!(Difficulty::Hard.as_str(), "hard");
    }
    #[test]
    fn should_convert_easy_string_to_difficulty_easy_via_from() {
        assert_eq!(Difficulty::from("easy"), Difficulty::Easy);
    }
    #[test]
    fn should_convert_medium_string_to_difficulty_medium_via_from() {
        assert_eq!(Difficulty::from("medium"), Difficulty::Medium);
    }
    #[test]
    fn should_convert_hard_string_to_difficulty_hard_via_from() {
        assert_eq!(Difficulty::from("hard"), Difficulty::Hard);
    }
    #[test]
    fn should_convert_easy_capitalized_to_difficulty_easy_case_insensitive() {
        assert_eq!(Difficulty::from("Easy"), Difficulty::Easy);
    }
    #[test]
    fn should_convert_easy_uppercase_to_difficulty_easy_case_insensitive() {
        assert_eq!(Difficulty::from("EASY"), Difficulty::Easy);
    }
    #[test]
    fn should_convert_medium_uppercase_to_difficulty_medium_case_insensitive() {
        assert_eq!(Difficulty::from("MEDIUM"), Difficulty::Medium);
    }
    #[test]
    fn should_convert_hard_uppercase_to_difficulty_hard_case_insensitive() {
        assert_eq!(Difficulty::from("HARD"), Difficulty::Hard);
    }
    #[test]
    fn should_default_to_medium_for_unknown_difficulty_string() {
        assert_eq!(Difficulty::from("unknown"), Difficulty::Medium);
    }
    #[test]
    fn should_default_to_medium_for_empty_string() {
        assert_eq!(Difficulty::from(""), Difficulty::Medium);
    }
    #[test]
    fn should_display_easy_correctly() {
        assert_eq!(format!("{}", Difficulty::Easy), "easy");
    }
    #[test]
    fn should_display_medium_correctly() {
        assert_eq!(format!("{}", Difficulty::Medium), "medium");
    }
    #[test]
    fn should_display_hard_correctly() {
        assert_eq!(format!("{}", Difficulty::Hard), "hard");
    }
    #[test]
    fn should_create_topic_id_from_str_ref() {
        let topic = TopicId::from("algebra");
        assert_eq!(topic.0, "algebra");
    }
    #[test]
    fn should_return_correct_as_str_for_topic_id() {
        let topic = TopicId("statistics".to_string());
        assert_eq!(topic.as_str(), "statistics");
    }
    #[test]
    fn should_handle_topic_id_with_special_characters() {
        let topic = TopicId("math & science!".to_string());
        assert_eq!(topic.as_str(), "math & science!");
    }
    #[test]
    fn should_handle_topic_id_with_numbers() {
        let topic = TopicId("topic123".to_string());
        assert_eq!(topic.as_str(), "topic123");
    }
    #[test]
    fn should_handle_topic_id_with_underscores() {
        let topic = TopicId("linear_algebra".to_string());
        assert_eq!(topic.as_str(), "linear_algebra");
    }
}
