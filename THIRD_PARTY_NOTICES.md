# Third-Party Notices

This file is the repository-level inventory for third-party software, data, schemas, media, and other material that requires attribution, notice preservation, source disclosure, or use restrictions.

## Current status

The issue #8 repository foundation uses the package versions locked in `pnpm-lock.yaml`.
These dependencies support local and CI scaffolding only; no civic feature or production
service is operational. CI checks dependency licences and uploads no private data.

Direct runtime foundations introduced by issue #8 are:

| Component | Version | Upstream | Licence | Use |
|---|---:|---|---|---|
| Expo | 57.0.11 | https://github.com/expo/expo | MIT | Native iOS/Android development-build foundation |
| React | 19.2.3 | https://github.com/facebook/react | MIT | Native/web UI runtime |
| React Native | 0.86.0 | https://github.com/facebook/react-native | MIT | Native application runtime |
| React Native for Web | 0.21.2 | https://github.com/necolas/react-native-web | MIT | Expo web compatibility |
| Vite | 8.2.1 | https://github.com/vitejs/vite | MIT | Web, portal, and admin builds |
| openapi-fetch | 0.17.0 | https://github.com/openapi-ts/openapi-typescript | MIT | Generated-contract client runtime |
| nginx | 1.28.2 | https://nginx.org | BSD-2-Clause | Static web serving and same-origin API proxy container |
| PostgreSQL | 17.10 | https://www.postgresql.org | PostgreSQL | Canonical local/CI database container |
| RabbitMQ | 4.3.4 | https://www.rabbitmq.com | MPL-2.0 | Durable local/CI retry and dead-letter queue |
| MinIO | RELEASE.2025-10-15T17-29-55Z | https://github.com/minio/minio | AGPL-3.0-only | Source-built S3-compatible local/CI object storage service |
| MinIO Client | RELEASE.2025-08-13T08-35-41Z | https://github.com/minio/mc | AGPL-3.0-only | Local/CI bucket and policy initialization container |
| Mailpit | 1.30.6 | https://github.com/axllent/mailpit | MIT | Local/CI email catcher |
| VerusCoin CLI | 1.2.16-1 | https://github.com/VerusCoin/VerusCoin | MIT | Optional VRSCTEST daemon profile only; upstream archive checksums pinned |

Development-only generators, linters, test runners, and CI tooling remain governed by
their upstream licences and exact versions in `pnpm-lock.yaml`. This inventory must be
expanded before distributing applications or adding native libraries, datasets, media,
connectors, containers, or Verus dependencies.

Before a dependency, source snapshot, photograph, logo, map, dataset, model, SDK, generated client, or copied code is committed or distributed, the contributor must record:

| Field | Required information |
|---|---|
| Component | Package, repository, dataset, media item, schema, or source name |
| Version/revision | Exact release, commit, retrieval date, or dataset version |
| Upstream | Canonical project or publisher location |
| Licence/terms | SPDX identifier or exact governing terms |
| Copyright/attribution | Required copyright and attribution text |
| Modifications | Whether and how the project modified it |
| Distribution impact | Source, notice, copyleft, patent, data, or media obligations |
| Owner | Maintainer responsible for continuing compliance |

## Dependency rules

- Prefer dependencies with clear, compatible licences.
- Preserve upstream `LICENSE`, `NOTICE`, copyright, patent, and attribution requirements.
- Do not assume that an npm, CocoaPods, Swift Package Manager, Gradle, Docker, dataset, API, or model listing grants unrestricted use.
- Review strong-copyleft, network-copyleft, source-available, non-commercial, field-of-use, data-resale, map-tile, media, and model licences before adoption.
- Do not copy code or data from a public repository that lacks a licence.
- Generated code inherits upstream terms when applicable.
- Mobile app distribution must account for Apple App Store and Google Play disclosure and notice requirements.
- Source connectors must record the publisher's access, copyright, database, attribution, retention, and redistribution terms.
- Official photographs, party logos, government seals, maps, and video are not automatically open-source because they are publicly viewable.

## Verus dependencies

Any Verus component must be recorded with its exact version or commit and actual governing licence. The Verus ecosystem includes components and build dependencies with different licence implications; do not treat “Verus-based” as one universal licence determination.

The project's own Apache-2.0 licence does not replace third-party terms.

## Automated inventory

Once implementation begins, CI should generate and retain:

- software bills of materials for server, web, iOS, Android, containers, and infrastructure;
- dependency licence reports;
- notices bundled into distributed applications where required;
- vulnerability reports; and
- a review failure for unknown, unapproved, or incompatible licences.

This file must be updated before the corresponding dependency or material is included in an official release.
