# ADR 0011: Enforced security domains and classified storage

- Status: Accepted
- Date: 2026-08-09
- Issue: #22

## Context

Rate My Representatives will eventually handle public civic records, account security,
transient location, identity evidence, private political judgment, moderation material,
public methodology/provenance, and Verus signing. Documentation alone cannot prevent an
API credential, general worker, serializer, backup, or analytics query from crossing
those boundaries.

## Decision

Adopt eight named security domains with deny-by-default principal/operation grants.
Enforce the boundary in TypeScript policy, generated JSON Schema, PostgreSQL
schemas/roles/functions, distinct runtime credentials, object-store buckets/policies,
network topology, observability allowlists/redaction, backup metadata, and synthetic
tests.

Public output comes only from allowlisted read models and strict serializers. The API and
general worker never use the database owner. General workers cannot claim provenance or
signer work. Public/native/web/general-worker processes receive no signer/RPC credential
or network path. Cross-domain decisions are append-only and payload-free. Public exports
cannot join account/identity data to individual civic activity or expose a generalized
citizen score.

Keep all high-risk feature flags false. Reserved schemas and service roles are boundaries,
not claims that the corresponding features exist. The core stack remains synthetic and
builds/tests without Verus.

## Consequences

- New domains, grants, queue families, object buckets, analytics fields, or public fields
  require a reviewed policy/contract/migration/test change.
- Backups and restores preserve classification; production-to-non-production restore is
  prohibited.
- Publication and signing need dedicated future processes and credentials.
- Issue #6 remains the threat-model exercise, issue #25 remains the disaster-recovery
  exercise, and issue #57 remains the broader No Social Credit review.

## Rollback

Do not edit or reverse an applied migration by dropping classified schemas or access
history. Revert application use, disable affected consumers, rotate credentials, and add
a forward migration that removes an erroneous grant while preserving audit evidence.
