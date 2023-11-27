---
description: >-
  Exploring the Essentials of Conditional Access: Techniques, challenges, and
  strategies for effective cybersecurity using CIPP.
---

# Conditional Access

(Video coming soon)

### Session Abstract

Our inaugural Sip & CIPP event offered a deep dive into Conditional Access, emphasizing the practical application of Conditional Access policies within the CIPP framework. We explored the nuances of policy creation, management, and the integration of Continuous Access Evaluation for enhanced security. We also shed light on device-specific policies, best practices for complex policy management, and the interaction of Conditional Access with Microsoft 365.

### Learning Objectives

1. **Practical Understanding of Conditional Access**: Gain a working knowledge of Conditional Access principles and their impact on cybersecurity in MSP contexts.
2. **Strategic Policy Implementation**: Learn to strategically implement and manage Conditional Access policies tailored to diverse environments.
3. **Troubleshooting and Optimization Skills**: Acquire skills in troubleshooting and optimizing Conditional Access systems for varied client scenarios.
4. **Integrating Conditional Access with Broader Frameworks**: Discover how to seamlessly integrate Conditional Access into broader MSP cybersecurity strategies and Microsoft 365 ecosystems.

<details>

<summary>Detailed Topic Coverage</summary>

**Overview of Conditional Access**

* **Fundamental Principles**: Conditional Access is not processed like firewall rules; it's evaluated as one combined policy after login, prioritizing deny rules over allow rules.
* **Policy Evaluation Mechanics**: Policies are merged into a single evaluation block to determine access, emphasizing the importance of strategic policy design.

**Implementation Strategies**

* **Policy Creation and Management**: Discussion on creating and managing Conditional Access policies, focusing on best practices for implementation.
* **License Requirements**: Emphasis on the necessity of appropriate licensing (e.g., P1 licenses) for each user to utilize Conditional Access features.

**Continuous Access Evaluation**

* **Significance and Activation**: Continuous Access Evaluation is a key feature for maintaining security, constantly reevaluating access tokens to enhance protection.
* **Location-Based Policies**: Implementing policies that react to IP address changes, requiring immediate reauthentication, thus countering phishing and token theft.

**Device and User-Specific Policies**

* **Device-Based Filtering**: Strategies for applying policies based on device type and platform, with special considerations for mobile devices to avoid frequent reauthentication.
* **Custom Conditions for Access**: The use of custom conditions to define access policies, such as filtering for specific device platforms or excluding mobile devices to reduce unnecessary access challenges.

**Policy Complexity and Best Practices**

* **Combining Multiple Policies**: Challenges and strategies in managing complex policy structures, ensuring that the combined result of all policies aligns with the intended security posture.
* **Best Practices in Policy Design**: Recommendations on excluding service provider policies and creating targeted policies for better management and security outcomes.

**Integration with Microsoft 365 and CIPP**

* **CIPP and Microsoft 365 Synergy**: Discussing the integration and cooperative functionality between Conditional Access policies and Microsoft 365, including the impact on applications like Outlook on different operating systems.
* **CIPP for Policy Management**: Utilizing CIPP to control and streamline Conditional Access policy implementation and management across different user scenarios.

</details>

<details>

<summary>Chat FAQ</summary>

**Q: Is the Continuous Access Evaluation feature coming to anything but P2?**

**A:** The feature is actually a P1 feature and is currently active for all users who are using security defaults. This applies to anyone, even without a P1 license, as long as security defaults are enabled​​.

**Q: Now that Microsoft is pushing automatic CA policies, do CA policies require security defaults being turned off?**

**A:** When using Conditional Access MFA, it's recommended to disable per-user MFA. If per-user MFA is employed, your Conditional Access policies will be ignored and not used for any evaluation, leading to each logon being a per-user MFA logon​​.

**Q: What to do with mailboxes configured with a license and login but used by multiple users?**

**A:** The recommendation is to stop using individual credentials for shared mailboxes. Instead, grant full access permissions to users for the mailbox, allowing them to log in using their own credentials and MFA. It's also advised to encourage the use of the Outlook app on iOS for better functionality and security​​.

**Q: How can we avoid 'pass the cookie' attacks even with Conditional Access and MFA enabled?**

**A:** Use Continuous Access evaluation with strictly enforced location policies. This approach, combined with excluding mobile devices from certain conditions, can effectively prevent 'pass the cookie' attacks. Additionally, always revoke all session tokens if a user is compromised​​.

**Q: If a login occurs before a policy is set to "on" and a new policy is enabled that would block the user, will the session survive until a new token is needed?**

**A:** Yes, the session will survive unless Continuous Access Evaluation is enabled. In those cases, every time a token is used, it is re-evaluated

**Q: When excluding the service provider in Conditional Access policies, do you mean the GDAP groups or a specific object?**

**A:** You need to exclude the tenant ID of the organization. It's recommended to enter the tenant ID as it never changes, although you can also use the domain name. Additionally, using a temporary access password for the 'break glass' account is a good practice​​.

**Q: Will the 'What If' tool in Conditional Access only evaluate policies that are active?**

**A:** Yes, the 'What If' tool will only evaluate policies that are currently active or in report-only mode. Policies in off mode are not evaluated against​​.

**Q: Where can I find more information on the compliant network locations preview?**

**A:** Microsoft's documentation is the best place to start, though it might not be fully updated. A recommended resource is the blog by Meryl Fernando, a Microsoft employee with expertise in conditional access, available at merrill.net​​.

**Q: What's the ETA for full GDAP vs GA account?**

**A:** The transition to GDAP is ongoing, with workloads and capabilities rapidly expanding. Everything that was possible under DAP should now be available in GDAP, though it might take some time to have all the required access without any excess​​.

**Q: For scenarios needing a 'break glass' GA access, what is being done to address this?**

**A:** In cases where a global administrator account is still required, a solution being tested involves creating temporary global administrators and removing them at a later date, providing just-in-time access​​.

**Q: How can we assign subsite permissions if we can't access the SharePoint site?**

**A:** The solution is to use PowerShell. You will need to know the exact path of what you're applying the permissions to​​.

**Q: How many accounts can one FIDO key secure, especially for MSPs with multiple fully managed customers?**

**A:** The number of accounts a FIDO key can secure depends on the key itself. Some keys may have a limit, like 25 accounts, but others might not have a specific limit. It varies based on the type of FIDO key used​​.

**Q: What about mobile devices in regards to Continuous Access? How to prevent it from affecting iOS and Android Outlook users?**

**A:** To prevent Continuous Access policies from affecting mobile devices, set the policy to apply only to specific OS's such as Windows, macOS, and Linux. This way, mobile devices that constantly change locations won't be unduly affected​​.

</details>

<details>

<summary>Resources Shared</summary>

1. [**How many accounts can I register my YubiKey with?**](https://support.yubico.com/hc/en-us/articles/360013790319-How-many-accounts-can-I-register-my-YubiKey-with-)**:** A resource from Yubico detailing the account limits for YubiKeys, especially relevant for understanding the capacity and limitations of YubiKeys for TOTP.
2. [**Merill's Identity Insights**](https://merill.net/)**:** Ramblings of an Identity Microsoftie by Merill Fernando, offering insights into identity management and Microsoft-related identity solutions. (Bonus: Merill's [Entra Discord](https://discord.gg/UYPgJZHqtP) for community discussions)
3. [**CIPP Conditional Access Setup**](https://docs.cipp.app/setup/installation/conditionalaccess)**:** Guidance on setting up Conditional Access policies for CIPP, providing best practices and step-by-step instructions.
4. [**Microsoft Entra Blog Post**](https://techcommunity.microsoft.com/t5/microsoft-entra-azure-ad-blog/microsoft-entra-expands-into-security-service-edge-with-two-new/ba-p/3847829)**:** Official Microsoft announcement about Microsoft Entra Internet Access and Microsoft Entra Private Access, expanding into Security Service Edge solutions.
5. [**Stop hackers from stealing your Microsoft 365 user's passwords**](https://www.youtube.com/watch?v=tI1bdVohOK8)**:** A video by Merill Fernando providing a live example of evilnginx and its implications for Microsoft 365 password security.

</details>
