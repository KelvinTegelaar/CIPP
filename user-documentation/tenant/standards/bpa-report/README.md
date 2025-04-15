---
description: >-
  Welcome to the BPA within CIPP! Your misconfiguration detective, uncovering
  compliance gaps and ensuring your Microsoft 365 tenants align with security
  and operational best practices.
---

# Best Practice Analyser

The **Best Practice Analyzer (BPA)** is a tool within CIPP designed to help audit and improve Microsoft 365 environments. It provides a detailed framework for ensuring your setup is secure and compliant with industry and organizational standards.

***

## **What is the BPA?**

At its core, the BPA is built to:

* **Assess Tenants Against Best Practices:** Perform comprehensive audits to uncover misconfigurations or compliance risks.
* **Run on a Scheduled Basis:** By default, it refreshes data once daily for accurate reporting.
* **Leverage CIPP Framework Standards:** Use predefined, community-driven standards tailored to MSPs and IT professionals.
* **Provide Insight-Only Reports:** BPA reports findings but leaves decision-making and changes to the administrator.

***

## **Viewing Your BPA Reports**

* **Navigate to:** `Tenant Administration > Standards > Best Practice Analyzer`.
* **Run Initial Data Refresh:** Select **“Force Refresh All Data”** if this is your first time displaying it.

{% hint style="info" %}
To replicate the functionality of the "Force Refresh All Data" button, you can use the `/api/ExecBPA`API endpoint.
{% endhint %}

{% hint style="warning" %}
**Note:** Larger environments (e.g., 100+ tenants) may take \~15 minutes per run.
{% endhint %}

### **Report Types**

1. **Pre-Built Reports**
   * Use templates like **CIPP Best Practices Table View** for baseline compliance checks.
2. **Custom Reports (Advanced)**
   * Define custom reports to specify data sources, fields, and display formats.&#x20;
   * For further details, check out the community guidance added to the [builder](builder/ "mention") page

### **Interpreting BPA Results**

The BPA uses a traffic-light system for quick, visual feedback:

* **🟥 Red:** Critical issues demanding immediate attention (e.g., unprotected global admin accounts).
* **🟧 Orange:** Warnings or recommendations—optional but strongly advised (e.g., enabling MFA for non-admin users).
* **🟩 Green:** All good! Configuration aligns with best practices.

***

## **Common Snags and Fixes**

1. **Partial Data?**
   * Likely an issue with your **Refresh Token**.
   * Run the **Access Check** via: `CIPP Settings > Configuration Settings > Tenant Access Check`.
2. **Slow Refresh Times?**
   * Make sure permissions are correct. Navigate to:\
     `CIPP Settings > Configuration Settings > Run Permission Check`.
3. **API Compatibility (Self-Hosted Only):**
   * Ensure both **CIPP-API** and **CIPP platform** are up to date. The system logs (via the CIPP-API Function App) are your best friend for debugging.

***

{% hint style="warning" %}
### **Key Considerations for Efficient BPA Usage**

**Understand Execution Times:** Forcing a refresh runs across your entire environment and may take some time. Use sparingly. Reports are refreshed nightly by default.

**Permissions:** Validate required permissions with `Run Permission Check` and troubleshoot invalid refresh tokens with `Tenant Access Check`.
{% endhint %}

***

{% include "../../../../.gitbook/includes/feature-request.md" %}
