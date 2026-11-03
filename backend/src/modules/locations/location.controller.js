import { getPool } from "../../config/database.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

function toOption(row) {
  return { id: String(row.id), name: row.name, code: row.code ?? "" };
}

// Read-only endpoints for the Uganda administrative location hierarchy
// (district -> county -> sub-county -> parish -> village), ported from the
// author's UPAMS project. Every level is optional in the forms that use
// these — this is just cascading option data, not a required path.
export const listDistricts = asyncHandler(async (_request, response) => {
  const [rows] = await getPool().query(
    "SELECT id, name, code FROM districts WHERE is_active = 1 ORDER BY name"
  );
  response.json(rows.map(toOption));
});

export const listCounties = asyncHandler(async (request, response) => {
  const [rows] = await getPool().query(
    "SELECT id, name, code FROM counties WHERE is_active = 1 AND district_id = ? ORDER BY name",
    [request.params.districtId]
  );
  response.json(rows.map(toOption));
});

export const listSubCounties = asyncHandler(async (request, response) => {
  const [rows] = await getPool().query(
    "SELECT id, name, code FROM sub_counties WHERE is_active = 1 AND county_id = ? ORDER BY name",
    [request.params.countyId]
  );
  response.json(rows.map(toOption));
});

export const listParishes = asyncHandler(async (request, response) => {
  const [rows] = await getPool().query(
    "SELECT id, name, code FROM parishes WHERE is_active = 1 AND sub_county_id = ? ORDER BY name",
    [request.params.subCountyId]
  );
  response.json(rows.map(toOption));
});

export const listVillages = asyncHandler(async (request, response) => {
  const [rows] = await getPool().query(
    "SELECT id, name, code FROM villages WHERE is_active = 1 AND parish_id = ? ORDER BY name",
    [request.params.parishId]
  );
  response.json(rows.map(toOption));
});
