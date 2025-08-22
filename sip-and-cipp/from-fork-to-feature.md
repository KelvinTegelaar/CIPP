---
description: >-
  Contributing to CIPP : A deep dive into development, forking, API creation,
  and tips for project contributions
hidden: true
---

# From Fork to Feature

### Video TBD

### Session Abstract

Our 4th Sip & CIPP session offered an immersive journey into the world of Open Source Software development within the CIPP projects. This workshop was designed to equip future contributors with practical skills in setting up a development environment, forking repositories, and API creation. Attendees explored the nuances of navigating the CIPP codebase, contributing effectively, and implementing best practices in scripting and security. The session also provided a sneak peek into upcoming features, positioning attendees at the forefront of innovative development in the CIPP project.

### Learning Objectives

1. **Development Environment Setup**: Steps to create a local environment for CIPP development.
2. **Forking Repositories**: Best practices for forking CIPP and CIPP-API repositories.
3. **Custom Feature and API Development**: Techniques for developing custom features and APIs.
4. **Understanding Codebase**: Tips for efficiently navigating the CIPP project's codebase.
5. **Practical Development Tips**: Practical tips on testing, environment variables, and security practices in the development workflow.

<details>

<summary>Detailed Topic Coverage</summary>

1. **Local Development Setup**:
   * Kelvin emphasized the importance of mirroring the production environment in the local setup to avoid deployment issues.
   * He provided a step-by-step guide on setting up a local development environment, including navigating GitHub, managing branches, and finding specific files like standards.
2. **Forking and Contribution**:
   * Participants were guided on creating forks of the CIPP repositories and the necessity of including a development branch in these forks.
   * Kelvin discussed making edits, committing changes, and the process of starting pull requests, highlighting UK English spelling conventions in the project.
3. **Hands-On Development**:
   * The session included instructions on starting local development instances and executing commands using tools like `winget`.
   * Kelvin demonstrated creating and editing standards and APIs within CIPP, focusing on adding new standards, remediation options, and input fields.
4. **Codebase Navigation and Contribution**:
   * Kelvin dissected the CIPP project structure, showing how to navigate modules and explaining the significance of each folder.
   * The process of creating new standards, adding them to the front end, and the modularity of CIPP's architecture were highlighted.
5. **Future Developments**:
   * Upcoming features and improvements, such as the rewrite of the events engine and new alerting rules, were discussed.
   * Kelvin introduced the concept of if-else-then logic for alerts received through webhooks for more dynamic and customizable responses.

</details>

<details>

<summary>Chat FAQ</summary>

**Q: Why is the report option not available for CA templates?**\
**A:** The report option isn't available because multiple templates can be selected at the same time, making it unclear what specifically is being reported.

**Q: Can I alert/report on members of a CA policy?**\
**A:** Creating a custom flow is required to check if a user is logging on without multifactor authentication and if they're a member of the policy.

**Q: Is there a way to review and remediate a user's risk state when they get flagged as a risky user?**\
**A:** This can be achieved using new event-based remediations with a custom if-else-then script.

**Q: How are the conversations going with direct CSP providers for integrations?**\
**A:** Conversations with one tier-one CSP provider are progressing well, focusing on creating APIs for license purchases.

**Q: For the updated events engine, would it be possible to alert on a specific application taking action on a user?**\
**A:** Yes, as long as the application's action is logged, the updated events engine can be configured to alert based on these logs.

**Q: Will it ever be possible to have multi-user offboarding?**\
**A:** Multi-user offboarding might be feasible in the future but is likely to be limited due to risks, like accidentally locking people out of their accounts.

</details>

<details>

<summary>Resources Shared</summary>

* [**CIPP Development Guide: Setting Up for Local Development**](https://docs.cipp.app/dev-documentation/cipp-dev-guide/setting-up-for-local-development)\
  A detailed guide for setting up a local development environment for the CIPP React frontend. It includes recommendations for necessary tools and programs, such as Visual Studio Code, PowerShell, Git, Node.js, and .NET SDKs. The guide also covers the process of forking CIPP repositories and setting up the development environment.
* [**Secure Application Model – For the Layman (gavsto.com):** ](https://www.gavsto.com/secure-application-model-for-the-layman-and-step-by-step/)A comprehensive step-by-step guide by Gavin Stone on setting up the Secure Application Model for CIPP. It covers everything from being a Global Admin in your tenant to securing and managing API permissions. The guide is especially useful for those struggling with token generation and application setup in Azure AD
* [**Leveraging your CIPP-SAM app Blog Post (vdwegen.app):**](https://blog.vdwegen.app/posts/leveraging-cippsam-app/) This blog post discusses the core aspects of CIPP, focusing on the CIPP-SAM app. It explains that the app is created in the user's tenant during the first run of the Setup Wizard. The Setup Wizard stores several details of the app in a Keyvault resource in Azure, which are used for authentication​​.
* [**CDX Tenants for Testing**](https://cdx.transform.microsoft.com/): CDX tenants are recommended for testing in the context of CIPP development, offering a controlled environment for practical experimentation.
* [**MSPGeek Discord Community:**](https://discord.gg/mspgeek) It was mentioned that Microsoft is working on multi-factor authentication for third parties, with Duo already having an alpha version. Interested parties are suggested to inquire in the MSPGeek `#v-duo` channel for registration.
* [**Git MERGE vs REBASE: The Definitive Guide**](https://youtu.be/zOnwgxiC0OA?si=v5xMKkR9Ya4iXkpU)**:** A Git Tutorial for Beginners.

</details>
