CREATE TABLE outreach_activities (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  activity_date DATE NOT NULL,
  location VARCHAR(255) NULL,
  branch_id BIGINT UNSIGNED NULL,
  headcount INT UNSIGNED NOT NULL DEFAULT 0,
  notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_outreach_activities_branch FOREIGN KEY (branch_id) REFERENCES branches (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE outreach_activity_team (
  activity_id BIGINT UNSIGNED NOT NULL,
  staff_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (activity_id, staff_id),
  CONSTRAINT fk_outreach_activity_team_activity FOREIGN KEY (activity_id) REFERENCES outreach_activities (id) ON DELETE CASCADE,
  CONSTRAINT fk_outreach_activity_team_staff FOREIGN KEY (staff_id) REFERENCES staff (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
