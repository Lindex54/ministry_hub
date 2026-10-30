CREATE TABLE ministries (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  leader_type ENUM('staff', 'member') NULL,
  leader_id BIGINT UNSIGNED NULL,
  assistant_leader_type ENUM('staff', 'member') NULL,
  assistant_leader_id BIGINT UNSIGNED NULL,
  date_established DATE NULL,
  status ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE ministry_branches (
  ministry_id BIGINT UNSIGNED NOT NULL,
  branch_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (ministry_id, branch_id),
  CONSTRAINT fk_ministry_branches_ministry FOREIGN KEY (ministry_id) REFERENCES ministries (id) ON DELETE CASCADE,
  CONSTRAINT fk_ministry_branches_branch FOREIGN KEY (branch_id) REFERENCES branches (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
