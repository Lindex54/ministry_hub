-- Optional Uganda administrative location (district -> village) on a user's own
-- profile, same optional hierarchy already used by members and visitors.
ALTER TABLE users
  ADD COLUMN district_id BIGINT UNSIGNED NULL AFTER staff_id,
  ADD COLUMN county_id BIGINT UNSIGNED NULL AFTER district_id,
  ADD COLUMN sub_county_id BIGINT UNSIGNED NULL AFTER county_id,
  ADD COLUMN parish_id BIGINT UNSIGNED NULL AFTER sub_county_id,
  ADD COLUMN village_id BIGINT UNSIGNED NULL AFTER parish_id,
  ADD CONSTRAINT fk_users_district FOREIGN KEY (district_id) REFERENCES districts (id),
  ADD CONSTRAINT fk_users_county FOREIGN KEY (county_id) REFERENCES counties (id),
  ADD CONSTRAINT fk_users_sub_county FOREIGN KEY (sub_county_id) REFERENCES sub_counties (id),
  ADD CONSTRAINT fk_users_parish FOREIGN KEY (parish_id) REFERENCES parishes (id),
  ADD CONSTRAINT fk_users_village FOREIGN KEY (village_id) REFERENCES villages (id);
