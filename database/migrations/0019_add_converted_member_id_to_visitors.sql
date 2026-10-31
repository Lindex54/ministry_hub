ALTER TABLE visitors
  ADD COLUMN converted_member_id BIGINT UNSIGNED NULL AFTER permission_to_contact,
  ADD CONSTRAINT fk_visitors_converted_member FOREIGN KEY (converted_member_id) REFERENCES members (id);
