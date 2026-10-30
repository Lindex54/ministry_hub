CREATE TABLE evangelism_encounters (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  evangelism_contact_id BIGINT UNSIGNED NOT NULL,
  encounter_date DATE NOT NULL,
  location VARCHAR(255) NULL,
  activity_id BIGINT UNSIGNED NULL,
  evangelized_by BIGINT UNSIGNED NULL,
  response VARCHAR(100) NULL,
  notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_evangelism_encounters_contact FOREIGN KEY (evangelism_contact_id) REFERENCES evangelism_contacts (id) ON DELETE CASCADE,
  CONSTRAINT fk_evangelism_encounters_activity FOREIGN KEY (activity_id) REFERENCES outreach_activities (id),
  CONSTRAINT fk_evangelism_encounters_staff FOREIGN KEY (evangelized_by) REFERENCES staff (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
