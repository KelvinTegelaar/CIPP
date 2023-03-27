---
id: samwizard
title: SAM Wizard
description: Setup access to my clients
slug: /gettingstarted/postinstall/samwizard
---

# Setup

This section describes the best practices and recommended setup for CIPP, including account usage, multi factor authentication, and DAP/GDAP groups. This section also describes the recommended setup for Conditional Access Policies. When this document has not been implemented you could encounter issues with the CSP, Graph, or Exchange sections of CIPP.

##  Authorization best practices for CIPP

to setup the Graph API, CSP, and Exchange integration CIPP requires a minimum level of permissions. We recommend to setup the account as follows

1. Create a new account. Recommended to name this "CIPP Integration" and give it the username "CIPP@domain.tld"
	a. This account must be a Global Administrator while setting up the integration. These permissions may be removed after the integration has been setup.
2. Add the account to the correct groups
 - If you are using DAP The CIPP user must be added to the "AdminAgents" group. 
 - If you are using GDAP, the CIPP user must be added to the groups you've assigned for GDAP has made. The minimum permissions CIPP needs to function are:
	-   Application Administrator
	-   User Administrator
	-   Intune Administrator
	-   Exchange Administrator
	-   Security Administrator
	-   Cloud App Security Administrator
	-   Teams Administrator
	-   Sharepoint Administrator
	-   Privileged Authentication Administrator (Required to revoke sessions, reset admin passwords, and set up application policies)


3. This account must have **Microsoft** multi-factor authentication enforced for each logon, either via Conditional Access when available or via [Per User MFA](https://account.activedirectory.windowsazure.com/UserManagement/MultifactorVerification.aspx) when Conditional Access is not available. 
- You may not use any other authentication provider than Microsoft for this account. Duo or other providers will not work. For more information on this see [this](https://learn.microsoft.com/en-us/partner-center/partner-security-requirements-mandating-mfa#supported-mfa-options)
- The CIPP service account requires MFA for each logon. That means no excluded locations may be applied nor authentication length policies. See the chapter about conditional access to make sure your policies are configured correctly.
