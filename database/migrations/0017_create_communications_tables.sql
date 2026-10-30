CREATE TABLE communication_templates (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  subject VARCHAR(255) NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE communication_campaigns (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  channel ENUM('sms', 'email') NOT NULL,
  subject VARCHAR(255) NULL,
  body TEXT NOT NULL,
  timing ENUM('now', 'scheduled') NOT NULL DEFAULT 'now',
  scheduled_at DATETIME NULL,
  association VARCHAR(100) NULL,
  status VARCHAR(100) NOT NULL,
  recipient_count INT UNSIGNED NOT NULL DEFAULT 0,
  simulated_at DATETIME NULL,
  created_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_communication_campaigns_staff FOREIGN KEY (created_by) REFERENCES staff (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE communication_campaign_recipients (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  campaign_id BIGINT UNSIGNED NOT NULL,
  person_type ENUM('member', 'visitor', 'evangelism_contact') NOT NULL,
  person_id BIGINT UNSIGNED NOT NULL,
  destination VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_campaign_recipients_campaign FOREIGN KEY (campaign_id) REFERENCES communication_campaigns (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
