---
description: >-
  Dive deep into Autopilot: Enrollment methods, features, setup challenges, and
  key settings' impact using CIPP.
---

# Autopilot & Intune

### \[\[ YouTube Video Link ]]

### Session Abstract

The second Sip & CIPP event provided an in-depth exploration of Microsoft Autopilot configurations within CIPP. This session offered valuable insights into balancing the use of CIPP with M365 functionalities, effectively managing Autopilot profiles, and the nuances of device addition methods. The event was capped off by an interactive Q\&A session, addressing real-world challenges and sharing practical advice.

### Learning Objectives

1. Understand the integration and balance between CIPP and Microsoft 365 functionalities.
2. Learn the methods and challenges of adding devices to Microsoft Autopilot.
3. Gain insights into Autopilot profile management and user experience optimization.
4. Explore practical solutions to common challenges in device setup and management.

<details>

<summary>Detailed Topic Coverage</summary>

**Introduction to Microsoft Autopilot**:

* Comprehensive overview of Autopilot features, highlighting its complexity and scope.
* Discussion on the importance and benefits of Autopilot in managing device deployment and configuration.

**Device Addition Methods in Autopilot**:

* In-depth exploration of various methods for adding devices, including using product key IDs, manufactured device models, device serial numbers, and hardware hashes.
* Insights into the challenges and nuances associated with each method, and how CIPP facilitates these processes.

**Managing Autopilot Profiles**:

* Detailed discussion on the creation and management of Autopilot profiles for different deployment scenarios.
* Coverage of Low Touch Installation (LTI) and Zero Touch Installation (ZTI) approaches, and their impact on the user experience.
* Exploring the role of profiles in Device/User Experience Settings Page (ESP), and their significance in the overall setup process.

**Integration with Microsoft 365**:

* Understanding the interplay between CIPP and Microsoft 365, focusing on how they complement each other in an IT environment.
* Discussing specific features within Microsoft 365 that are crucial for Autopilot setups, like conditional access policies.

**Practical Challenges and Solutions in Device Setup**:

* Addressing real-world challenges in device setup, including configuration issues, user-specific app installations, and troubleshooting common problems.
* Sharing practical advice and solutions, backed by real-life examples and experiences.

</details>

<details>

<summary>Chat FAQ</summary>

**Q: Can the Windows Product Key ID inclusion be random, and is it available on invoices?**

A: Yes, the inclusion of the Windows Product Key ID can be random. Recent changes in CIPP allow identification of the tenant a device is registered to using this ID. The extent of manufacturer involvement varies, and this information may also be available on invoices.

**Q: Is a temporary access pass recommended for installing user-specific apps?**&#x20;

A: Yes, a temporary access pass is advised for installing specific apps on individual users. However, the longevity of the pass affects the duration of the refresh token.

**Q: Does the Temporary Access Pass work with hybrid AD join?**&#x20;

A: Temporary Access Pass works with hybrid AD join, but its use is generally discouraged in favor of AD sync and Intune. Hybrid Azure AD join is not recommended by Microsoft except for specific cutover situations.&#x20;

**Q: What are the alternatives if I don't want on-prem devices registered in Entra?**

A: For alternatives to registering on-prem devices in Entra, the  [**Hybrid AD Join vs AAD Join**](https://wiki.winadmins.io/en/autopilot/hybrid-join-vs-aad-join) resource was referenced for more information.

**Q: Can CIPP notify users when a temporary access pass is created?**

A: No, CIPP currently does not have a feature to notify users when a temporary access pass is created. This functionality may be considered for future updates if there's enough demand.

**Q: Is CIPP compatible with Immy.BOT for deploying user-specific configurations?**&#x20;

A: Yes, CIPP is compatible with Immy.BOT for rolling out user-specific configurations, and they can be used concurrently with Intune.

**Q: Are there any issues with White Glove OBE differing between WiFi and LAN connections**

A: No issues have been encountered with White Glove OBE between WiFi and LAN connections in the speaker's experience. Environment-specific factors might influence this.

**Q: Will Autopilot profiles and status pages become part of CIPP standards?**

A: Autopilot profiles and status pages can currently be deployed to all clients using the `All Tenants` option. Making them standard in CIPP depends on user interest, and feature requests are encouraged.

**Q: Will CIPP replace Chocolatey with Winget?**&#x20;

A: No, CIPP currently offers both Chocolatey and Winget (called `App Store Application` within CIPP), with no plans for replacement.

**Q: Does CIPP support M365 Multi-Geo configurations?**&#x20;

A: Yes, CIPP supports M365 Multi-Geo configurations without any known limitations.

</details>

<details>

<summary>Resources Shared</summary>

* [**Call4Cloud**](https://call4cloud.nl/about/): In-depth information on Autopilot and Intune&#x20;
* **Microsoft EMS Community**:  [YouTube](https://www.youtube.com/@msems) resources and [Discord](https://discord.gg/rWTY2VcT) community for Microsoft EMS.
* **Autopilot Hash CSV**: A [GitHub repository](https://github.com/rvdwegen/autopilot.ms) for Autopilot hash CSV by CIPP contributor rvdwegen.
* [**Hybrid AD Join vs AAD Join**](https://wiki.winadmins.io/en/autopilot/hybrid-join-vs-aad-join): Detailed comparison and insights from WinAdmins.
* [**Microsoft Intune Plans and Pricing**](https://www.microsoft.com/en-us/security/business/microsoft-intune-pricing): Information on Intune pricing and plans from Microsoft.
* [**Windows Hello for Business**](https://learn.microsoft.com/en-us/windows/security/identity-protection/hello-for-business/hello-hybrid-cloud-kerberos-trust?tabs=intune): Guide on deploying Windows Hello for Business in a cloud Kerberos trust scenario.
* [**Conditional Access Framework**](https://learn.microsoft.com/en-us/azure/architecture/guide/security/conditional-access-framework): Guidance on naming and structuring CA policies from the Azure Architecture Center.

</details>
