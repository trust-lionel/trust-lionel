---
title: "Three Questions Every CEO and Board Should Be Able to Answer"
description: "Cyber resilience, AI governance, and business continuity — the three questions that determine whether an organization survives the next disruption."
date: 2026-05-17
author: Lionel Mosley
tags: [Cyber Resilience, AI Governance, BCDR]
og_image: "/og/three-questions.png"
featured: false
image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&q=75&auto=format&fit=crop"
image_alt: "Data center infrastructure — aerial view of server racks"
---

> *The conversations that matter most in a boardroom aren't about technology. They're about survival. And the technology questions executives can't answer are the ones that determine whether the business survives.*

## The Room I Keep Walking Into

I have spent over two decades walking into organizations — boardrooms, leadership meetings, budget conversations — where the technology discussion goes one of two ways.

Either the executives are overwhelmed and don't know where to begin. Or they believe they are covered because they pay for cloud services, have an IT team, and haven't experienced a major incident yet.

Both positions carry the same risk.

The organizations that are genuinely prepared are not the ones with the largest IT budgets. They are the ones where leadership — the CEO, the board, the CFO — can answer three specific questions clearly, with documented evidence, before a crisis begins.

Most cannot.

These three questions come directly from the [Infrastructure Placement Framework](https://framework.4thandbailey.com) — the open-source enterprise IT framework built and maintained by [4TH AND BAILEY](https://github.com/4thandBailey). They map to Modules 4, 5, and 8 of the framework. They are not technical questions. They are leadership questions — and the answers determine whether an organization survives what is coming.

---

## Question 1 — Can You Protect Your Data, Keep Operating, and Exit a Platform That Fails You?

This is the cyber resilience question. And it is not a firewall question.

On July 19, 2024, a routine security update from CrowdStrike caused 8.5 million Windows systems to crash globally. The damage exceeded $10 billion. Delta Airlines took five days to recover, losing over $500 million. There was no cyberattack. No malicious actor. No password failure. A trusted vendor made a routine change — and organizations that had not answered this question in advance paid for it in days of downtime and hundreds of millions in losses.

In February 2026, ransomware hit the University of Mississippi Medical Center. All 35 clinic locations closed statewide. Epic — one of the most widely deployed electronic health record platforms in the country — went offline. Surgeries were canceled. Chemotherapy appointments were canceled. Clinicians reverted to pen and paper. The FBI deployed on-site. Nine days of partial shutdown followed.

These two events share one thread: the organizations affected were not unprepared because they lacked technology. They were unprepared because they had never answered three foundational questions before the crisis began.

**The three questions every organization must answer in advance:**

**How do we protect our data?** Most organizations believe their data is protected because they pay for a cloud service. That belief is wrong. The vendor's responsibility ends at the platform boundary. Your data — how it is backed up, encrypted, versioned, and recoverable — is your responsibility, regardless of what the contract implies. UMMC ran Epic. Epic worked. The data protection architecture did not.

**How do we keep operating if a vendor goes offline?** Every IaaS, PaaS, and SaaS provider your organization depends on will experience an outage. The question is whether your organization has mapped critical functions, defined manual fallbacks, established RTO and RPO targets per system, and tested those targets. Only 22% of healthcare organizations fully recovered from a ransomware attack in less than a week. Nearly 40% took more than a month. Recovery speed correlates directly with the quality of preparation.

**How do we move our data if a platform stops serving us?** Vendor lock-in accumulates quietly. Data formats only one platform reads. Integrations built on proprietary APIs. Contracts with no portability clause. These combine to make exit prohibitively expensive at the moment it becomes necessary. The time to build a vendor exit runbook is before you need one.

If your organization cannot answer all three questions with documented, tested evidence — [Module 4 of the Infrastructure Placement Framework](https://github.com/4thandBailey/infrastructure-placement-framework/blob/main/modules/04-cyber-resilience/README.md) is the structured starting point.

---

## Question 2 — Do You Know What Data Your Employees Have Already Put Into AI Systems?

This is the AI governance question. And for most organizations, the honest answer is no.

AI is now embedded in virtually every productivity tool employees use daily — Microsoft 365 Copilot, Google Gemini, Salesforce Einstein, GitHub Copilot, and hundreds of other tools with AI features enabled by default. Employees are not waiting for IT policy. They are using these tools right now, in every department, across every level of the organization.

The question is not whether it is happening. The question is what data has already been exposed — and whether any of it creates regulatory, legal, or competitive liability.

Shadow AI — employees using unapproved AI tools without oversight — is present in virtually every organization. Client data entered into public AI systems. Proprietary processes described in chat prompts. Legal strategy, financial projections, and personnel decisions processed through tools whose data handling policies most organizations have never reviewed.

The regulatory environment is catching up. NIST AI RMF 1.0, NIST AI 600-1 (the Generative AI Profile), and NIST IR 8596 (the Cyber AI Profile, released December 2025) have established the standards framework. Regulators across healthcare, financial services, and legal are beginning to enforce it. Most organizations have no policy, no inventory, and no idea what data has already entered public AI systems through employee usage.

This is not a technology problem. It is a governance problem — and it sits on the CEO's desk whether the CEO knows it yet or not.

**Three things every organization needs before the end of this quarter:**

A **shadow AI audit** that identifies which AI tools are in use, by whom, and what categories of data have been processed through them.

An **AI acceptable use policy** that defines approved tools, prohibited data types, and accountability — in plain language every employee can follow.

An **AI vendor evaluation rubric** that assesses every AI tool against data handling, security, and compliance standards before it is adopted organizationally.

[Module 5 of the Infrastructure Placement Framework](https://github.com/4thandBailey/infrastructure-placement-framework/blob/main/modules/05-ai-governance/README.md) delivers all three — built on NIST standards, structured for both large enterprises protecting IP and SMBs building AI governance from a standing start.

---

## Question 3 — When Something Goes Wrong, Exactly How Does Your Organization Recover?

This is the business continuity question. And the emphasis is on the word *exactly*.

Not "we have a plan." Not "IT handles that." Not "we back everything up."

Exactly how. In what order. By whom. How fast. And when did you last test it?

The data on this is unambiguous and sobering:

- **76%** of organizations needed more than 100 days to fully recover from a cyberattack (IBM Cost of a Data Breach Report, 2025)
- **40%** of small businesses never reopen after a major disaster (FEMA)
- **25%** of those that do reopen fail within one year (FEMA)
- **44%** of data breaches in 2025 involved ransomware (Verizon DBIR 2025)

The gap between having a plan on paper and having a plan that works is measured in days of downtime — and in whether the business survives.

Most organizations have a version of a disaster recovery plan. Almost none have a genuine business continuity plan. These are not the same document.

A **Business Continuity Plan** is strategic. It keeps the entire organization operating across all functions during and after any disruption — people, processes, communications, alternate work locations, manual workarounds for every critical function.

A **Disaster Recovery Plan** is tactical. It restores IT systems, data, and infrastructure after a technical failure. It is a component of the BCP — not a replacement for it.

Every plan must explicitly address six scenarios: ransomware attack, data breach and exfiltration, third-party vendor failure, natural disaster, insider threat and accidental data loss, and supply chain compromise. And every plan must be tested — not reviewed, not updated, but *tested* — against those scenarios before the crisis arrives.

**The plan that has never been tested is not a plan.**

[Module 8 of the Infrastructure Placement Framework](https://github.com/4thandBailey/infrastructure-placement-framework/blob/main/modules/08-bcdr/README.md) provides the complete BCDR structure — business impact analysis, BCP and DRP templates, ransomware playbook, breach notification guide, vendor failure playbook, backup validation checklist, and tabletop exercise scripts for all six scenarios.

---

## Where to Begin

These three questions are not the full picture of enterprise IT governance. But they are the three that cannot wait — because the cost of being unprepared is measured in business survival, not inconvenience.

The [Infrastructure Placement Framework](https://framework.4thandbailey.com) is open source, vendor-neutral, and free to use under Creative Commons Attribution 4.0. It was built by [4TH AND BAILEY](https://4thandbailey.com) for the organizations that have outgrown commodity IT and need structured, documented guidance to make decisions that hold up under financial, regulatory, and operational scrutiny.

**Three ways to engage:**

**Self-assessment.** Fork the repository at [github.com/4thandBailey/infrastructure-placement-framework](https://github.com/4thandBailey/infrastructure-placement-framework) and work through the modules relevant to your situation. No cost, no commitment, no sales call required.

**Guided assessment.** Open a GitHub Issue using the assessment request template, or start a conversation directly at [4thandbailey.com/contact](https://4thandbailey.com/contact). Most guided assessments identify three to five immediately actionable findings.

**Full engagement.** 4TH AND BAILEY designs, builds, and deploys the infrastructure changes, governance structures, security controls, and policy frameworks the assessment identifies — from cloud migration to NIST-aligned AI governance programmes.

---

## The Takeaway

The executives who survive the next major incident — whether it is a ransomware attack, an AI governance failure, or a vendor outage — will not be the ones who had the best technology. They will be the ones who asked the right questions before the crisis began, documented the answers, tested the plans, and built organizations capable of withstanding the pressure.

These three questions are where that starts.

*"I've spent my career asking 'what if' when everyone else was asking 'how much.'"*

The 'what if' is no longer hypothetical. The question is whether your organization is ready for it.
