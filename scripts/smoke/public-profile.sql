\set ON_ERROR_STOP on

BEGIN;

DO $$
DECLARE
  prior_etag text;
BEGIN
  IF (SELECT count(*) FROM rmr_public.current_profile_read) <> 2 THEN
    RAISE EXCEPTION 'Synthetic Canadian and United States public profiles are missing.';
  END IF;
  IF EXISTS (
    SELECT 1 FROM rmr_public.profile
    WHERE num_nonnulls(office_term_id, candidacy_id) <> 1
  ) THEN
    RAISE EXCEPTION 'A public profile conflates or omits its public-role context.';
  END IF;
  IF EXISTS (
    SELECT 1
    FROM rmr_public.profile_version version
    JOIN rmr_public.profile_publication_decision decision
      ON decision.decision_id = version.publication_decision_id
    WHERE decision.actor_type NOT IN ('reviewer', 'admin') OR decision.decision <> 'publish'
  ) THEN
    RAISE EXCEPTION 'A profile version bypassed explicit human publication review.';
  END IF;
  IF EXISTS (
    SELECT 1 FROM rmr_public.profile_version version
    WHERE NOT EXISTS (
      SELECT 1 FROM rmr_public.profile_version_source source
      WHERE source.profile_version_id = version.profile_version_id
    )
  ) THEN
    RAISE EXCEPTION 'A public profile version is missing reviewed source linkage.';
  END IF;
  SELECT etag INTO prior_etag
  FROM rmr_public.current_profile_read
  WHERE profile_id = 'profile:ca:avery-quill:maple-member:2024';
  IF prior_etag <> 'W/"profile:ca:avery-quill:maple-member:2024.v3"' THEN
    RAISE EXCEPTION 'Initial public profile ETag is not derived from record version.';
  END IF;

  BEGIN
    INSERT INTO rmr_public.profile_publication_decision (
      decision_id, actor_type, actor_reference, decision, reason_code,
      policy_version, decided_at
    ) VALUES (
      'publication-decision:smoke:source-process', 'source_process', 'worker:smoke',
      'publish', 'INVALID_AUTOMATIC_PUBLICATION', 'public-profile.v1', clock_timestamp()
    );
    RAISE EXCEPTION 'Source process unexpectedly created a publication decision.';
  EXCEPTION WHEN check_violation THEN NULL;
  END;

  BEGIN
    INSERT INTO rmr_public.profile_version (
      profile_version_id, profile_id, record_version, update_kind,
      publication_decision_id, public_payload, updated_at,
      supersedes_profile_version_id, payload_sha256
    ) VALUES (
      'profile-version:smoke:unsafe', 'profile:ca:avery-quill:maple-member:2024', 99,
      'source_refresh', 'publication-decision:ca:profile:1',
      '{"moderatorNotes":"must not escape"}'::jsonb, clock_timestamp(),
      'profile-version:ca:avery:3', repeat('f', 64)
    );
    RAISE EXCEPTION 'Restricted public profile payload unexpectedly passed validation.';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
END
$$;

INSERT INTO rmr_public.profile_publication_decision (
  decision_id, actor_type, actor_reference, decision, reason_code, policy_version, decided_at
) VALUES (
  'publication-decision:smoke:correction', 'reviewer', 'reviewer:smoke',
  'publish', 'SYNTHETIC_CORRECTION', 'public-profile.v1', '2026-08-07T16:00:00Z'
);

INSERT INTO rmr_public.profile_version (
  profile_version_id, profile_id, record_version, update_kind,
  publication_decision_id, public_payload, updated_at,
  supersedes_profile_version_id, payload_sha256
) VALUES (
  'profile-version:smoke:ca:4', 'profile:ca:avery-quill:maple-member:2024', 4,
  'correction', 'publication-decision:smoke:correction',
  '{"schemaVersion":"public-role-profile.v1","dataMode":"synthetic","profileId":"profile:ca:avery-quill:maple-member:2024","recordVersion":4}'::jsonb,
  '2026-08-07T16:00:00Z', 'profile-version:ca:avery:3', repeat('e', 64)
);

INSERT INTO rmr_public.profile_version_source (
  profile_version_id, reviewed_record_version_id
) VALUES ('profile-version:smoke:ca:4', 'reviewed-version:ca:avery:1');

SET CONSTRAINTS rmr_public.profile_version_requires_source IMMEDIATE;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM rmr_public.current_profile_read
    WHERE profile_id = 'profile:ca:avery-quill:maple-member:2024'
      AND record_version = 4
      AND etag = 'W/"profile:ca:avery-quill:maple-member:2024.v4"'
  ) THEN
    RAISE EXCEPTION 'Correction did not invalidate the public profile ETag/version.';
  END IF;
  BEGIN
    UPDATE rmr_public.profile_version
    SET updated_at = clock_timestamp()
    WHERE profile_version_id = 'profile-version:smoke:ca:4';
    RAISE EXCEPTION 'Append-only public profile version unexpectedly changed.';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM <> 'public profile history is append-only' THEN
      RAISE;
    END IF;
  END;
END
$$;

ROLLBACK;
