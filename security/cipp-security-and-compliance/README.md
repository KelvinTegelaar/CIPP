---
description: >-
  Explore CIPP’s security measures, data privacy practices, and CyberDrain’s
  approach to global security frameworks designed to protect client data and
  ensure compliance.
---

# CIPP Security and Compliance

CIPP was built with a security-first approach. Each CIPP instance is hosted in its own Azure resource group, with dedicated resources to ensure full separation between instances. Here’s an overview of the measures in place and decisions designed to keep your client data secure and support your compliance needs

### Security Measures

* **Single Sign-On:** Access to CIPP is secured with EntraID SSO only, reducing the risks associated with inactive or stale local accounts.
* **Mandatory MFA:** All communication with Microsoft within CIPP requires multi-factor authentication, which cannot be disabled, ensuring every interaction is securely verified.
* **No-Knowledge Default:** CIPP operates on a no-knowledge model, meaning our employees don’t have access to your instance unless explicitly granted.

### Communication and Data Privacy.

* **Modern Tech Stack:** CIPP is developed with PowerShell and React.js, leveraging Azure services like Static Web Apps, Storage Accounts, Azure Functions, and Key Vault for a secure environment..
* **Encrypted Communication via Azure Static Web Apps:** All data interactions are routed through Azure Static Web Apps, providing secure, encrypted connections between services
* **Data Privacy:** Your data is never sold or shared. Period.

### Logging and Controls

Data is hosted in the CyberDrain B.V. (Chamber of Commerce number 86594893) Azure Tenant. Sponsors hosted by CyberDrain can receive the following technical compliance information:

* Documentation regarding the current Secure Score state of the CyberDrain Azure Tenant
* Sponsors can connect their SIEM/SOC directly to their own security group or Azure Storage account to be aware of any changes made to the environment.

### **CyberDrain's Commitment to** Global Security Standards

At CyberDrain, security is our top priority. To strengthen this commitment, we’re actively working toward ISO/IEC 27001 certification—a globally recognized standard for managing information security. Here’s why ISO/IEC 27001 is a great fit for us and our clients:

* **International Standard**: ISO/IEC 27001 is a widely respected benchmark for information security, underscoring our dedication to rigorous data protection.
* **Holistic Security**: Covering people, processes, and technology, ISO/IEC 27001 enables us to manage sensitive information and mitigate risks across all areas of our operations.
* **Client-Centered Focus**: With a strong emphasis on risk management and data protection, ISO/IEC 27001 aligns closely with our commitment to safeguarding client information.

We’ll share updates on our progress toward ISO/IEC 27001 certification as we reach key milestones. This step reinforces our ongoing commitment to protecting your data and maintaining your trust.
