---
title: "From Policy Fluency to NIST Alignment: A Practitioner's Framework for AI Governance"
description: "Julia Bersin identified the AI governance competency gap. Here is the infrastructure methodology that closes it — from shadow AI discovery to NIST AI RMF maturity scoring."
pubDate: 2026-08-27
author: "Lionel Mosley"
tags: ["AI Governance", "NIST", "Field Notes", "Cybersecurity", "IT Infrastructure", "Cloud Migration", "CIO"]
cover: "https://images.unsplash.com/photo-1675865254433-6ba341f0f00b?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
ogImage: "https://images.unsplash.com/photo-1675865254433-6ba341f0f00b?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
spotifyPlaylistId: "37i9dQZF1EIgEVwxTSO0hO"
postType: "coverTop"
citationName: "Infrastructure Placement Framework"
citationUrl: "https://framework.4thandbailey.com"
citationCreator: "4TH AND BAILEY"
---

*Field Notes — AI Governance*

---

Most organizations have an AI tool problem they are calling an AI training problem. They are sending managers to workshops on responsible AI use. They are publishing principles statements. They are asking HR to own the governance conversation. None of that addresses the actual gap — which is not a competency gap sitting above the infrastructure. It is an infrastructure gap that makes the competency impossible to develop.

On April 7, 2026, Julia Bersin, Director of Research at The Josh Bersin Company, published an interview with Freshworks in which she named this problem more precisely than most. She called the missing competency "policy fluency" — the ability of managers to understand what AI tools are doing, where they are sourcing data, how to manage ethical guardrails, and how to translate governance requirements to the teams responsible for executing them. She was writing from an organizational research perspective, not an infrastructure governance perspective. The gap she identified is real. What she did not provide is a methodology for closing it.

This post is that methodology.

---

## 1. What policy fluency actually requires — in infrastructure terms

Bersin's definition of policy fluency covers four specific competencies: understanding what the AI tool is doing, knowing where it sources its information, managing ethical concerns and guardrails, and translating those governance requirements to teams in plain language.

In HR and organizational research terms, that reads as a training and management challenge. In infrastructure and IT governance terms, it reads as something more specific: a set of documented controls, scored assessments, and architectural decisions that either exist or do not exist in your environment.

A manager cannot communicate governance boundaries that have not been documented. A CIO cannot translate policy fluency to their teams if the organization has no approved tool list, no data classification policy, no vendor evaluation on record, and no maturity baseline against which to measure progress. Policy fluency is not a competency you develop through training alone. It is a competency that becomes possible when the governance infrastructure beneath it is in place.

Most organizations do not have that infrastructure. That is the actual problem.

---

## 2. The accountability gap Bersin identified — and where it actually lives

Bersin's central argument is that AI agents are tools, not employees, and that the failure to assign clear ownership for those tools creates accountability gaps. Who owns the output? Who owns the failure? Who is responsible when an AI tool processes data it was never authorized to touch?

These are not people management questions. They are infrastructure governance questions — and they live in three distinct layers that most organizations have never examined simultaneously.

**The placement layer.** Before a CIO can govern an AI workload, that workload needs a documented placement decision. **[Module 01 of the Infrastructure Placement Framework](https://framework.4thandbailey.com)** — Workload Placement Assessment — scores every workload across five dimensions: cost gravity, latency and performance tolerance, compliance and data sovereignty, private AI infrastructure fit, and vendor lock-in and licensing risk. The output is a placement recommendation and a completed Architecture Decision Record. When an AI workload processing sensitive data in a public cloud environment is later audited, the ADR shows who made the placement decision, on what scored basis, and when. That is accountability made traceable.

The Private AI Infrastructure Fit dimension — weighted at 15% of the composite placement score — asks explicitly whether AI processing of sensitive data requires private infrastructure rather than public cloud. Most organizations have never asked this question in a structured, documented way. They have made the decision implicitly, by default, when they accepted the terms of a SaaS subscription.

**The resilience layer.** Bersin's article does not address what a policy-fluent organization needs to know about what happens when AI systems fail, go offline, or are compromised. That omission matters. **[Module 04 — Cyber Resilience and Business Continuity](https://framework.4thandbailey.com)** closes it with three questions every organization needs documented answers to before a crisis: how do we protect our data, how do we keep operating if a vendor goes offline, and how do we move our data if a platform stops serving us?

On July 19, 2024, a routine CrowdStrike security update caused 8.5 million Windows systems to crash globally. The damage exceeded $10 billion. Delta Airlines took five days to recover. This was not a cyberattack. It was a trusted vendor making a routine change. In February 2026, a ransomware attack on the University of Mississippi Medical Center forced the closure of all 35 clinic locations statewide, took Epic offline, and canceled surgeries and chemotherapy appointments for nine days.

Neither of these organizations failed at policy fluency. They failed at resilience planning — the layer beneath the policy that determines whether governance is operational or performative. An organization that has policy fluency but no tested incident response plan, no vendor exit runbooks, and no operational continuity procedures has documentation without infrastructure. When the vendor fails, the documentation does not help.

**The governance layer.** This is where Bersin's policy fluency argument lands most directly — and where **[Module 05 — AI Governance and NIST Alignment](https://framework.4thandbailey.com)** provides the most complete response. The module opens with a question that most organizations cannot answer with documented evidence: does your organization have a defensible, standards-based framework for how AI is used, what data enters AI systems, and who is accountable for AI decisions?

The module produces six concrete outputs: a shadow AI audit with risk register, an AI data classification policy, a vendor evaluation rubric, an acceptable use policy ready to customize and adopt, a NIST AI RMF scored assessment, and a NIST standards crosswalk that maps every governance artifact to the governing standard. Each output addresses a specific component of the policy fluency gap Bersin identified.

---

## 3. Shadow AI is where policy fluency breaks down first

In 2023, Samsung engineers pasted proprietary source code into ChatGPT while debugging a semiconductor database. The data entered a public AI model. It could not be retrieved. Samsung responded by banning generative AI tools on company devices entirely — a blunt instrument that addressed the symptom without building the governance infrastructure that prevents the next exposure.

That incident is not unusual. It is documented. Most shadow AI exposure events are not — because most organizations do not have the discovery capability to know they occurred.

Shadow AI — employees using unapproved AI tools without IT oversight — is present in virtually every organization. Bersin's article notes that anyone in an organization can now manage an AI agent — which means anyone already is, whether IT knows about it or not. The question is not whether it is happening. It is what data has already been exposed and whether any of it creates regulatory liability.

The Shadow AI Audit Checklist in Module 05 is the discovery instrument that answers this question systematically. DNS query log review, web proxy and firewall log review, OAuth and app consent audit, employee survey, SaaS discovery tool review, browser extension inventory — these are the methods that surface what is actually running in an environment, not what IT believes is running. The output is a risk register that maps each identified tool to the data it accessed, the regulatory risk it created, and the remediation action required.

A manager cannot be fluent in policies governing tools they do not know are in use. A CIO cannot translate governance requirements to teams operating with tools that are invisible to the governance framework. The audit makes the invisible visible — which is the prerequisite for everything that follows.

---

## 4. The vendor evaluation question Finance and Procurement is not asking

Bersin's definition of policy fluency includes knowing where AI is sourcing its information and managing data integrity concerns. In organizational research terms, this is a training objective. In Finance and Procurement terms, it is a contract question that should be asked before a tool is approved — not after the data has already entered it.

The AI Vendor Evaluation Rubric in Module 05 is a 37-point scored rubric across four sections: data handling and training, security and compliance, transparency and explainability, and portability and exit. The data handling section asks the specific questions Bersin's policy fluency framework requires: does the vendor use customer inputs to train its models by default? Can customers opt out? Is a Data Processing Agreement available? Are data retention periods contractually committed?

The portability and exit section is the procurement question that almost never gets asked before a tool is approved: can all data be exported, is there a documented off-boarding process, and are open formats used? Vendor lock-in in AI tools accumulates the same way it accumulates in any SaaS platform — quietly, through data formats and proprietary APIs, until exit becomes prohibitively expensive at the moment it becomes necessary.

The approval thresholds are explicit: a score of 30–37 approves the tool, 22–29 is conditional approval with documented accepted risks, 14–21 is defer pending additional information, below 14 is do not approve. Every approved AI tool evaluated through this rubric before procurement gives Finance and Procurement a documented, dated record of the data integrity assessment. Every approved tool that was never evaluated is an undocumented liability — a vendor relationship where the data handling terms were never formally reviewed against organizational risk tolerance.

---

## 5. Making policy fluency measurable — the NIST AI RMF scored assessment and crosswalk

The most consequential gap in Bersin's article is that policy fluency, as she defines it, is not measurable. You either have it or you do not. There is no score, no maturity level, no gap analysis, and no roadmap from where you are to where you need to be.

The NIST AI RMF Scored Assessment in Module 05 closes that gap directly. Based on NIST AI Risk Management Framework 1.0 (2023), the assessment scores organizational AI governance maturity across four functions — Govern, Map, Measure, and Manage — on a 100-point scale, with five defined maturity levels from Initial (0–24) to Optimising (90–100).

The Govern function scores whether AI governance ownership is assigned to a named individual, whether AI policies are documented and approved, whether roles and responsibilities are defined, and whether AI governance is integrated into existing risk management processes. A CIO whose organization scores below 25 on the Govern function does not have a policy fluency problem — they have a governance infrastructure problem that makes policy fluency impossible.

The Map function scores whether an inventory of AI tools in use is maintained, whether AI use cases are documented with intended purpose and affected users, whether data inputs are identified and classified, and whether third-party AI tools are included in vendor risk management. This is the structured answer to Bersin's "where is the AI sourcing its information" question — not as a competency to be trained, but as a set of documented controls to be scored and gap-analyzed.

The assessment produces a priority gaps table with recommended actions and target dates. Alongside it, the NIST Standards Crosswalk maps every Module 05 governance artifact to the governing NIST standard — NIST AI RMF 1.0, NIST AI 600-1 Generative AI Profile (July 2024), NIST CSF 2.0, and NIST IR 8596 Cyber AI Profile (December 2025). This is the document that makes governance auditable. When a board, an insurer, or a regulator asks how your AI governance maps to NIST standards, the crosswalk is the answer — not a slide deck, but a documented artifact that maps every control to the standard it satisfies.

Together, the scored assessment and the crosswalk give a CIO two things Bersin's policy fluency framework does not: a measurable current state, and a defensible compliance posture.

---

## 6. The 90-day path from shadow AI to governed adoption

Most organizations that attempt AI governance start top-down — a policy statement from leadership, a mandate to comply, and little clarity on what compliance actually requires. Bersin's research identifies why this fails: the best AI use cases are emerging from the front lines, not from leadership. Top-down transformation misses the full potential and generates resistance rather than adoption.

The organizations that get this right — Bersin cites CarGurus' "AI Forward" group as an example — create structured environments for experimentation: workshops, AI jams, and community spaces where employees build AI skills and confidence with guardrails already in place. The governance comes first. The empowerment follows from it.

The SMB AI Readiness Programme in Module 05 is the operational implementation of exactly this sequence, structured for organizations that do not have a dedicated AI governance team or a large compliance budget. Four phases over 90 days:

**Phase 1 — Discover (Weeks 1–3).** Complete the shadow AI audit. Run the DNS and proxy log review. Survey employees about current AI tool usage. Understand what is already happening before imposing controls. This phase is designed to listen to the organization, not issue directives to it. The use case inventory that emerges from this phase — email drafting, meeting transcription, document summarization, customer support drafts — comes from the front lines, not from a leadership assumption about what AI should be used for.

**Phase 2 — Govern (Weeks 4–6).** Customize and adopt the acceptable use policy. Define data classification tiers. Publish the approved tool list. Deliver a 30-minute AI awareness session to all staff. Configure proxy and firewall controls for non-approved tools. This is the guardrail layer that makes Phase 3 safe.

**Phase 3 — Pilot (Weeks 7–10).** Controlled rollout of one or two approved use cases with a defined pilot group of 10–20 employees. Monitor usage and data handling compliance. Weekly check-ins. Maintain an incident log. This is Bersin's structured experimentation — not a free-for-all, but a governed pilot with defined success metrics and oversight.

**Phase 4 — Measure (Weeks 11–12).** Collect ROI evidence. Review the incident log. Present results to leadership. Complete the NIST AI RMF assessment to establish a formal maturity score. Plan the next 90 days.

The programme's definition of success at 90 days is precise: shadow AI is understood and controlled — not necessarily eliminated, but governed. One or two AI use cases are delivering measurable value with governance in place. All employees know what is and is not permitted. Governance ownership is assigned. A roadmap exists for the next phase.

This is not a technology transformation. It is a governance foundation that makes technology adoption safe and sustainable — which is the precondition for the front-line innovation Bersin correctly identifies as where the real AI value lives.

---

## 7. Policy fluency is necessary. It is not sufficient.

Bersin is correct that policy fluency is a real competency gap. Where her article ends, however, is where the infrastructure work begins. Policy fluency without placement discipline, resilience planning, and measurable governance maturity is a management competency floating above an infrastructure gap.

The organizations that will build durable AI governance are not the ones that train their managers to be more fluent in policy. They are the ones that build the infrastructure that makes policy fluency institutional — documented, scored, auditable, and continuously improving.

The Infrastructure Placement Framework is open-source, published under CC BY 4.0, and available at [framework.4thandbailey.com](https://framework.4thandbailey.com). Modules 01, 04, and 05 address the placement, resilience, and governance layers described in this post. They are free to use, free to fork, and free to build on.

---

## Three questions a CIO and Finance/Procurement should be able to answer before the next board meeting

**1. Which AI workloads in your environment have a documented placement decision — scored on compliance, data sovereignty, vendor lock-in risk, and true three-year total cost of ownership — and which were placed by default when someone accepted a SaaS subscription?**

The organizations that absorbed the CrowdStrike outage in hours rather than days had made deliberate placement decisions before the crisis. The ones that took weeks had not. AI workloads are no different. A placement decision made by default is a risk that has not been priced — and a cost that has not been calculated. Finance and Procurement owns the TCO question. IT owns the placement methodology. Both need to be in the same conversation.

**2. What is the NIST AI RMF maturity score for your organization's AI governance program — and what is the documented plan to improve it?**

If the answer is that your organization has not completed the assessment, the maturity level is Initial — below 25 out of 100. That is not a failure. It is a starting point. The failure is not knowing the score, not having a plan, and presenting AI governance to a board or insurer as a policy statement rather than a scored, dated, improving program.

**3. When your organization's AI vendor has a significant incident — model failure, data breach, service outage, or change of ownership — what is the documented response, and who owns it?**

This is Module 04's question applied to AI vendors specifically. The University of Mississippi Medical Center had an Epic implementation. Epic did not cause the ransomware attack. But the organization's dependence on Epic — without tested manual fallback procedures — determined how long the disruption lasted. Nine days. Your AI vendor relationships carry the same dependency risk. The question is whether that risk is documented and governed before the incident, or discovered during it.

---

<a href="https://calendly.com/4thandbailey/infrastructure-governance-briefing" style="display:inline-block;background-color:#0088cc;color:#ffffff;padding:12px 24px;font-weight:600;border-radius:6px;text-decoration:none;">→ Book the Infrastructure Governance Briefing</a>
