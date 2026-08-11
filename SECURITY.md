# Security Policy

Rate My Representatives handles high-risk civic, identity, location, moderation, and public-record workflows. Security and privacy reports must be handled without exposing users, representatives, contributors, committee members, credentials, or unpatched attack paths.

## Supported versions

The project is currently pre-release. Until an official release table is published, only the current default branch and expressly identified pilot builds receive security fixes.

No repository issue, specification, mockup, or test deployment should be assumed to be a supported production service.

## Report privately

Use GitHub's **Private vulnerability reporting / Security Advisories** interface for this repository when available.

If the private interface is unavailable, use the project's public contact route only to request a secure reporting channel. Do **not** include exploit details, credentials, personal information, identity records, private signals, or vulnerable endpoints in that first message.

Do not report vulnerabilities through public GitHub issues, pull requests, discussions, Discord, social media, or public email threads.

## Include

A useful report contains:

- affected revision, release, environment, platform, and feature flags;
- whether the issue affects iOS, Android, web, API, worker, admin, portal, Verus Mobile, Verus RPC, or infrastructure;
- clear reproduction steps using test data;
- expected and actual behavior;
- impact and plausible abuse conditions;
- logs or screenshots with secrets and personal information removed;
- whether the issue is actively exploited; and
- a safe remediation suggestion when known.

Never send a real private key, WIF, seed phrase, wallet file, identity document, precise home address, private representative signal, moderation dossier, or production access token. Use synthetic fixtures.

## High-priority classes

Treat the following as urgent:

- authentication or authorization bypass;
- cross-account access to private civic activity;
- public disclosure of political opinions, precise location, identity evidence, contact information, or moderator material;
- representative-profile takeover or false official-response authorization;
- forged Verus Mobile callback, replay, wrong-chain acceptance, QR substitution, or signer confusion;
- unsafe `IdentityUpdateRequest` content or approval bypass;
- leakage of Verus RPC credentials or signing material;
- accidental mainnet write;
- remote code execution, SQL injection, SSRF, arbitrary file access, or object-storage escape;
- suppression-threshold bypass or aggregate re-identification;
- an agent, automated account, or unauthorized actor submitting a representative signal;
- hidden citizen scoring or policy paths that violate the No Social Credit Covenant;
- moderation or correction-state bypass that publishes unreviewed allegations;
- provenance verification that labels unconfirmed or mismatched data as verified; and
- compromise of an application, provenance, or representative-controlled Verus identity.

## Safe-harbour expectations

Good-faith testing must:

- use accounts and data you own or are authorized to test;
- avoid accessing, changing, deleting, or retaining another person's data;
- avoid degrading service or running denial-of-service tests;
- avoid publishing the vulnerability before a coordinated disclosure decision;
- stop when sensitive data is encountered; and
- comply with applicable law.

This policy does not authorize testing against third-party systems, government systems, source publishers, Verus infrastructure not controlled by this project, app stores, or Checks and Balances Protocol deployments.

## Response process

The project will aim to:

1. acknowledge receipt through the private channel;
2. confirm scope and severity;
3. preserve evidence and revoke exposed credentials when necessary;
4. prepare and test a fix or mitigation;
5. notify affected operators or users when legally and operationally required;
6. publish an advisory after remediation when disclosure is appropriate; and
7. credit the reporter with permission.

No specific response deadline is promised in this pre-release policy. Active exploitation, exposed credentials, or personal-data risk should be identified clearly in the report so emergency procedures can begin immediately.

## Operational incidents

Security vulnerabilities and live incidents are related but different. A live incident may require disabling writes, wallet callbacks, identity-update flows, representative claims, signal submission, source ingestion, or provenance publication while preserving safe public read access.

When Verus is degraded or compromised, the application must not describe an unconfirmed transaction as verified, and the public representative record must remain available with an accurate provenance status.

The canonical abuse/privacy-harm catalog, trust boundaries, safe-degradation rules,
evidence status, incident-owner roles, and independent-review blockers are defined in
[`docs/THREAT_MODEL.md`](./docs/THREAT_MODEL.md). That accepted design baseline is not a
claim that production controls or review have been completed.

The public Covenant, prohibited uses, narrow-state limits, enforcement evidence, rights,
and release blockers are canonical in
[`docs/NO_SOCIAL_CREDIT.md`](./docs/NO_SOCIAL_CREDIT.md). A suspected violation follows
this private reporting process and is treated as a security/privacy incident.
