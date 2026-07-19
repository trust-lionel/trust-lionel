---
title: "What Attackers Do After They Get Past Your MFA"
description: "Most AiTM phishing narratives end at the credential capture. What happens in the hours and days that follow rarely gets documented. This field note does."
pubDate: 2026-07-16
tags:
  - Cybersecurity
  - Cyber Resilience
  - Microsoft 365
  - Incident Response
  - Phishing
  - Microsoft Entra ID
  - Business Continuity
  - MITRE ATT&CK
  - Field Notes
cover: https://plus.unsplash.com/premium_photo-1768374180121-f86dc6a506e3?w=1400&q=80&auto=format&fit=crop
featured: false
spotifyPlaylistId: "6HLnsyzO91CQ5nvYL9mIUl"
---

*Field Notes — InfoSec Officer Series*

---

Most AiTM phishing narratives end at the credential capture. The attacker intercepted the session token, bypassed MFA, and got in. That part gets documented. What happens in the hours — and days — that follow rarely does.

In a recent engagement involving a compromised executive account at a mid-market organization, the breach window was approximately 24 hours before containment was initiated. The attacker entered through a well-constructed AiTM proxy — the kind that forwards credentials and session tokens in real time, making the login appear entirely legitimate to Microsoft's authentication stack. Legacy MFA was satisfied. No alert fired at the point of entry.

What the attacker did with that access is the part worth documenting.

---

## The Persistence Mechanisms Were Methodical, Not Opportunistic

The first priority was not data exfiltration. It was persistence establishment. Within the breach window, the attacker registered a rogue authenticator device against the compromised identity in Entra ID, added external contact information to the account's security profile, and created inbox rules designed to survive the inevitable password reset. One rule used a single obfuscated character as its name — the kind of detail that gets missed in a cursory audit.

The inbox rule behavior is worth understanding specifically. Rules persist on the mailbox object independently of the account's authentication state. A password reset, a session revocation, even a full MFA re-enrollment — none of these touch the mailbox rule configuration. An attacker who plants a forwarding rule before remediation begins retains visibility into that mailbox even after the account appears secured. The rule survives.

The OAuth application grant picture was similarly deliberate. Session revocation terminates active authenticated sessions. It does not invalidate OAuth refresh tokens held by consented third-party applications. These require a separate audit and revocation step that the standard incident response playbook — reset password, revoke sessions, re-enroll MFA — does not address. Organizations that follow the standard playbook and stop there leave a persistence mechanism intact that they cannot see without specifically looking for it. And that persistence mechanism becomes the foundation for everything that follows.

---

## When a Compromised Mailbox Goes Undetected, the Attack Advances

An executive's mailbox carries a level of organizational trust that no external sender can replicate. Vendors respond to payment requests. Staff act on directives. Partners share sensitive information. An attacker with sustained access to that inbox does not need to manufacture trust — they inherit it. Outbound emails sent from the compromised account to established contacts carry the executive's name, their signature, their historical communication patterns, and in many cases their actual writing style, observed and approximated over days or weeks of undetected access. Recipients have no reliable way to distinguish these messages from legitimate correspondence.

The domain reputation risk compounds this. When a compromised mailbox is used to send phishing campaigns or unsolicited bulk email to external contacts, receiving mail servers begin flagging the sending domain. Blacklist operators aggregate these reports. Once an organization's domain appears on a major blacklist, outbound email from every user in that organization — not just the compromised account — begins failing delivery. Client correspondence goes undelivered. Vendor communications stop reaching their destination. The operational disruption extends far beyond the compromised individual and creates a secondary incident that must be managed simultaneously with the original compromise.

The remediation path for this scenario differs critically depending on the mail platform involved. Organizations running on-premises mail infrastructure can address a blacklisting event by rotating their outbound IP address and submitting delisting requests directly to blacklist operators — a process that, when handled correctly, can restore mail flow within 24 to 48 hours. Organizations on Microsoft 365's Exchange Online or Google Workspace do not have that option. The sending infrastructure is shared and managed by the platform provider. Delisting requires working through Microsoft's or Google's own remediation processes, on their timeline, with no ability to accelerate by changing infrastructure. Organizations that discover this distinction during an active incident — rather than before one — find the constraint significantly more disruptive than anticipated.

The financial exposure from sustained, undetected access represents the most severe consequence. An attacker observing an executive mailbox over an extended period is not simply reading correspondence — they are mapping the organization's financial relationships, payment authorization patterns, vendor contacts, and communication conventions. When they act, the impersonation is not generic. It references real vendors, real transaction amounts, real approval chains, real language. Business email compromise executed from a position of observed, legitimate access is among the most difficult fraud vectors to detect at the moment it occurs. The FBI's Internet Crime Complaint Center consistently identifies BEC as one of the highest-dollar fraud categories reported annually — not because it is technologically sophisticated, but because it exploits human trust built over time through observed, legitimate communication patterns. By the time a wire transfer reaches a fraudulent account, the window for recovery is measured in hours.

---

## The Recovery Outcome

In the engagement documented here, the organization experienced zero service downtime. Email continuity was maintained throughout remediation. The compromised identity was retired cleanly, historical mailbox data was preserved and migrated to a newly provisioned secure identity, and phishing-resistant MFA was enrolled on the new account before it was handed off to the user.

The migration involved over 100,000 items across more than 30 GB of mailbox data. Inbox rules required manual export and re-import rather than automated migration — specifically to avoid carrying any attacker-planted automation into the clean environment. Each rule was inspected individually before migration. The migration app registration used to facilitate the transfer was scoped to minimum required permissions and deleted immediately upon confirmed completion. Active OAuth grants on a tenant post-engagement are an unnecessary residual risk.

Prompt detection was the variable that made this outcome achievable. The organization identified anomalous authentication behavior before the attacker had time to establish secondary persistence channels, conduct sustained contact impersonation, or map financial workflows. Organizations that do not detect the compromise until days or weeks later are managing a materially different — and more expensive — incident. The difference between those two outcomes is not luck. It is visibility.

---

## What This Means for Your Organization

AiTM attacks are not exotic. They are the predictable evolution of credential-based attacks against organizations that have deployed standard MFA but have not moved to phishing-resistant authentication methods. FIDO2 hardware security keys and certificate-based authentication defeat the AiTM proxy by cryptographically binding the authentication to the legitimate domain — the proxy cannot intercept what it cannot relay.

If your current MFA deployment relies on push notifications, SMS, or TOTP codes, your executive accounts are operating with authentication that a well-resourced attacker can bypass today. The question is not whether your MFA works. It is whether your MFA works against the attack vector currently targeting organizations at your size and sector.

Three questions are worth answering before an incident forces the conversation:

Do you have visibility into authenticator devices registered against your executive identities in Entra ID or your identity provider?

Does your incident response process include a mailbox audit — inbox rules, OAuth grants, external forwarding, delegate access — before any account remediation steps are taken?

And if your domain were blacklisted tomorrow, do you know what your mail flow restoration process looks like on Exchange Online or Google Workspace specifically?

If the answer to any of those is uncertain, that uncertainty is the finding.

---

## Go Deeper

[Module 04 of the Infrastructure Placement Framework](https://github.com/4thandBailey/infrastructure-placement-framework/blob/main/modules/04-cyber-resilience/aitm-credential-attack-vectors.md) covers AiTM phishing and public authentication endpoint abuse in full — including authentication architecture, incident response sequencing, mailbox governance, and vendor exit runbooks. The self-assessment is available at [framework.4thandbailey.com](https://framework.4thandbailey.com).

If your organization has experienced a credential-based incident or wants to evaluate its current authentication posture before one occurs, [schedule a guided assessment →](https://4nb.cloud/lmosley)

---

*The wire fraud and domain blacklisting sections of this Field Note speak directly to business leadership carrying technology risk on behalf of their organizations. If you are a CEO, COO, or board member trying to understand what a compromised executive account actually costs — before it happens — that conversation starts the same place. [Schedule a consultation →](https://4nb.cloud/lmosley)*
