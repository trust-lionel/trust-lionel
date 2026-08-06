---
title: "Microsoft Entra ID Is Retiring SMS MFA — What Your Organization Needs to Do Before September 1, 2026"
description: "Microsoft Entra ID (formerly Azure Active Directory / Azure AD) is retiring SMS and voice MFA on February 1, 2027, with auto-enrollment in passkeys beginning September 1, 2026. Here is the complete action plan for IT Directors, CIOs, and business owners managing Microsoft 365 environments."
pubDate: 2026-08-06
tags:
  - Microsoft 365
  - Microsoft Entra ID
  - Cybersecurity
  - Cyber Resilience
  - MITRE ATT&CK
  - Business Continuity
  - Field Notes
  - Small Business
cover: https://images.unsplash.com/photo-1651235732694-0d057ace2f30?w=1400&q=80&auto=format&fit=crop
spotifyPlaylistId: "37i9dQZF1DX0SM0LYsmbMT"
postType: "coverTop"
featured: false
---

*Field Notes — IT Director Series*

---

On July 13, 2026, Microsoft published an announcement that every organization running Microsoft 365 should have read immediately. Most have not. The announcement is straightforward: starting September 1, 2026, Microsoft Entra ID (formerly Azure Active Directory / Azure AD) will begin automatically enrolling users in passkey-based authentication and prompting them to move away from SMS and voice MFA. On February 1, 2027, Microsoft will retire its native SMS and voice delivery entirely. After that date, users who still depend on those methods will be required to register a passkey before they can sign in. There is no opt-out.

This is not a feature update. It is a mandatory architectural change to how your organization authenticates to Microsoft 365, Azure, Teams, SharePoint, and every other Entra ID-connected service. The question is not whether your authentication environment is changing. The question is whether you are managing that change proactively or absorbing it reactively when your staff encounters unexpected prompts during a routine sign-in.

---

## Why Microsoft Entra ID Is Replacing SMS MFA With Passkeys

The threat environment that SMS and voice MFA were designed to address has evolved well past their capabilities — and that evolution is precisely why Microsoft Entra ID is making this move now. Microsoft Threat Intelligence has documented AI-enabled phishing campaigns achieving click-through rates as high as 54 percent, compared with roughly 12 percent for traditional campaigns. SIM swapping, adversary-in-the-middle proxy attacks, and social engineering of help desks have made shared-secret authentication methods a liability rather than a control.

If you read the July 16 Field Notes post — [**What Attackers Do After They Get Past Your MFA**](https://trust-lionel.com/posts/what-attackers-do-after-mfa/) — you already understand the post-breach attack sequence that follows a compromised MFA session. AiTM phishing proxies intercept session tokens in real time, satisfying legacy MFA challenges transparently while the attacker establishes persistence behind the scenes. The authentication control passes, the attacker is in, and the organization does not know it until days or weeks later — after inbox rules have been planted, OAuth grants have been established, and mailbox data has been observed long enough to map financial workflows.

Passkeys defeat this attack vector by design. They use public-key cryptography rather than shared secrets, and the authentication is cryptographically bound to the legitimate domain — a proxy cannot intercept what it cannot relay. Microsoft Entra ID is not retiring SMS and voice MFA because they were poorly implemented. They are retiring them because the attack surface has shifted to a place where no implementation of those methods is adequate against the current threat environment. For organizations that have not yet adopted phishing-resistant authentication, September 1, 2026 is the deadline that determines whether this transition is managed or reactive.

---

## The Microsoft Entra ID MFA Retirement Timeline

Microsoft has published a clear schedule with no ambiguity in these dates. Understanding the full timeline is the starting point for every organization's preparation plan.

**September 1, 2026** — Microsoft Entra ID begins auto-enabling passkeys for all users currently enabled for SMS or voice authentication. The next time those users perform multifactor authentication, they will be prompted to register a passkey. This rollout happens on Microsoft's schedule — not yours.

**September 18, 2026** — Microsoft publishes pricing, commercial terms, and a list of supported third-party telecom providers for organizations that still require SMS or voice for regulatory, technical, or operational reasons. These providers will be available through the Microsoft Security Store.

**October 30, 2026** — Admins can begin selecting and configuring supported third-party telecom providers through the Microsoft Security Store if SMS or voice remains necessary for specific user segments.

**February 1, 2027** — Microsoft-provided SMS and voice MFA ends. Users still dependent on these methods will be required to register a passkey before they can sign in. This enforcement applies to all users in all tenants, with no opt-out option.

The window between now and September 1 is the preparation window — not a grace period. Organizations that use it well will deliver a smooth, user-informed transition. Organizations that do not will manage a help desk surge and user confusion that could have been avoided entirely. What that preparation looks like depends on your role in the organization.

---

## What to Do Before September 1, 2026 — By Role

## If You Are an IT Director or Microsoft 365 Administrator

Your first action is an audit. Pull authentication method reports from the Microsoft Entra ID admin center and identify every user currently enabled for SMS or voice authentication. The free Microsoft 365 PowerShell tools maintained by 4TH AND BAILEY at [**github.com/4thandBailey/tools**](https://github.com/4thandBailey/tools) include MFA status reporting built on Microsoft Graph API v1.0 — cross-platform, production-tested, and available at no cost. Once you know who is affected, you can scope the transition accurately.

Next, choose your passkey deployment path. Microsoft Entra ID supports two categories of passkeys:

**Synced passkeys** — stored in platform credential managers like iCloud Keychain and Google Password Manager. These sync across a user's devices automatically and require no additional hardware. For most SMB environments running a mix of macOS, iOS, Windows, and Android devices, synced passkeys are the lowest-friction deployment path available.

**Device-bound passkeys** — including Microsoft Authenticator passkeys, Entra passkey on Windows, and FIDO2 security keys. These are tied to a specific device and offer stronger attestation, making them appropriate for high-privilege accounts, shared workstations, or environments with specific compliance requirements.

Microsoft Entra ID's built-in registration campaign feature handles the rollout mechanically — prompting users to register a passkey during their next MFA sign-in, at scale, without requiring individual outreach. Enable it before September 1 so the transition happens on your schedule rather than Microsoft's automated rollout pace.

## If You Are a CIO or Technology Leader

The February 1, 2027 hard cutoff is a board-level risk item that belongs in your next technology risk review. Any organization with compliance obligations — HIPAA, PCI DSS, SOC 2, CMMC — that still relies on SMS or voice for Microsoft Entra ID authentication after that date will have a documented control gap. The retirement is published, the timeline is public, and the decision to delay preparation is a decision your auditor will find in the next review cycle.

The passkey transition also surfaces adjacent questions worth addressing before September 1: Which users have standing access to sensitive systems via SMS-verified sessions? Are there shared accounts or service accounts using phone-based MFA that are not tied to an individual user? Is your help desk prepared to support passkey registration for users who encounter difficulty during the transition? These are not hypothetical questions — they are the questions your auditor will ask, and they are easier to answer before enforcement begins than after.

## If You Are an Owner, CEO, or Operator Whose IT Is Managed or Outsourced

If your technology environment is managed by an IT provider or managed services partner, the responsibility for planning this transition sits with them — but the accountability for the outcome sits with your organization. If your IT provider has not raised Microsoft's SMS MFA retirement with you before September 1, ask them directly: what is the plan, what is the timeline, and what will your staff experience when the change rolls out?

The practical impact on your staff is straightforward: sometime after September 1, the next time an employee signs into Microsoft 365, they may be prompted to register a passkey before they can proceed. If they are not expecting it, they will either click through a setup they do not understand, call your help desk, or abandon the sign-in entirely. A brief communication to staff — what is changing, when it will happen, what to do — sent before September 1 eliminates most of that friction at minimal cost. Synced passkeys are free, supported on every modern device, and require no hardware purchase. The cost of the transition is time. The cost of not managing it is operational disruption during normal business hours.

---

## What If Your Organization Still Needs SMS or Voice MFA?

Microsoft is not eliminating SMS and voice authentication for organizations with genuine regulatory or operational requirements — they are eliminating their native delivery of it. Starting October 30, 2026, organizations that still require SMS or voice for specific user segments can select a supported third-party telecom provider through the Microsoft Security Store. Pricing and provider details will be published September 18, 2026.

If your organization falls into this category — healthcare environments with specific clinical workflows, regulated financial services with vendor authentication requirements, or operational environments with legacy device constraints — begin identifying and documenting those user segments now. Having that list ready when the provider marketplace opens on October 30 means you can act immediately rather than scrambling to map affected users under deadline pressure.

For the vast majority of organizations, the path forward is clear: migrate to passkeys, use Microsoft Entra ID's registration campaign to drive adoption at scale, and complete the transition well before February 1, 2027.

---

## The Authentication Posture That September 1 Reveals

Microsoft's retirement of SMS and voice MFA is the platform-level acknowledgment of a threat reality that practitioners have been documenting for years. AiTM phishing, session token theft, and credential abuse at scale have made legacy MFA a control that provides the appearance of security without the substance of it. September 1 does not create this problem — it surfaces it, at scale, for every organization that has not already addressed it.

Phishing-resistant authentication — passkeys, FIDO2 keys, certificate-based authentication — closes the gap that attackers have been exploiting. Organizations that complete this transition before September 1 will be ahead of the enforcement curve and prepared for the February 1, 2027 hard cutoff. Organizations that wait will be managing a disruption that was visible months in advance.

If your organization's Microsoft Entra ID authentication posture is not something you have reviewed recently — or if you are uncertain what your current MFA deployment looks like across your tenant — that uncertainty is the finding.

[**→ Book the Infrastructure Governance Briefing**](https://calendly.com/4thandbailey/infrastructure-governance-briefing)

---

*This platform is built with ❤️ in Houston, TX.*

---
