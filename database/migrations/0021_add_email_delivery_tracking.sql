ALTER TABLE communication_campaigns
  ADD COLUMN sent_at DATETIME NULL AFTER simulated_at;

ALTER TABLE communication_campaign_recipients
  ADD COLUMN name VARCHAR(255) NULL AFTER person_id,
  ADD COLUMN delivery_status VARCHAR(30) NOT NULL DEFAULT 'pending' AFTER destination,
  ADD COLUMN error_message VARCHAR(500) NULL AFTER delivery_status,
  ADD COLUMN sent_at DATETIME NULL AFTER error_message;
