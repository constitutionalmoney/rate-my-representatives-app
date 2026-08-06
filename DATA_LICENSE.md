# Data and Source-Material Licensing Policy

## 1. Code licence is not a blanket data licence

The Apache License, Version 2.0 applies to repository content identified as Apache-2.0. It does not automatically grant rights in:

- the production Rate My Representatives database;
- third-party government, legislative, electoral, media, research, map, photograph, video, document, or API content;
- source snapshots or excerpts governed by publisher terms or copyright;
- trademarks, logos, seals, badges, or credential designs;
- personal information or private civic activity;
- representative-claim or staff-authorization evidence;
- moderation records, private correspondence, or security information; or
- datasets separately identified under another licence or terms.

Publicly viewable information is not necessarily free of copyright, database, privacy, contractual, attribution, or redistribution restrictions.

## 2. Repository fixtures

Synthetic fixtures authored for this project may be used under Apache-2.0 only when the fixture or its containing directory expressly says so.

A fixture that represents a real public record must identify:

- source/publisher;
- retrieval or version date;
- governing licence/terms or public-domain basis as reviewed;
- required attribution;
- whether the content was modified or reduced;
- permitted test/distribution use; and
- responsible maintainer.

Do not commit copied source data when a synthetic fixture or minimal metadata example is sufficient.

## 3. Production civic database

The official hosted service may compile facts, sources, corrections, responses, methods, and other records from multiple origins. No public licence for the complete production database is granted merely because the application code is open source.

Before offering a dataset export or public data licence, the project must determine:

- which fields are project-authored facts or metadata;
- which fields reproduce or derive from third-party material;
- applicable copyright/database rights and contractual terms;
- attribution requirements;
- privacy and re-identification risk;
- correction and update obligations;
- geographic/jurisdictional restrictions;
- provenance and versioning; and
- whether a recognized open-data licence is appropriate.

Any approved dataset release must carry an explicit licence and version. Silence means no additional permission beyond applicable law and the source's own terms.

## 4. Source records and snapshots

For every source, record when feasible:

| Field | Description |
|---|---|
| Publisher | Government, body, organization, person, outlet, or other source |
| Original URL/API | Canonical source location |
| Retrieval/version | Date, release, election, term, or dataset version |
| Source type | Official record, public statement, research, media, submission, etc. |
| Governing terms | Licence, terms of use, public-domain statement, contract, or unresolved status |
| Attribution | Required attribution and notice |
| Storage permission | Metadata only, excerpt, snapshot, full dataset, cache duration |
| Redistribution permission | Whether repository/API/export redistribution is allowed |
| Modification | Normalization, extraction, redaction, or transformation performed |
| Owner | Maintainer responsible for review and refresh |

When full content cannot be stored or redistributed, retain only permitted metadata, hashes, limited excerpts, and source links. A hash does not grant permission to copy the underlying work.

## 5. Photographs, logos, seals, and media

Do not assume an official photograph, government seal, party logo, campaign image, map tile, video, or social-media post is freely reusable.

Record the exact source and use basis. Prefer:

- media expressly licensed for reuse;
- official materials with clear reuse terms;
- project-created media with written assignment/licence;
- minimal factual metadata and an external link when redistribution rights are unclear.

Open-source forks must obtain their own rights for third-party media and must comply with `TRADEMARKS.md`.

## 6. Personal information and civic activity

A copyright or data licence does not override privacy, confidentiality, consent, correction, deletion, objection, retention, security, or No Social Credit obligations.

The following are not open datasets merely because the application processes them:

- accounts and authentication records;
- precise location input;
- VerusID account links;
- human-attestation details;
- individual representative signals or category ratings;
- Civic Signal subscriptions/preferences;
- private evidence or moderator material;
- representative/staff authorization evidence;
- device/push/security data; and
- private support correspondence.

Do not place these records in repository fixtures, public exports, public APIs, analytics datasets, or VDXF manifests.

## 7. Contributions

A contributor who submits data, media, source snapshots, or excerpts certifies through the DCO only that they have the right to submit the contribution under the identified terms. The DCO does not transform third-party material into Apache-2.0 content.

The pull request must identify source, licence/terms, attribution, modifications, and distribution impact. Unknown or incompatible rights block inclusion.

## 8. Machine-readable inventory

Once implementation begins, maintain a machine-readable inventory for:

- software dependencies;
- government/public datasets;
- source connectors and API terms;
- maps/geocoders;
- images/media;
- AI/model/provider terms where relevant;
- generated data exports; and
- separately licensed schemas or SDKs.

CI should fail official releases containing an unknown or unapproved third-party licence/term classification.

## 9. Requests for data reuse

A request to reuse code is governed by Apache-2.0. A request to reuse a dataset, media item, source snapshot, trademark, hosted-service content, or production export must be evaluated under the specific material's rights and policy. Permission for one category does not imply permission for another.
