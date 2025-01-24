---
description: >-
  Technicalities of CIPP: highlighting it's capabilities in user management,
  templating, scheduling tasks, and handling compromised accounts.
hidden: true
---

# Rise of the CIPPs

### Video TBD

### Session Abstract

This session provided an overview of key functionality within CIPP. Topics included managing user information through the Off Canvas flyout, leveraging templates for data management, automating tasks with the scheduler, exploring the new scheduling engine, and effectively handling compromised user accounts.

### Learning Objectives

1. **User Management:** Learn to manage user information efficiently, including editing user details and understanding various quick action features within the Off Canvas flyout.
2. **Effective Use of Templates:** Understand the role of templates in streamlining data collection and management, emphasizing the benefits of template-based data organization over manual.
3. **Task Automation with Scheduler:** Gain insights into automating repetitive tasks using the scheduler and the importance of immediate task execution post-scheduling.
4. **Understanding the New Scheduling Engine:** Explore the enhanced functionalities of the new scheduling engine, focusing on its advanced task planning and execution capabilities.

<details>

<summary>Detailed Topic Coverage</summary>

1. **User Management via Off Canvas Flyout:**
   * Discussed the Off Canvas flyout's capabilities for managing user attributes, including editing details, adding aliases, and changing domain names.
   * Highlighted quick actions within the flyout, such as `Research Compromised Account` (formerly known as BEC) and `Create Temporary Access Password`.
   * Emphasized the convenience and efficiency of this feature for user management tasks.
2. **Utilizing Templates for Data Management:**
   * Focused on the use of templates as an efficient method for gathering and organizing information.
   * Advised against manual data manipulation, recommending the use of the templating engine for optimal efficiency.
   * Stressed the importance of templates for streamlined data management processes.
3. **Automation with Scheduler Tasks:**
   * Explored the functionality of adding tasks to a schedule and the immediate execution of these tasks upon the next scheduler trigger.
   * Discussed the benefits of automating repetitive tasks using the scheduler, enhancing overall workflow efficiency.
4. **Capabilities of the New Scheduling Engine:**
   * Showcased the functionalities of the new scheduling engine, emphasizing its advanced task planning and execution capabilities.
   * Discussed the different options available in the scheduling engine and their practical applications.
5. **Handling Compromised Accounts with Research Compromised Account Feature:**
   * Addressed the process of handling compromised user accounts using the `Research Compromised Account` feature.
   * Detailed actions such as disabling mailbox rules, resetting passwords, and blocking sign-ins to secure compromised accounts.
   * Highlighted the effectiveness of this feature in swiftly addressing security concerns.

</details>

<details>

<summary>Chat FAQ</summary>



**Q: Does deleting the user remove the user from the recycling bin as well?**

**A:** No, deleting the user moves them to the recycling bin, and you can restore them from there if needed.

***

**Q: Do we need to create templates from within CIPP, or can we use an existing Intune policy as a template for everyone?**

**A:** You can create templates in any tenant, and you don't have to create them in CIPP. The benefit lies in creating templates in a baseline tenant or a tenant where you already have specific policies.

***

**Q: Is there a way to disable individual standards set in the wizard?**

**A:** Disabling a standard only prevents it from applying in the future; it doesn't revert the settings. You'll need to manually re-enable it in the tenant if needed.

***

**Q: Can you rely on the IDs seen in group templates for mapping?**

**A:** Those IDs are internal and not usable within the Microsoft 365 environment. It's not something you can rely on, but the possibility for improvement is being explored.

***

**Q: Can CIPP notify you when your Apple certificate is about to expire?**

**A:** Yes, you can create alerts in CIPP, including alerts for expiring Apple certificates.

***

**Q: Does a transport rule deployed to multiple tenants periodically overwrite changes made on a tenant-by-tenant basis?**&#x20;

**A:** Using transport rules, deploying a single rule won't override anything. However, templates can force specific environments to match the template periodically.

***

**Q: Can two GDAP roles be mapped to the same partner tenant role?**

**A:** Yes, you can achieve this by using nested groups to assign roles based on group memberships.

***

**Q: Can you have two relationships with a tenant, one with auto-renewing non-global admin and another with global admin?**

**A:** Yes, it's possible to have multiple relationships, but manually renewing the global admin relationship is required, and it's not recommended.

***

**Q: Are there plans for more granular permissions?**

**A:** There are no plans for more granular permissions, but you can create custom roles if needed.

***

**Q: Can CIPP send individual alerts to clients without notifying the CIPP owner?**

**A:** CIPP does not send individual client alerts, but you can explore other methods like using PSA or email features for client notifications.

***

**Q: Can PIM on the partner tenant be nested?**

**A:** Yes, you can nest PIM groups, but ensure to enable the "intra AD role assignment" checkbox for it to work.

***

**Q: How can CIPP be made faster?**

**A:** Follow specific steps outlined in the documentation, and consider using the "run from package" mode to improve performance.

***

**Q: Does the caveat rule apply to hosted CIPP instances?**

**A:** Hosted CIPP instances have "run from package" enabled by default, and they are regularly monitored and updated for performance and security.

***

**Q: Is there a way to set exceptions on users from MFA reports?**

**A:** No, CIPP does not allow exceptions, and service accounts should have MFA.

***

**Q: Can GDAP group settings be changed without reinviting everyone?**

**A:** Only the nested group needs the role assignment setting enabled; individual GDAP groups do not require it.

***

**Q: Can clients be alerted individually about their Apple certificate expiration?**

**A:** CIPP does not support individual client alerts; it sends alerts to PSA, configured email, or webhooks.

***

**Q: Will CIPP support automatically mapping SharePoint sites and Explorer shortcuts?**

**A:** No, CIPP does not provide this functionality, but there will be a standard for mapping all accessible shortcuts.

***

**Q: Can CIPP support auto-removing users from a security group?**

**A:** Yes, you can use the scheduler to add or remove users from groups based on a schedule.

***

**Q: Can you explain using standards in place of transport rules in CIPP?**

**A:** Standards can be used to create and deploy transport rules. Templates are for one-off deployments; they don't overwrite existing rules.

***

**Q: Why don't my SharePoint sites appear in the OneDrive shortcut list?**

**A:** This issue is a known Microsoft bug, and they are working on fixing it. Fix is expected by next week.

***

**Q: How does CIPP handle updates to Intune templates?**

**A:** Updates to Intune templates overwrite the previous deployment when using a standard.

***

**Q: Can I use CIPP for my dev tenant that's not a partner tenant?**

**A:** Using CIPP for a non-partner tenant in a dev environment is possible but requires a more complex setup.

***

**Q: Will CIPP support device filters and categories when assigning Intune templates?**

**A:** CIPP won't focus on adding device filters; it recommends using groups or dynamic groups for most cases.

***

**Q: Can CIPP groups support M365 groups?**

**A:** Yes, CIPP supports M365 groups without issues.

***

</details>

<details>

<summary>Resources Shared</summary>

1. **Using CIPP for Development Tenants:**
   * Resource: [CIPP Setup and Installation for Own Tenant](https://docs.cipp.app/setup/installation/owntenant)
   * Context: Guidance for setting up CIPP in a development environment, particularly for non-Partner tenants. This resource is useful for those looking to demonstrate CIPP's capabilities within their own organization.
2. **Improving CIPP Performance:**
   * Resource: [CIPP Setup - Run from Package Mode](https://docs.cipp.app/setup/installation/runfrompackage)
   * Context: Instructions on how to enable 'Run from Package' mode in CIPP to enhance application performance. This is particularly relevant for users seeking to optimize CIPP's operational speed.
3. **Creating Demo Tenants with Microsoft CDX:**
   * Resource: [Microsoft Demos](https://demos.microsoft.com/)
   * Context: These resources provide steps for creating demo tenants using Microsoft's CDX platform. They include prerequisites, the process of tenant creation, and recommended settings for billing information. This is especially helpful for users needing to test or demo in controlled environments.
4. **Custom Roles in CIPP:**
   * Resource: [CIPP Setup and Installation - Custom Roles](https://docs.cipp.app/setup/installation/roles#custom-roles)
   * Context: This document provides information on setting up custom roles within CIPP, addressing the need for granular permissions. It's a valuable resource for organizations seeking to tailor access controls based on specific administrative needs.

</details>
