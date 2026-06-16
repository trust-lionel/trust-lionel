---
title: "Why We Moved a Regional Broadcasting Company Off Amazon EC2 — and Why Microsoft Azure Won"
description: "A cloud migration case study for CIOs, IT Directors, and business owners considering a move from AWS to Azure. Learn why Microsoft's integrated ecosystem beat staying on Amazon EC2."
date: 2026-06-16
author: Lionel Mosley
tags: [Cloud Migration, Microsoft Azure, Amazon AWS, Microsoft 365, Business Continuity]
og_image: "https://images.unsplash.com/photo-1757436382135-5cb8e5cbcda5?w=1400&q=80&auto=format&fit=crop"
featured: true
image: "https://images.unsplash.com/photo-1757436382135-5cb8e5cbcda5?w=1400&q=80&auto=format&fit=crop"
image_alt: "Modern skyscrapers under construction with cranes — architecture in progress"
---

*When your infrastructure lives in one cloud and your business runs in another, you are not operating an ecosystem. You are managing a gap.*

A regional broadcasting company came to us with a problem that looked like a technical one. Fifteen internet radio stations. A Linux-based streaming infrastructure running on Amazon EC2. Media libraries in the gigabytes. Listeners across multiple markets. And a team that managed daily operations inside Microsoft 365 — Exchange Online for email, SharePoint Online for files, Microsoft Teams for communication.

The infrastructure worked. The streams played. But the environment was fractured. Compute on AWS. Identity and productivity on Microsoft. Backup handled manually. Disaster recovery undefined. Every operational decision that touched both sides required a context switch — different portals, different vendors, different support paths, different billing relationships.

That is not a technical problem. That is a business risk.

This is the story of how we resolved it — and why the decision was about more than where the servers live.

---

## The Case for Migration: What the Business Was Actually Paying For

Before we touched a single configuration file, we asked the question every CIO and owner should ask before any infrastructure decision: *what problem are we actually solving?*

The answer had four parts.

**Operational fragmentation.** The team managing the stations had no unified view of their environment. Streaming infrastructure on Amazon EC2. Business data on Microsoft 365. Two vendor relationships. Two support queues. Two billing cycles. No single pane of glass.

**Business continuity exposure.** There was no formal backup policy for the compute layer. If a virtual machine failed, recovery depended on manual processes and institutional memory — neither of which is a continuity strategy.

**Ecosystem misalignment.** Microsoft 365 was already the operational backbone of the business. Exchange Online handled all organizational email. SharePoint Online housed internal documents. The compute infrastructure — the part that generated revenue — was on a different platform entirely.

**Cost visibility.** Amazon EC2 pricing for Linux compute instances is well-documented, but it does not include the operational overhead of managing a fragmented environment. When you account for the time spent context-switching between platforms, the real cost of staying on AWS was higher than the invoice suggested.

---

## Why Microsoft Azure — Not a Rebuild on AWS

This question deserves a direct answer, because it is the question every CIO, IT Director, and Finance leader should be asking before approving any migration.

We did not move to Azure because AWS is inferior. Amazon EC2 is a mature, capable compute service. We moved to Azure because the organization had already made its strategic cloud decision — and it was Microsoft.

When your identity platform is Azure Active Directory, your email is Exchange Online, your documents are in SharePoint Online, and your collaboration runs in Microsoft Teams, your compute infrastructure belongs in Azure. Not because of sentiment. Because of integration.

| Capability | AWS Approach | Microsoft Azure Approach |
|---|---|---|
| Identity | Separate IAM configuration | Native Azure AD integration |
| Monitoring | CloudWatch — separate portal | Azure Monitor — unified portal |
| Backup | Manual or third-party | Azure Backup — built into portal |
| Support | AWS Support plan | Single Microsoft support relationship |
| Billing | Separate AWS invoice | Unified Microsoft billing |
| Compliance | Separate compliance posture | Unified compliance across M365 + Azure |

For an organization already operating inside Microsoft 365, Azure is not a migration destination. It is the completion of a decision already made.

---

## What We Built: The Architecture

The streaming infrastructure for fifteen radio stations now runs on two dedicated Microsoft Azure Virtual Machines — both running Debian Linux, both Trusted Launch enabled, both inside the Microsoft Azure ecosystem.

The choice of Linux was deliberate. The streaming software stack — CentovaCast, SHOUTcast, and the AutoDJ layer — runs on Linux. Moving to Azure did not mean moving to Windows. Azure Virtual Machines support Linux natively, and the operational behavior of the stack is identical to what ran on Amazon EC2. The migration was a lift of workloads, not a rewrite of them.

What changed was everything around the workload.

**Backup and Recovery.** Both virtual machines are now protected by Azure Backup with Enhanced Policy — automated backups every four hours, thirty-day retention, instant restore capability, and application-consistent snapshots. The organization went from no formal backup policy to enterprise-grade protection in the same portal they use for everything else. For Finance and Procurement, this is a line item that eliminates a category of risk. For InfoSec, it is a documented, auditable recovery posture.

**Business Continuity.** Recovery Services Vaults are now configured for both virtual machines. A failure scenario that previously would have required manual intervention and undocumented institutional knowledge now has a defined recovery path with measurable recovery time objectives.

**Networking.** Network Security Groups replace ad-hoc firewall rules. Inbound access is explicitly defined — only the ports the streaming infrastructure requires are open. SSH is locked down. The attack surface is documented and controlled.

**Monitoring.** UptimeRobot monitors every station, every control panel, and every website — with a public status page available to the operations team and stakeholders at a single URL. Azure Monitor provides the infrastructure layer underneath.

---

## The Microsoft Ecosystem Argument: What CIOs and Owners Need to Hear

There is a conversation that happens in every organization considering a cloud migration, and it usually sounds like this: *we already have Microsoft 365, so why are we paying for infrastructure somewhere else?*

It is the right question. And the answer is almost always: *you should not be.*

Microsoft's integrated cloud strategy is not marketing language. It is a technical and operational reality. When compute lives in Azure and productivity lives in Microsoft 365, the organization gains:

- **Unified identity** — Azure Active Directory governs access to virtual machines, Exchange Online, SharePoint Online, and every Microsoft service under a single identity plane.
- **Unified compliance** — Microsoft Purview applies compliance policies across the entire environment. Data governance is not a separate workstream for infrastructure and productivity — it is one.
- **Unified support** — One vendor relationship for the entire stack. One support contract. One escalation path.
- **Reserved Instances** — Azure Reserved Virtual Machine Instances allow organizations to commit to one or three-year terms in exchange for significant compute cost reductions compared to on-demand pricing. For a stable workload like broadcast streaming infrastructure, Reserved Instances are a direct line to Finance and Procurement: predictable cost, documented savings, auditable commitment.

This is what an ecosystem looks like. Not a collection of services from different vendors stitched together with manual processes. An integrated environment where identity, compute, storage, backup, compliance, and productivity share a common platform, a common management plane, and a common support relationship.

---

## What This Migration Did Not Do

Honesty is part of the framework.

This migration did not eliminate operational complexity. Fifteen radio stations still require operational discipline — service monitoring, media management, stream verification, and incident response procedures. We documented all of it in a formal operations RunBook, because tools and infrastructure do not replace process.

This migration did not make the organization immune to failure. No cloud environment does. What it did was replace an undocumented, informal recovery posture with an automated, policy-driven one. That is the difference between hoping nothing breaks and being prepared for when it does.

And this migration did not answer every business question. Domain management, website deployment, and third-party integrations are still in progress. A cloud migration is a project with a completion date — but an infrastructure relationship that requires ongoing attention.

---

## The Decision Framework

If your organization is running workloads on Amazon EC2 and operating inside Microsoft 365, here are the four questions worth answering before your next budget cycle:

1. **Where does your identity live?** If the answer is Azure Active Directory, your compute should be in Azure.
2. **What is your recovery posture?** If the answer involves manual processes or undocumented procedures, Azure Backup and Recovery Services Vaults are a direct solution.
3. **How many vendor relationships does your infrastructure require?** Every additional relationship is overhead — operational, financial, and compliance overhead.
4. **What would a failure cost?** Not the compute cost. The business cost. Downtime. Revenue loss. Listener attrition. Reputation. That is the number that belongs in the migration business case.

The organization in this case study is now operating fifteen live radio stations on Microsoft Azure Virtual Machines, protected by automated backup, monitored in real time, and fully integrated with the Microsoft 365 environment their team uses every day.

The streams are live. The infrastructure is documented. The recovery posture is defined.

That is what completing the decision looks like.

---

*"I've spent my career asking 'what if' when everyone else was asking 'how much.'"*

*The 'what if' here is: what if your infrastructure and your business platform finally lived in the same ecosystem? The answer is not a technical one. It is an operational one.*

---

## References

- [Microsoft Azure Virtual Machines — Linux](https://azure.microsoft.com/en-us/products/virtual-machines/)
- [Azure Backup — Recovery Services Vaults](https://azure.microsoft.com/en-us/products/backup/)
- [Azure Reserved Virtual Machine Instances](https://azure.microsoft.com/en-us/pricing/reserved-vm-instances/)
- [Microsoft 365 — Exchange Online](https://www.microsoft.com/en-us/microsoft-365/exchange/email)
- [Microsoft 365 — SharePoint Online](https://www.microsoft.com/en-us/microsoft-365/sharepoint/collaboration)
- [Azure Network Security Groups](https://learn.microsoft.com/en-us/azure/virtual-network/network-security-groups-overview)
- [Microsoft Purview Compliance](https://www.microsoft.com/en-us/security/business/microsoft-purview)
- [AWS to Azure service comparison](https://learn.microsoft.com/en-us/azure/architecture/aws-professional/services)
