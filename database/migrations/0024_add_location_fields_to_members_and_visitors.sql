-- Optional Uganda administrative location (district -> village), alongside the
-- existing free-text district/address fields — none of these are required.
ALTER TABLE members
  ADD COLUMN district_id BIGINT UNSIGNED NULL AFTER address,
  ADD COLUMN county_id BIGINT UNSIGNED NULL AFTER district_id,
  ADD COLUMN sub_county_id BIGINT UNSIGNED NULL AFTER county_id,
  ADD COLUMN parish_id BIGINT UNSIGNED NULL AFTER sub_county_id,
  ADD COLUMN village_id BIGINT UNSIGNED NULL AFTER parish_id,
  ADD CONSTRAINT fk_members_district FOREIGN KEY (district_id) REFERENCES districts (id),
  ADD CONSTRAINT fk_members_county FOREIGN KEY (county_id) REFERENCES counties (id),
  ADD CONSTRAINT fk_members_sub_county FOREIGN KEY (sub_county_id) REFERENCES sub_counties (id),
  ADD CONSTRAINT fk_members_parish FOREIGN KEY (parish_id) REFERENCES parishes (id),
  ADD CONSTRAINT fk_members_village FOREIGN KEY (village_id) REFERENCES villages (id);

ALTER TABLE visitors
  ADD COLUMN district_id BIGINT UNSIGNED NULL AFTER district_address,
  ADD COLUMN county_id BIGINT UNSIGNED NULL AFTER district_id,
  ADD COLUMN sub_county_id BIGINT UNSIGNED NULL AFTER county_id,
  ADD COLUMN parish_id BIGINT UNSIGNED NULL AFTER sub_county_id,
  ADD COLUMN village_id BIGINT UNSIGNED NULL AFTER parish_id,
  ADD CONSTRAINT fk_visitors_district FOREIGN KEY (district_id) REFERENCES districts (id),
  ADD CONSTRAINT fk_visitors_county FOREIGN KEY (county_id) REFERENCES counties (id),
  ADD CONSTRAINT fk_visitors_sub_county FOREIGN KEY (sub_county_id) REFERENCES sub_counties (id),
  ADD CONSTRAINT fk_visitors_parish FOREIGN KEY (parish_id) REFERENCES parishes (id),
  ADD CONSTRAINT fk_visitors_village FOREIGN KEY (village_id) REFERENCES villages (id);
