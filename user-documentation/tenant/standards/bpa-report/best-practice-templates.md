---
description: >-
  Discover what's inside the CIPP Best Practices Reports: Ke standards including
  password policies, OAuth consent, audit logs, MFA, and secure score insights
  for enhanced Microsoft 365 compliance.
---

# Best Practice Templates

## **CIPP Best Practices: Tenant and Table Views**

The **CIPP Best Practices v1.0 Tenant View** provides a high-level summary of individual tenant configurations. The **v1.5 Table View** builds on this by offering detailed metrics and enables multi-tenant comparisons. Together, these views create a comprehensive framework for assessing and enhancing security within Microsoft

***

## **v1.0 - Tenant View Checks Included**

**Purpose**: Designed for a high-level tenant-centric overview, this template evaluates key security and compliance settings across a Microsoft 365 tenant.

***

### **Password Never Expires**

* **What It Checks**: Evaluates whether password policies ensure expiry.
* **Expected Setting**: No.
* **Why It Matters**: Prevents insecure, static password use over long durations.

_This setting is checking whether the tenant has set passwords to expire or not. Current research strongly indicates that mandated password changes do more harm than good. Both the_ [_United Kingdom's National Cyber Security Centre (NCSC)_](https://www.ncsc.gov.uk/blog-post/problems-forcing-regular-password-expiry) _and the_ [_United States' National Institute of Standards and Technology (NIST)_](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-63-3.pdf) _recommend that timed password expiry isn't used. Having password expiry configured triggers a red danger status as this represents a security risk you should mitigate._

***

### **OAuth App Consent**

* **What It Checks**: Ensures OAuth app consent policies are configured to restrict unauthorized data access.
* **Expected Setting**: Yes.

_Allowing users to consent to applications can pose a security risk that needs mitigation. This best practice advises against permitting users to grant consent to apps using OpenID Connect or OAuth for sign-in and data access without administrative review. These applications may be created within your organization, by another Office 365 organization, or by third-party vendors. To enhance security, ensure that only administrators can approve app consents_

***

### **Unified Audit Log**

* **What It Checks**: Verifies if tenant-level audit logging is enabled.
* **Expected Setting**: Yes.

_The **Unified Audit Log** is the primary logging mechanism in Microsoft 365, covering activities for users, groups, applications, domains, and directories. Enabling audit logging is essential for compliance, security monitoring, and incident response._

***

### **MFA Registration Campaign**

* **What It Checks**: Assesses if MFA registration nudges are enabled to encourage multi-factor authentication adoption.
* **Expected Setting**: Yes.

_Multi-Factor Authentication (MFA) is one of the most effective security measures to protect accounts from unauthorized access. Enabling the MFA registration campaign ensures users are encouraged to adopt MFA consistently._

***

### **Secure Defaults State**

* **What It Checks**: Determines whether secure defaults are active, enforcing MFA and blocking legacy authentication.
* **Expected Setting:** Yes (or No if Conditional Access policies are in use).

_Modern authentication is a crucial security feature in Microsoft 365. It supports advanced authentication methods, including Multi-Factor Authentication (MFA), smart cards, and third-party providers via Security Assertion Markup Language (SAML). Without enabling modern authentication, your system may be at_

***

### **Anonymous Privacy Reports**

* **What It Checks**: Verifies if user privacy settings enable anonymized data reporting, potentially limiting detailed insights.
* **Expected Setting**: Disabled.

_Enabling privacy in reports is a subjective decision that often results in an orange warning status due to potential reporting challenges. For detailed and accurate reporting, disabling this feature is recommended as it enhances security benefits. However,_ [_Microsoft has been pseudonymizing user-level information by default_](https://techcommunity.microsoft.com/t5/microsoft-365-blog/privacy-changes-to-microsoft-365-usage-analytics/ba-p/2694137) _in many Microsoft 365 reports and APIs to protect user privacy and ensure compliance with local privacy laws._&#x20;

***

### **Message Copy for Sent-As Disabled**

* **What It Checks**: Identifies mailboxes where sent-as copies are not saved.
* **Why It Matters**: Retaining sent-as copies ensures auditing and accountability.

_Delegated access allows an assistant to manage a manager's calendar and mailbox, often requiring the "Send As" or "On Behalf Of" permissions. When an assistant sends an email from a manager's account, the sent items by default are saved only in the assistant's mailbox, which may trigger an orange warning indicating best practice violations._

_To ensure sent items are saved in both the assistant's and manager's mailboxes, it's possible to enable message copy for "Sent As" actions in Microsoft 365. This ensures that all sent emails are automatically stored in the shared or delegated mailbox, aligning with optimal practices for managing shared accounts._

***

### **Shared Mailboxes with Enabled Users**

* **What It Checks**: Flags shared mailboxes with active user accounts attached, which could pose security risks.

_Having shared mailboxes still linked to active user accounts can create a security risk. This situation arises when shared mailboxes, which should not have an enabled login, are associated with accounts that can still access the system. Commonly, this occurs after an employee leaves an organization, and their account is converted to a shared mailbox with the user license removed to cut costs. However, even after changing the password, the active account remains linked, posing a potential security threat._

***

### **Unused Licenses**

* **What It Checks**: Reports on licenses purchased but not assigned, highlighting opportunities for cost optimization.

_Unused licenses trigger an orange warning status. You can click the badge in this column to view these licenses. This feature checks all licenses in every tenant by comparing the purchased number to the consumed one. A discrepancy indicates you may be paying for licenses that are not in use. Free licenses and trials are excluded from this check. If you have additional licenses or SKUs you believe should be excluded, please raise a_ [_feature request_](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=\&labels=\&template=feature_request.md\&title=FEATURE+REQUEST%3A+) _in GitHub._&#x20;

***

### **Secure Score**

* **What It Displays**: The tenant’s Microsoft Secure Score, which reflects adherence to best practices.
* **Why It Matters:** Provides a quantifiable measure of security posture and areas needing improvement.

***

## **v1.5 - Table View**

**Purpose**: Provides a detailed, table-oriented view of best practice checks for granular data reporting.

***

**Key Features:**

* Mirrors the tenant-centric checks from **v1.0 Tenant View**.
* Includes API-level configurations for extracting detailed metrics.
* Designed for multi-tenant comparisons and operational insight.

***

**Additional Metrics:**

1. **Current Secure Score:**
   * Displays as a percentage for easier benchmarking.
2. **Average Comparative Scores:**
   * Benchmarks tenant scores against industry and size-based averages.

***

**Data Sources:**

* **Microsoft Graph API:**
  * **Purpose:** Pulls tenant configurations like `passwordValidityPeriodInDays`.
  * **Benefit:** Facilitates evaluations of password policies and similar critical settings.
* **Exchange PowerShell:**
  * **Purpose:** Verifies Exchange Online properties like `UnifiedAuditLogIngestionEnabled`.
  * **Benefit:** Ensures compliance with audit logging requirements.
* **Custom CIPP Functions:**
  * **Purpose:** Extracts metrics like license usage and Secure Scores using tailored commands (e.g., `Get-CIPPLicenseOverview`).
  * **Benefit:** Provides actionable insights for tenant optimization.

***

### Feature Requests / Ideas

We value your feedback and ideas. Please raise any [feature requests](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=\&labels=enhancement%2Cno-priority\&projects=\&template=feature.yml\&title=%5BFeature+Request%5D%3A+) on GitHub.
