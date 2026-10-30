CREATE TABLE members (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  membership_number VARCHAR(50) NOT NULL UNIQUE,
  first_name VARCHAR(150) NOT NULL,
  last_name VARCHAR(150) NOT NULL,
  preferred_name VARCHAR(150) NULL,
  gender ENUM('Male', 'Female') NULL,
  date_of_birth DATE NULL,
  profile_photo VARCHAR(500) NULL,
  primary_phone VARCHAR(50) NULL,
  alternative_phone VARCHAR(50) NULL,
  email VARCHAR(255) NULL,
  district VARCHAR(150) NULL,
  address VARCHAR(500) NULL,
  branch_id BIGINT UNSIGNED NULL,
  date_joined DATE NULL,
  status ENUM('Active', 'Inactive', 'Transferred') NOT NULL DEFAULT 'Active',
  emergency_name VARCHAR(255) NULL,
  emergency_relationship VARCHAR(100) NULL,
  emergency_phone VARCHAR(50) NULL,
  consent_to_contact BOOLEAN NOT NULL DEFAULT TRUE,
  sms_opt_in BOOLEAN NOT NULL DEFAULT TRUE,
  email_opt_in BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_members_branch FOREIGN KEY (branch_id) REFERENCES branches (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE member_ministries (
  member_id BIGINT UNSIGNED NOT NULL,
  ministry_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (member_id, ministry_id),
  CONSTRAINT fk_member_ministries_member FOREIGN KEY (member_id) REFERENCES members (id) ON DELETE CASCADE,
  CONSTRAINT fk_member_ministries_ministry FOREIGN KEY (ministry_id) REFERENCES ministries (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
