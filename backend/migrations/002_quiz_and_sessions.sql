CREATE TABLE IF NOT EXISTS quizzes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_quizzes_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  INDEX idx_quizzes_user_id (user_id)
);

CREATE TABLE IF NOT EXISTS quiz_questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  quiz_id INT NOT NULL,
  sort_order SMALLINT UNSIGNED NOT NULL,
  body TEXT NOT NULL,
  time_seconds SMALLINT UNSIGNED NOT NULL,
  multiple_choice TINYINT(1) NOT NULL DEFAULT 0,
  CONSTRAINT fk_quiz_questions_quiz FOREIGN KEY (quiz_id) REFERENCES quizzes (id) ON DELETE CASCADE,
  UNIQUE KEY uq_quiz_questions_order (quiz_id, sort_order)
);

CREATE TABLE IF NOT EXISTS quiz_question_options (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question_id INT NOT NULL,
  sort_order SMALLINT UNSIGNED NOT NULL,
  body VARCHAR(512) NOT NULL,
  is_correct TINYINT(1) NOT NULL DEFAULT 0,
  CONSTRAINT fk_quiz_options_question FOREIGN KEY (question_id) REFERENCES quiz_questions (id) ON DELETE CASCADE,
  UNIQUE KEY uq_quiz_options_order (question_id, sort_order)
);

CREATE TABLE IF NOT EXISTS quiz_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  quiz_id INT NOT NULL,
  host_user_id INT NOT NULL,
  room_code VARCHAR(8) NOT NULL,
  status ENUM('waiting', 'live', 'finished') NOT NULL DEFAULT 'waiting',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  started_at TIMESTAMP NULL DEFAULT NULL,
  finished_at TIMESTAMP NULL DEFAULT NULL,
  CONSTRAINT fk_quiz_sessions_quiz FOREIGN KEY (quiz_id) REFERENCES quizzes (id) ON DELETE CASCADE,
  CONSTRAINT fk_quiz_sessions_host FOREIGN KEY (host_user_id) REFERENCES users (id) ON DELETE CASCADE,
  UNIQUE KEY uq_quiz_sessions_room_code (room_code),
  INDEX idx_quiz_sessions_quiz_id (quiz_id),
  INDEX idx_quiz_sessions_host_user_id (host_user_id)
);
