ALTER TABLE events
  ADD COLUMN event_time VARCHAR(20) NULL AFTER event_date,
  ADD COLUMN location VARCHAR(255) NULL AFTER event_time;
