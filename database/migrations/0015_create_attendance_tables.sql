CREATE TABLE attendance_occurrences (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  branch_id BIGINT UNSIGNED NOT NULL,
  service_id BIGINT UNSIGNED NOT NULL,
  occurrence_date DATE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_attendance_occurrences_branch FOREIGN KEY (branch_id) REFERENCES branches (id),
  CONSTRAINT fk_attendance_occurrences_service FOREIGN KEY (service_id) REFERENCES services (id),
  UNIQUE KEY uq_attendance_occurrence (branch_id, service_id, occurrence_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE attendance_expected_members (
  occurrence_id BIGINT UNSIGNED NOT NULL,
  member_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (occurrence_id, member_id),
  CONSTRAINT fk_attendance_expected_occurrence FOREIGN KEY (occurrence_id) REFERENCES attendance_occurrences (id) ON DELETE CASCADE,
  CONSTRAINT fk_attendance_expected_member FOREIGN KEY (member_id) REFERENCES members (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE attendance_records (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  occurrence_id BIGINT UNSIGNED NOT NULL,
  person_type ENUM('member', 'visitor') NOT NULL,
  person_id BIGINT UNSIGNED NOT NULL,
  status ENUM('Present', 'Absent') NOT NULL,
  category VARCHAR(50) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_attendance_records_occurrence FOREIGN KEY (occurrence_id) REFERENCES attendance_occurrences (id) ON DELETE CASCADE,
  UNIQUE KEY uq_attendance_record (occurrence_id, person_type, person_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
