CREATE TABLE events (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  event_date DATE NOT NULL,
  branch_id BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_events_branch FOREIGN KEY (branch_id) REFERENCES branches (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE event_attendees (
  event_id BIGINT UNSIGNED NOT NULL,
  person_type ENUM('member', 'visitor', 'evangelism_contact') NOT NULL,
  person_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (event_id, person_type, person_id),
  CONSTRAINT fk_event_attendees_event FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
