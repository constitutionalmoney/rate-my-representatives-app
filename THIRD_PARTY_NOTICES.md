# Third-Party Notices

This file is the repository-level inventory for third-party software, data, schemas, media, and other material that requires attribution, notice preservation, source disclosure, or use restrictions.

## Current status

The application has not yet been scaffolded. No production dependency inventory is asserted by this file.

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
