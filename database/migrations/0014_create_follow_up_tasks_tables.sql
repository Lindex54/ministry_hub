CREATE TABLE follow_up_tasks (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  person_type ENUM('member', 'visitor', 'evangelism_contact') NOT NULL,
  person_id BIGINT UNSIGNED NOT NULL,
  assigned_to_staff_id BIGINT UNSIGNED NULL,
  method VARCHAR(50) NULL,
  scheduled_date DATE NULL,
  priority VARCHAR(50) NULL,
  reason VARCHAR(255) NULL,
  status ENUM('Pending', 'In Progress', 'Completed', 'Unable to Reach') NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_follow_up_tasks_staff FOREIGN KEY (assigned_to_staff_id) REFERENCES staff (id),
  INDEX idx_follow_up_tasks_person (person_type, person_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE follow_up_task_history (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  task_id BIGINT UNSIGNED NOT NULL,
  occurred_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  worker_id BIGINT UNSIGNED NULL,
  status ENUM('Pending', 'In Progress', 'Completed', 'Unable to Reach') NOT NULL,
  reached VARCHAR(50) NULL,
  outcome VARCHAR(500) NULL,
  notes TEXT NULL,
  another_follow_up BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_follow_up_task_history_task FOREIGN KEY (task_id) REFERENCES follow_up_tasks (id) ON DELETE CASCADE,
  CONSTRAINT fk_follow_up_task_history_staff FOREIGN KEY (worker_id) REFERENCES staff (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
