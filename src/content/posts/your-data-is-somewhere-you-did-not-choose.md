---
title: "Your Data Is Somewhere Your Organization Did Not Choose"
description: "When business data ends up on personal infrastructure — cloud storage, external drives, or a personal AI subscription — the organization loses administrative control before it knows the decision was made. The ownership question that follows has no clean answer without legal counsel and a governance framework that predates the incident."
pubDate: 2026-09-10
author: "Lionel Mosley"
tags: ["Shadow IT", "Data Governance", "IT Risk", "SaaS", "Workload Placement", "AI Governance", "Business Continuity", "Cloud Storage", "Acceptable Use Policy", "Employee Handbook", "Cyber Insurance", "BYOD", "End-User Device"]
cover: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=1400&q=80&auto=format&fit=crop"
ogImage: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=1400&q=80&auto=format&fit=crop"
spotifyPlaylistId: "37i9dQZF1EIhmXwY1VouXP"
postType: "coverTop"
authorUrl: "https://about.lionelmosley.com"
---

*Field Notes — IT Director*

---

When business data ends up on personal infrastructure, most organizations focus on the employee who put it there — and miss the governance failure that made it possible. The behavior was deliberate, the access was revoked intentionally, and the organizational impact was foreseeable to anyone who understood what they had built. Writing a termination letter, filing a police report, and calling an attorney are all appropriate responses to that behavior — and none of them recover the data, restore the integration, or prevent the next person from making the same decision.

Because the employee problem and the governance failure are not the same problem. The employee who created the unauthorized account made a choice. The organization that had no handbook language prohibiting it, no provisioning standard requiring organizational credentials, no device ownership model defining which hardware is authorized to handle business data, and no enforcement record predating the incident created the conditions in which that choice was available, undetected, and consequential. Both things are true simultaneously. Addressing only the employee leaves the governance failure intact. Addressing only the governance failure does not account for the deliberate nature of what occurred.

This post addresses both — because an organization that fixes only one of them will encounter the other again.

---

## When You Own the Data but Cannot Reach It

Before examining what happens inside an organization, consider what happens when the governance gap exists between organizations.

In March 2026, Nine PBS — the public television station in St. Louis — discovered it had been cut off from more than 50 terabytes of archival material spanning over 70 years of programming history. Nine PBS had a direct contract with Iron Mountain Data Centers for physical infrastructure at a facility in Denver. Iron Mountain had a separate contract with Open Source Storage, a cloud storage provider that operated servers inside that facility. Nine PBS had no contractual relationship with Open Source Storage — none. When Open Source Storage went defunct and cut off access on the day the contract expired, Nine PBS had no agreement with the company operating the servers that held its data, no leverage over that company's hardware, and no administrative path to retrieve what it owned.

Iron Mountain's position was legally sound: its contract was with Open Source Storage, not Nine PBS. The servers belonged to OSS. Granting access without a court order would have breached Iron Mountain's own contractual obligations to its customer and potentially exposed other OSS clients' data stored on the same infrastructure.

Nine PBS owned the data. A court ultimately confirmed it. But establishing a retrieval path required litigation across two jurisdictions — St. Louis Circuit Court and Denver District Court — before a framework for recovery was ordered. As of late August 2026, a final order had not yet been issued.

Nine PBS is not a small organization with an immature IT function. They had a contract. They had a direct relationship with a named, reputable vendor. What they did not have was visibility into who their vendor subcontracted with to deliver the service, under what terms, or what rights that subcontractor held over the infrastructure when the primary relationship failed.

That gap — between owning data and being able to access it — is the governance problem this post is about. The Nine PBS scenario involves two separate organizations and a defunct vendor. The scenario described in the rest of this post involves one organization and an employee who is still reachable by phone. The legal complexity is different. The governance failure is identical.

---

## The Scenario That Surfaces the Gap Inside Your Organization

An employee is assigned to improve a business process and increase efficiency. They have technical skills. They have latitude. And they have access to tools outside the organization's licensed stack that are faster to provision than filing a ticket with the IT Team.

Rather than working within the approved tech stack, they create personal accounts using Software-as-a-Service (SaaS) platforms or cloud solutions — registering those accounts with their personal email address and personal phone number as recovery credentials, and configuring Multi-Factor Authentication using a personal authenticator app on a personal device. Or they move business data to personal hardware — external hard disk drives or flash drives — that the organization does not own, does not manage, and cannot audit. They build an automation that connects the organization's existing SaaS solution to this personal infrastructure. They save every file, credential, and configuration associated with the project there.

The process works. Efficiency improves. No one in IT was involved. No one in leadership knew the infrastructure existed.

What the organization also does not have is a documented End-User Device and BYOD strategy. BYOD — Bring Your Own Device — is not a default condition. It is an organizational decision: a sanctioned ownership model with defined governance, Mobile Device Management (MDM) enrollment, and explicit data handling controls. **[Module 06 of the Infrastructure Placement Framework — End-User Device and BYOD Strategy](https://framework.4thandbailey.com/modules/modules/06-device-byod/)** defines four device ownership models — BYOD, CYOD, COPE, and COBO — and produces a device ownership matrix by role, an MDM platform recommendation, and a BYOD security policy ready to customize. It also addresses what the module identifies as the fastest-growing shadow AI vector in 2026: employees using AI tools on personal devices to process work data, without the organization's knowledge, under terms the organization never agreed to.

When no ownership model has been defined and no device policy has been written, an employee who moves business data to a personal external drive or flash drive is not violating a BYOD policy. There is no BYOD policy to violate. The gap is the governance that should have existed before the first file left the approved environment.

When the employee is terminated, they change the password and revoke access in retaliation. The automation stops. The data is inaccessible. The SaaS integration — authenticated against credentials the organization never controlled — fails. And the organization has no administrative relationship with the platform, device, or account that holds its data, because none of it was ever theirs to administer.

This scenario is not unique to any cloud storage provider, any device type, or any SaaS platform. It is not unique to any industry. It is not unique to any organization size. The infrastructure is interchangeable. The governance gap is universal.

---

## The Personal AI Subscription Vector

Every scenario described above has a recoverable analog — litigation, platform account recovery, device retrieval. The personal AI subscription with API access to organizational systems is different, and it warrants its own section before examining the vectors that most policies already address.

An employee with a personal ChatGPT Plus, Claude Pro, or Gemini Advanced subscription can use that subscription's API to connect directly to organizational systems — CRMs, ticketing platforms, project management tools, internal databases — and build automations that process business data through a personal AI account. This requires only an API key, a personal subscription, and technical knowledge. It leaves no footprint in IT-managed systems. It does not appear in a software asset inventory. It does not trigger a procurement approval. And it does not terminate when the employee does.

The processing happens under the employee's personal subscription terms. Depending on the provider and the subscription tier, those terms may permit the provider to use inputs for model improvement, retain data for extended periods, or make data accessible to provider personnel for safety review. The organization has no visibility into what was sent, no audit trail, no ability to request deletion under a Data Processing Agreement it never signed, and no administrative path to the account when the employee leaves.

The integration risk compounds the data risk. An API key generated under a personal subscription does not automatically expire at termination. If the key remains active — and it will, unless someone knows to look for it and revoke it — the connection between the former employee's AI account and the organization's production systems continues to exist after the termination date. What that connection processed, and when, is an audit finding with potential legal and regulatory consequences.

Module 06 of the Infrastructure Placement Framework identifies AI tools on personal devices as the fastest-growing shadow AI vector in 2026 — integrated directly with **[Module 05 — AI Governance and NIST Alignment](https://framework.4thandbailey.com/modules/modules/05-ai-governance/)**. The shadow AI audit in Module 05 — covering DNS query log review, OAuth and app consent audits, and browser extension inventory — is the discovery mechanism for this vector specifically. Most organizations that run this audit for the first time find active connections they did not know existed.

This is the vector that does not appear on most acceptable use policies, is not covered by most offboarding checklists, and is not visible to most IT security tooling. A BYOD device policy that does not explicitly address which AI tools are permitted on devices that access corporate data has not addressed this vector. The policy must name it directly.

---

## The Vectors the Policy Must Name Explicitly

A policy that addresses only "company equipment" or "company systems" without naming specific categories of unauthorized infrastructure leaves the door open. Employees who use personal platforms are not always acting with malicious intent — many genuinely do not know the behavior is prohibited because no one told them directly. The policy must be specific enough that there is no reasonable claim of ambiguity.

**Personal cloud storage.** Google Drive, Box, Dropbox, and iCloud Drive are all free to provision with a personal email address. Any of them can become the de facto storage layer for a business process without IT's knowledge. The data in those accounts is not recoverable through administrative tools the organization controls, because the organization has no administrative relationship with the account.

**External hard drives and flash drives.** Personal portable storage is invisible to IT asset management, does not appear in a DLP audit, and does not trigger an access log. When the employee walks out the door, it walks with them. The organization has no technical path to that data and no administrative leverage over the device that holds it.

**Personal SaaS subscriptions.** Box, Notion, Airtable, and dozens of other productivity platforms offer free or low-cost personal tiers. An employee who uses a personal subscription to manage a business workflow has created a data residency outside the organization's control — with terms of service the organization never agreed to and data handling policies it never reviewed.

**Personal AI subscriptions with API access.** Addressed in the section above. This vector belongs in every acceptable use policy written or updated after 2024. If it is not named explicitly, it is not covered.

---

## The Workload Placement Decision the Organization Never Made

Every one of these vectors is the result of a workload placement decision the organization never made.

**[Module 01 of the Infrastructure Placement Framework — Workload Placement Assessment](https://framework.4thandbailey.com/modules/modules/01-workload-placement/)** scores every workload across five dimensions: cost gravity, latency and performance tolerance, compliance and data sovereignty, private AI infrastructure fit, and vendor lock-in and licensing risk. The output is a placement recommendation and an Architecture Decision Record that documents who made the placement decision, on what basis, and when.

When a business process is built on personal infrastructure, the organization has implicitly answered all five of those dimensions — by default, without analysis, and without documentation. Cost gravity was ignored because the tool was free. Data sovereignty was not considered because no one asked. Vendor lock-in risk was not evaluated because no one knew the vendor relationship existed. The compliance posture was never assessed because no one in IT or Legal was in the room.

The placement decision was made by one individual, in the background, for reasons of convenience — and the organization carries every consequence of that decision without having made it.

---

## The Handbook Is the First Line of Defense

This scenario should not be addressed at termination. It should not be addressed in an IT offboarding checklist. It should be addressed in the employee handbook — before the employee's first day, before the first project is assigned, and before the first file is saved anywhere.

An employee handbook or policy manual that does not explicitly address the use of personal accounts, personal devices, and personal cloud storage for business purposes has a gap that costs nothing to close in writing and can cost significantly to discover in litigation.

The policy must be explicit, not implied. Employees should not be left to infer that storing organizational data in a personal Dropbox account is unauthorized, or that connecting a personal AI subscription to a production system via API is a policy violation. Both must be stated directly — that the creation or use of personal accounts for business purposes is prohibited, that organizational data may only reside on organizationally owned and administered infrastructure, and that violations carry documented ramifications.

**The ramifications matter as much as the prohibition.** A policy without consequences is guidance. The handbook must make clear what disciplinary action follows a violation — and that action must be applied consistently. An organization that documents the prohibition but does not enforce it has created a paper defense that dissolves the moment an attorney examines the employment record of the last person who did the same thing without consequence.

**The policy must also address account ownership at provisioning.** Any account created for a business purpose — cloud storage, automation platform, AI subscription, SaaS integration, API credential — must be provisioned with an organizational email address, registered to organizational recovery credentials, and administered by IT. This is not a preference. It is a requirement that must be written, signed, and enforceable.

When the policy exists, is documented, is signed at onboarding, and carries enforced ramifications, the scenario described in this post does not reach the termination stage. It is prevented at provisioning — or it is a documented policy violation with a documented response, rather than an organizational crisis with no governance trail.

---

## The Ownership Question Legal Counsel Needs to Answer Before the Incident

Here is the question that most organizations have not resolved, and that no policy document or IT governance framework can answer on its own:

**If an employee creates a personal account during work hours, on employer-issued equipment, and uses that account exclusively to store and process data relevant to the employer's business operations — who owns the account, and who owns the data inside it?**

The intuitive answer is that the employer owns the data. Most employment attorneys would argue that data created in the course of employment, for the purpose of advancing the employer's business, belongs to the employer — and that an employment agreement with appropriately drafted intellectual property and confidentiality provisions would support that position.

But the account is a separate question. The account was registered to the employee's personal email address. The recovery credentials are the employee's personal phone number. The MFA device is the employee's personal property. From the platform's perspective — whether that platform is Google, Dropbox, Box, or an AI provider — the account belongs to whoever registered it and controls the recovery credentials. The platform has no obligation to honor an employer's claim to an account it never administered.

This creates a gap between what the employer may legally be entitled to and what the employer can practically access. The data may belong to the organization under employment law. The account that holds it may be unreachable through any technical or administrative path the organization controls.

That gap is not closed by an IT policy. It is not closed by a termination letter. It is not closed by a police report. It is potentially closed by litigation — which is expensive, slow, and does not guarantee recovery. Nine PBS had a direct contract with Iron Mountain and still required proceedings in two courts before a retrieval path was established. An organization pursuing data held in a former employee's personal account is starting with less legal standing, not more.

**The only moment this question has a clean answer is before the account is created** — when the organization's acceptable use policy, technology governance standards, and employment agreement make clear that business data may only be stored on organizationally owned and administered infrastructure, and that any account created for business purposes must be provisioned with organizational credentials and registered to an organizational email address.

That policy does not exist in most organizations. And without it, the ownership question remains open — at exactly the moment when the cost of it being open is highest.

---

## The Cyber Insurance Implication

This is the conversation most technology governance discussions do not reach — and it is the one that moves the fastest in a boardroom.

Cyber insurers are increasingly scrutinizing acceptable use policies, shadow IT controls, and AI governance practices as part of underwriting. An organization that cannot produce a documented, signed, enforced policy prohibiting unauthorized data placement — personal cloud storage, personal AI subscriptions, personal SaaS tiers, personal portable storage — may face material questions at the underwriting stage, at renewal, or at the point of a claim.

If an incident arises directly from an employee placing organizational data on personal infrastructure — data that was then exfiltrated, held inaccessible, or processed under unauthorized AI terms — and the organization cannot demonstrate that a policy prohibiting that behavior existed, was signed, and was enforced prior to the incident, the insurer has a basis to contest coverage. The policy gap is not incidental to the claim. It is the claim.

**For the CIO:** this is a board-level risk item. The absence of a documented, enforced acceptable use policy covering personal accounts, personal devices, and personal AI subscriptions is a cyber insurance underwriting exposure that belongs in the next technology risk review — not as an IT agenda item, but as a financial risk item with a specific dollar amount attached to the coverage question.

**For Finance and Procurement:** the cost of drafting, implementing, and enforcing the policy is a fraction of the deductible on a contested cyber insurance claim. This is a cost-of-governance conversation, not a cost-of-technology conversation. The licensed stack the organization already pays for is the answer to most of the infrastructure vectors described in this post. The governance layer that ensures employees use it is the gap.

**For the InfoSec Officer:** the shadow AI audit is the instrument that surfaces the API connections, OAuth grants, and browser extensions that bypass your existing controls. The audit is not a one-time exercise — it is a recurring discovery cadence that keeps the gap between what IT administers and what employees actually use as narrow as possible. An insurer asking whether you have a shadow IT discovery program is asking whether you know what you do not know.

**For the IT Director:** the provisioning standard is the enforcement layer. If every account created for a business purpose must be provisioned through IT — with organizational credentials, organizational recovery options, and organizational MFA — and every device authorized to handle business data must be enrolled in MDM under a defined ownership model, the personal account and personal device problem is addressed at the point of creation, not discovered at the point of termination. Both standards must predate the hire.

**For the Owner, CEO, or Operator:** the question is not whether your IT provider or internal IT team is capable of managing this. The question is whether they have been explicitly directed to. A technically capable employee assigned to improve a business process will reach for the tools they know — unless the policy makes clear which tools are authorized, which devices are permitted, who provisions them, and what happens when that boundary is crossed. That direction comes from leadership, not from IT. It belongs in the handbook your employees sign before their first day of work.

---

## The Offboarding Checklist Is the Wrong Conversation

Standard offboarding procedures address the accounts IT provisioned: the licensed platform credentials, the VPN access, the payroll system login, the physical access badge. When those are the only accounts that exist, the checklist is sufficient.

The problem is not what the offboarding checklist is missing. The problem is that the scenario requiring an expanded checklist should never have occurred. If the policy was in place, enforced, and signed at onboarding, there are no personal accounts to discover at termination. There is no personal cloud storage to audit. There is no personal AI subscription to trace. There is no external hard drive or flash drive to account for. There is no unmanaged device to inventory. The offboarding checklist covers what IT provisioned and what MDM enrolled — because those are the only accounts and devices that should exist.

An organization asking what to add to its offboarding checklist to prevent this scenario is asking the right question at the wrong stage. The checklist is a compliance verification step — a confirmation that the policy was followed. It is not a remediation tool for a policy that was never written.

If the question is "how do we find the personal accounts and personal devices at termination," the answer is that the discovery is too late, the leverage is gone, and the outcome is litigation or loss. If the question is "how do we ensure personal accounts are never created and personal devices are never used for business purposes in the first place," the answer is the employee handbook, the acceptable use policy, the device ownership model, the enforcement record, and the IT provisioning standard — all of which must predate the hire, not the incident.

---

## Three Questions That Need Documented Answers Before the Next Project Starts

**1. Does your organization's employee handbook explicitly prohibit the creation or use of personal accounts — cloud storage, SaaS subscriptions, AI tools, API credentials, and personal portable storage — for business purposes, and does your organization have a documented End-User Device and BYOD strategy that defines which devices are authorized to handle business data, under what ownership model, with what MDM controls in place?**

A policy that exists but is not enforced is not a defense. It is evidence that the organization knew the behavior was a risk and chose not to address it. If the last person who violated this policy faced no documented consequence, the policy has no standing. A device strategy that has never been written means the first employee who moves business data to a personal flash drive is operating in a governance vacuum the organization created.

**2. Has your organization's legal counsel reviewed your employment agreements, acceptable use policy, and technology governance standards specifically to address the question of data and account ownership when an employee uses personal infrastructure — including personal AI subscriptions with API access to production systems — for business purposes?**

This is not a question IT can answer. It requires legal review, jurisdiction-specific analysis, and contractual language drafted before a dispute arises. Nine PBS had a direct contract with Iron Mountain and still required proceedings in two courts before a retrieval path was established. An organization pursuing data held in a former employee's personal account, on a personal device, or processed through a personal AI subscription is starting with less legal standing, not more. The cost of the legal review is predictable. The cost of the litigation is not.

**3. If your cyber insurer asked today whether your organization has a documented, signed, and enforced acceptable use policy covering personal cloud storage, personal SaaS subscriptions, personal AI tools, and personal portable storage — and whether you have a documented device ownership strategy and a shadow IT discovery program that runs on a recurring basis — what would your answer be, and what evidence could you produce to support it?**

If the honest answer is that the policy exists but has not been enforced, or that the shadow IT audit has never been run, or that personal AI subscriptions and personal portable storage were not addressed because the policy was written before either became a routine workplace vector — that gap is not hypothetical. It is a documented underwriting exposure sitting inside your current cyber insurance policy. The time to close it is before a claim requires you to explain why it was open.

---

The employee who locked the account is not the problem. The employee who locked the account is the outcome. The problem is the absence of policy that should have made the account's existence a violation before the first file was saved — documented in the handbook, signed at onboarding, enforced without exception, and never discovered at termination because it was never permitted to begin.

Nine PBS knew their vendor. They had a contract. They still spent months in litigation across two courts to establish a path to data they owned. Your organization's exposure to an employee who created an unauthorized account, moved data to a personal device, or connected a personal AI subscription to a production system is not smaller than that. It is less visible — until the account is locked, the drive walks out the door, and the data is gone.

The placement decision was made the moment the employee opened a personal account or moved the first file to a personal device for business use. The organization just did not know it had been made.

<a href="https://calendly.com/4thandbailey/it-risk-assessment"
style="display:inline-block;background-color:#0088cc;color:#ffffff;padding:12px 24px;font-weight:600;border-radius:6px;text-decoration:none;">
→ Book the IT Risk Assessment
</a>

or ask the terminal at [about.lionelmosley.com](https://about.lionelmosley.com) what a risk assessment covers before you commit to the call.
