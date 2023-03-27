---
id: conditionalaccess
title: Conditional Access Best Practices
description: Setup your Conditional Access policies for CIPP.
slug: /gettingstarted/postinstall/conditionalaccess
---

## Conditional Access best practices

To make sure CIPP is able to access your tenants securely we recommend the usage of Conditional Access. Both your, and your clients Conditional Access Policies will need to be configured for optimal usage.

### Setup of your conditional access policies

1. Browse to the [Conditional Access Policies](https://portal.azure.com/#view/Microsoft_AAD_ConditionalAccess/ConditionalAccessBlade/~/Policies) blade in Azure.
2. Exclude the CIPP service account from **each** existing policy.
3. Create a new policy and include the CIPP user. Enforce Azure Multi-factor Authentication for each logon, each application.
4. Save this policy under the name "CIPP Service Account Conditional Access Policy"

### Setup of clients conditional access policies

DAP and GDAP are affected by your clients conditional access policies. To make sure you can access your clients using your CIPP integration user we recommend excluding the MSP from the Conditional Access Policy per [Microsoft's Documentation](https://learn.microsoft.com/en-us/partner-center/gdap-faq#what-is-the-recommended-next-step-if-the-conditional-access-policy-set-by-the-customer-blocks-all-external-access-including-csps-access-aobo-to-the-customers-tenant)

1. Browse to your client's [Conditional Access Policies](https://portal.azure.com/#view/Microsoft_AAD_ConditionalAccess/ConditionalAccessBlade/~/Policies) blade in Azure.
2. For each policy listed. Add an exclusion to "Users and Groups" with the following settings:
	      - Guest or external users
		      - Service Provider Users
		      -  Selected, enter your tenantid. If you do not know what your tenant id is you can look this up at https://whatismytenantid.com 
