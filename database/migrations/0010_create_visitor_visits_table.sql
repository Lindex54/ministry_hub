CREATE TABLE visitor_visits (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  visitor_id BIGINT UNSIGNED NOT NULL,
  visit_date DATE NOT NULL,
  service_id BIGINT UNSIGNED NULL,
  notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_visitor_visits_visitor FOREIGN KEY (visitor_id) REFERENCES visitors (id) ON DELETE CASCADE,
  CONSTRAINT fk_visitor_visits_service FOREIGN KEY (service_id) REFERENCES services (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
