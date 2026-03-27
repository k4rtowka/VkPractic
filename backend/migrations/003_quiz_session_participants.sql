
CREATE TABLE IF NOT EXISTS quiz_session_participants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_id INT NOT NULL,
  user_id INT NOT NULL,
  total_score INT UNSIGNED NOT NULL DEFAULT 0,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_session_participant (session_id, user_id),
  CONSTRAINT fk_qsp_session FOREIGN KEY (session_id) REFERENCES quiz_sessions (id) ON DELETE CASCADE,
  CONSTRAINT fk_qsp_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  INDEX idx_qsp_session_id (session_id)
);
