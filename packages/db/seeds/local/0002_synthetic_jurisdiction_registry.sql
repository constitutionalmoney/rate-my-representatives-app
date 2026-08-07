INSERT INTO rmr_registry.assertion (
  assertion_id, source_reference, observed_at, freshness_state, coverage_state,
  conflict_state, supersedes_assertion_id
)
SELECT
  assertion_id,
  'synthetic://seed/' || replace(assertion_id, ':', '/'),
  '2026-08-06T12:00:00Z'::timestamptz,
  freshness_state,
  coverage_state,
  conflict_state,
  supersedes_assertion_id
FROM (VALUES
  ('assertion:seed:ca', 'current', 'supported', 'clear', NULL),
  ('assertion:seed:ca:province', 'current', 'supported', 'clear', NULL),
  ('assertion:seed:ca:region', 'current', 'supported', 'clear', NULL),
  ('assertion:seed:ca:harbour:old', 'current', 'supported', 'clear', NULL),
  ('assertion:seed:ca:harbour:new', 'current', 'supported', 'clear', 'assertion:seed:ca:harbour:old'),
  ('assertion:seed:ca:old-bay', 'current', 'supported', 'clear', NULL),
  ('assertion:seed:ca:new-bay', 'current', 'supported', 'clear', NULL),
  ('assertion:seed:us', 'current', 'supported', 'clear', NULL),
  ('assertion:seed:us:state', 'current', 'supported', 'clear', NULL),
  ('assertion:seed:us:county', 'current', 'supported', 'clear', NULL),
  ('assertion:seed:us:city', 'current', 'supported', 'clear', NULL),
  ('assertion:seed:us:water', 'unknown', 'partial', 'conflicting', NULL),
  ('assertion:seed:relationship:ca:province', 'current', 'supported', 'clear', NULL),
  ('assertion:seed:relationship:ca:region', 'current', 'supported', 'clear', NULL),
  ('assertion:seed:relationship:ca:harbour:province', 'current', 'supported', 'clear', NULL),
  ('assertion:seed:relationship:ca:harbour:region', 'current', 'supported', 'clear', NULL),
  ('assertion:seed:relationship:ca:old-bay', 'current', 'supported', 'clear', NULL),
  ('assertion:seed:relationship:ca:new-bay', 'current', 'supported', 'clear', NULL),
  ('assertion:seed:relationship:ca:successor', 'current', 'supported', 'clear', NULL),
  ('assertion:seed:relationship:us:state', 'current', 'supported', 'clear', NULL),
  ('assertion:seed:relationship:us:county', 'current', 'supported', 'clear', NULL),
  ('assertion:seed:relationship:us:city:county', 'current', 'supported', 'clear', NULL),
  ('assertion:seed:relationship:us:city:state', 'current', 'supported', 'clear', NULL),
  ('assertion:seed:relationship:us:water:state', 'current', 'partial', 'clear', NULL),
  ('assertion:seed:relationship:us:water:city', 'unknown', 'partial', 'conflicting', NULL),
  ('assertion:seed:district:ca:old', 'current', 'supported', 'clear', NULL),
  ('assertion:seed:district:ca:new', 'current', 'supported', 'clear', NULL),
  ('assertion:seed:district:ca:provincial:old', 'current', 'supported', 'clear', NULL),
  ('assertion:seed:district:ca:provincial:new', 'current', 'supported', 'clear', 'assertion:seed:district:ca:provincial:old'),
  ('assertion:seed:district:us:senate', 'current', 'supported', 'clear', NULL),
  ('assertion:seed:boundary:ca:old', 'current', 'supported', 'clear', NULL),
  ('assertion:seed:boundary:ca:new', 'current', 'supported', 'clear', NULL),
  ('assertion:seed:boundary:ca:provincial:old', 'current', 'supported', 'clear', NULL),
  ('assertion:seed:boundary:ca:provincial:new', 'current', 'supported', 'clear', NULL),
  ('assertion:seed:boundary:us:senate', 'current', 'supported', 'clear', NULL),
  ('assertion:seed:district-relationship:ca:old', 'current', 'supported', 'clear', NULL),
  ('assertion:seed:district-relationship:ca:new', 'current', 'supported', 'clear', NULL),
  ('assertion:seed:district-relationship:ca:provincial', 'current', 'supported', 'clear', NULL),
  ('assertion:seed:district-relationship:us:senate', 'current', 'supported', 'clear', NULL),
  ('assertion:seed:lineage:ca:redistricting', 'current', 'supported', 'clear', NULL),
  ('assertion:seed:body:ca:legislature', 'current', 'supported', 'clear', NULL),
  ('assertion:seed:body:ca:regional', 'current', 'supported', 'clear', NULL),
  ('assertion:seed:body:ca:council', 'current', 'supported', 'clear', NULL),
  ('assertion:seed:body:us:legislature', 'current', 'supported', 'clear', NULL),
  ('assertion:seed:body:us:county', 'current', 'supported', 'clear', NULL),
  ('assertion:seed:body:us:water', 'unknown', 'partial', 'clear', NULL),
  ('assertion:seed:body-relationship:ca:legislature', 'current', 'supported', 'clear', NULL),
  ('assertion:seed:body-relationship:ca:regional', 'current', 'supported', 'clear', NULL),
  ('assertion:seed:body-relationship:ca:council', 'current', 'supported', 'clear', NULL),
  ('assertion:seed:body-relationship:us:legislature', 'current', 'supported', 'clear', NULL),
  ('assertion:seed:body-relationship:us:county', 'current', 'supported', 'clear', NULL),
  ('assertion:seed:body-relationship:us:water', 'unknown', 'partial', 'clear', NULL),
  ('assertion:seed:office:ca:member', 'current', 'supported', 'clear', NULL),
  ('assertion:seed:office:ca:appointed', 'current', 'supported', 'clear', NULL),
  ('assertion:seed:office:ca:mayor:active', 'current', 'supported', 'clear', NULL),
  ('assertion:seed:office:ca:mayor:vacant', 'current', 'supported', 'clear', 'assertion:seed:office:ca:mayor:active'),
  ('assertion:seed:office:us:senator', 'current', 'supported', 'clear', NULL),
  ('assertion:seed:office:us:water', 'unknown', 'partial', 'clear', NULL),
  ('assertion:seed:office:us:former:active', 'current', 'supported', 'clear', NULL),
  ('assertion:seed:office:us:former:abolished', 'current', 'supported', 'clear', 'assertion:seed:office:us:former:active'),
  ('assertion:seed:external:harbour:old', 'current', 'supported', 'clear', NULL),
  ('assertion:seed:external:harbour:new', 'current', 'supported', 'clear', 'assertion:seed:external:harbour:old'),
  ('assertion:seed:gap:water', 'unknown', 'gap', 'conflicting', NULL)
) AS fixture(
  assertion_id, freshness_state, coverage_state, conflict_state, supersedes_assertion_id
)
ON CONFLICT (assertion_id) DO NOTHING;

INSERT INTO rmr_registry.jurisdiction (jurisdiction_id, country_code) VALUES
  ('jurisdiction:ca', 'CA'),
  ('jurisdiction:ca:maple', 'CA'),
  ('jurisdiction:ca:north-region', 'CA'),
  ('jurisdiction:ca:harbour', 'CA'),
  ('jurisdiction:ca:old-bay', 'CA'),
  ('jurisdiction:ca:new-bay', 'CA'),
  ('jurisdiction:us', 'US'),
  ('jurisdiction:us:example-state', 'US'),
  ('jurisdiction:us:example-county', 'US'),
  ('jurisdiction:us:example-city', 'US'),
  ('jurisdiction:us:water', 'US')
ON CONFLICT (jurisdiction_id) DO NOTHING;

INSERT INTO rmr_registry.jurisdiction_version (
  version_id, jurisdiction_id, name, slug, kind, status, effective_from,
  effective_to, assertion_id, supersedes_version_id
) VALUES
  ('jv:ca', 'jurisdiction:ca', 'Canada synthetic fixture', 'canada-synthetic', 'country', 'active', '2020-01-01T00:00:00Z', NULL, 'assertion:seed:ca', NULL),
  ('jv:ca:maple', 'jurisdiction:ca:maple', 'Maple Province', 'maple-province', 'province', 'active', '2020-01-01T00:00:00Z', NULL, 'assertion:seed:ca:province', NULL),
  ('jv:ca:north-region', 'jurisdiction:ca:north-region', 'North Regional District', 'north-regional-district', 'regional_district', 'active', '2020-01-01T00:00:00Z', NULL, 'assertion:seed:ca:region', NULL),
  ('jv:ca:harbour:old', 'jurisdiction:ca:harbour', 'Harbour Village', 'harbour-village', 'municipality', 'former', '2020-01-01T00:00:00Z', '2026-01-01T00:00:00Z', 'assertion:seed:ca:harbour:old', NULL),
  ('jv:ca:harbour:new', 'jurisdiction:ca:harbour', 'Harbour City', 'harbour-city', 'municipality', 'active', '2026-01-01T00:00:00Z', NULL, 'assertion:seed:ca:harbour:new', 'jv:ca:harbour:old'),
  ('jv:ca:old-bay', 'jurisdiction:ca:old-bay', 'Old Bay Municipality', 'old-bay', 'municipality', 'amalgamated', '2020-01-01T00:00:00Z', '2026-01-01T00:00:00Z', 'assertion:seed:ca:old-bay', NULL),
  ('jv:ca:new-bay', 'jurisdiction:ca:new-bay', 'New Bay Municipality', 'new-bay', 'municipality', 'active', '2026-01-01T00:00:00Z', NULL, 'assertion:seed:ca:new-bay', NULL),
  ('jv:us', 'jurisdiction:us', 'United States synthetic fixture', 'united-states-synthetic', 'country', 'active', '2020-01-01T00:00:00Z', NULL, 'assertion:seed:us', NULL),
  ('jv:us:state', 'jurisdiction:us:example-state', 'Example State', 'example-state', 'state', 'active', '2020-01-01T00:00:00Z', NULL, 'assertion:seed:us:state', NULL),
  ('jv:us:county', 'jurisdiction:us:example-county', 'Example County', 'example-county', 'county', 'active', '2020-01-01T00:00:00Z', NULL, 'assertion:seed:us:county', NULL),
  ('jv:us:city', 'jurisdiction:us:example-city', 'Example City', 'example-city', 'municipality', 'active', '2020-01-01T00:00:00Z', NULL, 'assertion:seed:us:city', NULL),
  ('jv:us:water', 'jurisdiction:us:water', 'Example Water District', 'example-water-district', 'special_district', 'active', '2020-01-01T00:00:00Z', NULL, 'assertion:seed:us:water', NULL)
ON CONFLICT (version_id) DO NOTHING;

INSERT INTO rmr_registry.jurisdiction_relationship (
  relationship_id, subject_jurisdiction_id, object_jurisdiction_id, kind,
  effective_from, effective_to, assertion_id
) VALUES
  ('jr:ca:province', 'jurisdiction:ca:maple', 'jurisdiction:ca', 'contained_by', '2020-01-01T00:00:00Z', NULL, 'assertion:seed:relationship:ca:province'),
  ('jr:ca:region', 'jurisdiction:ca:north-region', 'jurisdiction:ca:maple', 'contained_by', '2020-01-01T00:00:00Z', NULL, 'assertion:seed:relationship:ca:region'),
  ('jr:ca:harbour:province', 'jurisdiction:ca:harbour', 'jurisdiction:ca:maple', 'contained_by', '2020-01-01T00:00:00Z', NULL, 'assertion:seed:relationship:ca:harbour:province'),
  ('jr:ca:harbour:region', 'jurisdiction:ca:harbour', 'jurisdiction:ca:north-region', 'contained_by', '2020-01-01T00:00:00Z', NULL, 'assertion:seed:relationship:ca:harbour:region'),
  ('jr:ca:old-bay', 'jurisdiction:ca:old-bay', 'jurisdiction:ca:north-region', 'contained_by', '2020-01-01T00:00:00Z', '2026-01-01T00:00:00Z', 'assertion:seed:relationship:ca:old-bay'),
  ('jr:ca:new-bay', 'jurisdiction:ca:new-bay', 'jurisdiction:ca:north-region', 'contained_by', '2026-01-01T00:00:00Z', NULL, 'assertion:seed:relationship:ca:new-bay'),
  ('jr:ca:successor', 'jurisdiction:ca:new-bay', 'jurisdiction:ca:old-bay', 'successor_of', '2026-01-01T00:00:00Z', NULL, 'assertion:seed:relationship:ca:successor'),
  ('jr:us:state', 'jurisdiction:us:example-state', 'jurisdiction:us', 'contained_by', '2020-01-01T00:00:00Z', NULL, 'assertion:seed:relationship:us:state'),
  ('jr:us:county', 'jurisdiction:us:example-county', 'jurisdiction:us:example-state', 'contained_by', '2020-01-01T00:00:00Z', NULL, 'assertion:seed:relationship:us:county'),
  ('jr:us:city:county', 'jurisdiction:us:example-city', 'jurisdiction:us:example-county', 'contained_by', '2020-01-01T00:00:00Z', NULL, 'assertion:seed:relationship:us:city:county'),
  ('jr:us:city:state', 'jurisdiction:us:example-city', 'jurisdiction:us:example-state', 'contained_by', '2020-01-01T00:00:00Z', NULL, 'assertion:seed:relationship:us:city:state'),
  ('jr:us:water:state', 'jurisdiction:us:water', 'jurisdiction:us:example-state', 'contained_by', '2020-01-01T00:00:00Z', NULL, 'assertion:seed:relationship:us:water:state'),
  ('jr:us:water:city', 'jurisdiction:us:water', 'jurisdiction:us:example-city', 'overlaps', '2020-01-01T00:00:00Z', NULL, 'assertion:seed:relationship:us:water:city')
ON CONFLICT (relationship_id) DO NOTHING;

INSERT INTO rmr_registry.district (district_id, country_code) VALUES
  ('district:ca:maple-federal-old', 'CA'),
  ('district:ca:maple-federal-new', 'CA'),
  ('district:ca:maple-provincial', 'CA'),
  ('district:us:state-senate', 'US')
ON CONFLICT (district_id) DO NOTHING;

INSERT INTO rmr_registry.district_version (
  version_id, district_id, name, slug, kind, status, effective_from, effective_to,
  assertion_id, supersedes_version_id
) VALUES
  ('dv:ca:old', 'district:ca:maple-federal-old', 'Maple Federal District 2015', 'maple-federal-2015', 'federal_electoral', 'former', '2020-01-01T00:00:00Z', '2026-01-01T00:00:00Z', 'assertion:seed:district:ca:old', NULL),
  ('dv:ca:new', 'district:ca:maple-federal-new', 'Maple Federal District 2026', 'maple-federal-2026', 'federal_electoral', 'active', '2026-01-01T00:00:00Z', NULL, 'assertion:seed:district:ca:new', NULL),
  ('dv:ca:provincial:old', 'district:ca:maple-provincial', 'Harbour Provincial District', 'harbour-provincial', 'provincial_electoral', 'former', '2020-01-01T00:00:00Z', '2026-01-01T00:00:00Z', 'assertion:seed:district:ca:provincial:old', NULL),
  ('dv:ca:provincial:new', 'district:ca:maple-provincial', 'Harbour Coast Provincial District', 'harbour-coast-provincial', 'provincial_electoral', 'active', '2026-01-01T00:00:00Z', NULL, 'assertion:seed:district:ca:provincial:new', 'dv:ca:provincial:old'),
  ('dv:us:senate', 'district:us:state-senate', 'Example State Senate District', 'example-state-senate', 'state_legislative', 'active', '2020-01-01T00:00:00Z', NULL, 'assertion:seed:district:us:senate', NULL)
ON CONFLICT (version_id) DO NOTHING;

INSERT INTO rmr_registry.district_boundary_version (
  boundary_version_id, district_id, geometry_reference, geometry_sha256,
  effective_from, effective_to, assertion_id
) VALUES
  ('boundary:ca:old', 'district:ca:maple-federal-old', 'synthetic://geometry/ca/old.geojson', repeat('a', 64), '2020-01-01T00:00:00Z', '2026-01-01T00:00:00Z', 'assertion:seed:boundary:ca:old'),
  ('boundary:ca:new', 'district:ca:maple-federal-new', 'synthetic://geometry/ca/new.geojson', repeat('b', 64), '2026-01-01T00:00:00Z', NULL, 'assertion:seed:boundary:ca:new'),
  ('boundary:ca:provincial:old', 'district:ca:maple-provincial', 'synthetic://geometry/ca/provincial-old.geojson', repeat('a', 64), '2020-01-01T00:00:00Z', '2026-01-01T00:00:00Z', 'assertion:seed:boundary:ca:provincial:old'),
  ('boundary:ca:provincial:new', 'district:ca:maple-provincial', 'synthetic://geometry/ca/provincial-new.geojson', repeat('b', 64), '2026-01-01T00:00:00Z', NULL, 'assertion:seed:boundary:ca:provincial:new'),
  ('boundary:us:senate', 'district:us:state-senate', 'synthetic://geometry/us/state-senate.geojson', repeat('a', 64), '2020-01-01T00:00:00Z', NULL, 'assertion:seed:boundary:us:senate')
ON CONFLICT (boundary_version_id) DO NOTHING;

INSERT INTO rmr_registry.district_jurisdiction_relationship (
  relationship_id, district_id, jurisdiction_id, kind, effective_from, effective_to, assertion_id
) VALUES
  ('djr:ca:old', 'district:ca:maple-federal-old', 'jurisdiction:ca:maple', 'represents', '2020-01-01T00:00:00Z', '2026-01-01T00:00:00Z', 'assertion:seed:district-relationship:ca:old'),
  ('djr:ca:new', 'district:ca:maple-federal-new', 'jurisdiction:ca:maple', 'represents', '2026-01-01T00:00:00Z', NULL, 'assertion:seed:district-relationship:ca:new'),
  ('djr:ca:provincial', 'district:ca:maple-provincial', 'jurisdiction:ca:harbour', 'overlaps', '2020-01-01T00:00:00Z', NULL, 'assertion:seed:district-relationship:ca:provincial'),
  ('djr:us:senate', 'district:us:state-senate', 'jurisdiction:us:example-state', 'represents', '2020-01-01T00:00:00Z', NULL, 'assertion:seed:district-relationship:us:senate')
ON CONFLICT (relationship_id) DO NOTHING;

INSERT INTO rmr_registry.district_lineage (
  lineage_id, district_id, predecessor_district_id, kind, effective_from, effective_to,
  assertion_id
) VALUES (
  'lineage:ca:redistricting', 'district:ca:maple-federal-new',
  'district:ca:maple-federal-old', 'redistricted_from', '2026-01-01T00:00:00Z', NULL,
  'assertion:seed:lineage:ca:redistricting'
)
ON CONFLICT (lineage_id) DO NOTHING;

INSERT INTO rmr_registry.public_body (public_body_id, country_code) VALUES
  ('body:ca:maple-legislature', 'CA'),
  ('body:ca:north-board', 'CA'),
  ('body:ca:harbour-council', 'CA'),
  ('body:us:state-legislature', 'US'),
  ('body:us:county-board', 'US'),
  ('body:us:water-board', 'US')
ON CONFLICT (public_body_id) DO NOTHING;

INSERT INTO rmr_registry.public_body_version (
  version_id, public_body_id, name, slug, kind, status, effective_from, effective_to,
  assertion_id
) VALUES
  ('bv:ca:legislature', 'body:ca:maple-legislature', 'Maple Legislative Assembly', 'maple-legislative-assembly', 'legislature', 'active', '2020-01-01T00:00:00Z', NULL, 'assertion:seed:body:ca:legislature'),
  ('bv:ca:regional', 'body:ca:north-board', 'North Regional Board', 'north-regional-board', 'board', 'active', '2020-01-01T00:00:00Z', NULL, 'assertion:seed:body:ca:regional'),
  ('bv:ca:council', 'body:ca:harbour-council', 'Harbour City Council', 'harbour-city-council', 'council', 'active', '2026-01-01T00:00:00Z', NULL, 'assertion:seed:body:ca:council'),
  ('bv:us:legislature', 'body:us:state-legislature', 'Example State Legislature', 'example-state-legislature', 'legislature', 'active', '2020-01-01T00:00:00Z', NULL, 'assertion:seed:body:us:legislature'),
  ('bv:us:county', 'body:us:county-board', 'Example County Board', 'example-county-board', 'board', 'active', '2020-01-01T00:00:00Z', NULL, 'assertion:seed:body:us:county'),
  ('bv:us:water', 'body:us:water-board', 'Example Water Board', 'example-water-board', 'board', 'active', '2020-01-01T00:00:00Z', NULL, 'assertion:seed:body:us:water')
ON CONFLICT (version_id) DO NOTHING;

INSERT INTO rmr_registry.body_jurisdiction_relationship (
  relationship_id, public_body_id, jurisdiction_id, kind, effective_from, effective_to,
  assertion_id
) VALUES
  ('bjr:ca:legislature', 'body:ca:maple-legislature', 'jurisdiction:ca:maple', 'governs', '2020-01-01T00:00:00Z', NULL, 'assertion:seed:body-relationship:ca:legislature'),
  ('bjr:ca:regional', 'body:ca:north-board', 'jurisdiction:ca:north-region', 'governs', '2020-01-01T00:00:00Z', NULL, 'assertion:seed:body-relationship:ca:regional'),
  ('bjr:ca:council', 'body:ca:harbour-council', 'jurisdiction:ca:harbour', 'governs', '2026-01-01T00:00:00Z', NULL, 'assertion:seed:body-relationship:ca:council'),
  ('bjr:us:legislature', 'body:us:state-legislature', 'jurisdiction:us:example-state', 'governs', '2020-01-01T00:00:00Z', NULL, 'assertion:seed:body-relationship:us:legislature'),
  ('bjr:us:county', 'body:us:county-board', 'jurisdiction:us:example-county', 'governs', '2020-01-01T00:00:00Z', NULL, 'assertion:seed:body-relationship:us:county'),
  ('bjr:us:water', 'body:us:water-board', 'jurisdiction:us:water', 'governs', '2020-01-01T00:00:00Z', NULL, 'assertion:seed:body-relationship:us:water')
ON CONFLICT (relationship_id) DO NOTHING;

INSERT INTO rmr_registry.office (office_id, country_code) VALUES
  ('office:ca:maple-member', 'CA'),
  ('office:ca:north-director', 'CA'),
  ('office:ca:harbour-mayor', 'CA'),
  ('office:us:state-senator', 'US'),
  ('office:us:water-director', 'US'),
  ('office:us:former-commissioner', 'US')
ON CONFLICT (office_id) DO NOTHING;

INSERT INTO rmr_registry.office_version (
  version_id, office_id, public_body_id, district_id, name, slug, selection_method,
  operational_state, effective_from, effective_to, assertion_id, supersedes_version_id
) VALUES
  ('ov:ca:member', 'office:ca:maple-member', 'body:ca:maple-legislature', 'district:ca:maple-provincial', 'Member of the Maple Legislative Assembly', 'maple-assembly-member', 'elected', 'active', '2020-01-01T00:00:00Z', NULL, 'assertion:seed:office:ca:member', NULL),
  ('ov:ca:appointed', 'office:ca:north-director', 'body:ca:north-board', NULL, 'Appointed Regional Director', 'appointed-regional-director', 'appointed', 'active', '2020-01-01T00:00:00Z', NULL, 'assertion:seed:office:ca:appointed', NULL),
  ('ov:ca:mayor:active', 'office:ca:harbour-mayor', 'body:ca:harbour-council', NULL, 'Mayor of Harbour City', 'harbour-city-mayor', 'elected', 'active', '2026-01-01T00:00:00Z', '2027-01-01T00:00:00Z', 'assertion:seed:office:ca:mayor:active', NULL),
  ('ov:ca:mayor:vacant', 'office:ca:harbour-mayor', 'body:ca:harbour-council', NULL, 'Mayor of Harbour City', 'harbour-city-mayor', 'elected', 'vacant', '2027-01-01T00:00:00Z', NULL, 'assertion:seed:office:ca:mayor:vacant', 'ov:ca:mayor:active'),
  ('ov:us:senator', 'office:us:state-senator', 'body:us:state-legislature', 'district:us:state-senate', 'Example State Senator', 'example-state-senator', 'elected', 'active', '2020-01-01T00:00:00Z', NULL, 'assertion:seed:office:us:senator', NULL),
  ('ov:us:water', 'office:us:water-director', 'body:us:water-board', NULL, 'Appointed Water Director', 'appointed-water-director', 'appointed', 'acting', '2020-01-01T00:00:00Z', NULL, 'assertion:seed:office:us:water', NULL),
  ('ov:us:former:active', 'office:us:former-commissioner', 'body:us:county-board', NULL, 'Former At-Large Commissioner', 'former-at-large-commissioner', 'elected', 'active', '2020-01-01T00:00:00Z', '2026-01-01T00:00:00Z', 'assertion:seed:office:us:former:active', NULL),
  ('ov:us:former:abolished', 'office:us:former-commissioner', 'body:us:county-board', NULL, 'Former At-Large Commissioner', 'former-at-large-commissioner', 'elected', 'abolished', '2026-01-01T00:00:00Z', NULL, 'assertion:seed:office:us:former:abolished', 'ov:us:former:active')
ON CONFLICT (version_id) DO NOTHING;

INSERT INTO rmr_registry.external_identifier (
  external_identifier_id, jurisdiction_id, issuer, identifier, effective_from,
  effective_to, assertion_id
) VALUES
  ('external:ca:harbour:old', 'jurisdiction:ca:harbour', 'synthetic-ca-registry', 'HARBOUR-VILLAGE-001', '2020-01-01T00:00:00Z', '2026-01-01T00:00:00Z', 'assertion:seed:external:harbour:old'),
  ('external:ca:harbour:new', 'jurisdiction:ca:harbour', 'synthetic-ca-registry', 'HARBOUR-CITY-019', '2026-01-01T00:00:00Z', NULL, 'assertion:seed:external:harbour:new')
ON CONFLICT (external_identifier_id) DO NOTHING;

INSERT INTO rmr_registry.public_gap (
  gap_id, jurisdiction_id, code, message, effective_from, effective_to, assertion_id
) VALUES (
  'gap:us:water', 'jurisdiction:us:water', 'BOUNDARY_REVIEW_REQUIRED',
  'Synthetic special-district boundary coverage is partial and cannot resolve location.',
  '2020-01-01T00:00:00Z', NULL, 'assertion:seed:gap:water'
)
ON CONFLICT (gap_id) DO NOTHING;

INSERT INTO rmr.synthetic_seed_marker (fixture_key, description)
VALUES (
  'synthetic.jurisdiction.registry.v1',
  'Synthetic Canada and United States nested jurisdiction registry; no real people or civic activity.'
)
ON CONFLICT (fixture_key) DO NOTHING;
