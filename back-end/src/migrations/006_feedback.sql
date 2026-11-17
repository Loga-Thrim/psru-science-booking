-- Migration: Usability feedback from people trying the system (e.g. a student demo).
-- One row per submitted form. sus_answers holds the 10 System Usability Scale
-- answers (1-5) as JSON; sus_score is the standard 0-100 score computed from them.

CREATE TABLE IF NOT EXISTS feedback (
  feedback_id CHAR(8) PRIMARY KEY DEFAULT (UPPER(SUBSTRING(REPLACE(UUID(), '-', ''), 1, 8))),
  tester_code VARCHAR(20),
  sus_answers JSON NOT NULL,
  sus_score DECIMAL(5,2) NOT NULL,
  tasks JSON,
  liked TEXT,
  improve TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
