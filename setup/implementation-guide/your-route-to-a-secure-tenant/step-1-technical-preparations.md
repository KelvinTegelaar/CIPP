# Step 1: Technical Preparations

Before we get started with implementing the standards and analyzing the information, we have to make a choice on how we'll approach these changes, as some of them might have slight user experience effects.

CyberDrain recommends implementing standards in a phased manner, with every tenant receiving the same standard over time, however, we also believe in accounting for licensing differences between clients. So to start, we'll implement CIPP's Dynamic Tenant Groups.

{% hint style="success" %}
At this point, we won't be making any customer affecting changes. Everything we implement is in "Monitor only" mode - This way we can collect information needed for our next steps.&#x20;
{% endhint %}

## Setting up Dynamic Tenant Groups

To setup Dynamic Tenant groups go to **Tenant Administration** -> **Tenants** -> **Groups.**

Click the toolbar button "Import Tenant Groups" to Import the CyberDrain recommended tenant groups. These tenant groups are based on license capabilities. For our standardization process we'll use three of these dynamic groups

### Dynamic Groups used

| Group name                                | Used for                                                                                                                  |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Not Intune and Entra Premium Capable      | Tenants that do not have a high enough license level to apply Drift Templates but need to receive a baseline of security. |
| Entra Premium Capable, Not Intune Capable | Tenants that have Entra ID P1, but do not have Intune licenses available, thus we do not apply workstation settings.      |
| Intune and Entra Premium Capable          | Tenants with all capabilities needed for the settings in our default baselines.                                           |

{% hint style="warning" %}
Because we are using these Dynamic Groups, new tenants with the correct license state will automatically be onboarded into our new standard, if you do not want new tenants onboarded, change this in CIPP -> Application Settings -> Partner Webhooks and select the checkbox "Exclude onboarded tenants from top-level standards.

### REMIND TO KELVIN: Rename Partner Webhooks to "Automated Onboarding" for UX
{% endhint %}

## Setting up the CIPP Secure Tenant Baseline

Next we'll head to **Tenant Administration** -> Standards & Drift -> Templates. Here we press the "Browse Catalog" button and select the "CIPP Standard Baselines" option in the dropdown. In this list we'll find multiple baselines

| Standard Name                                                                           | Purpose                                                                                                                                                                                                                                                                                |
| --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CIPP - Baseline for tenants with minimal licensing                                      | This baseline is applied to tenants without licensing to still achieve a high set of security procedures                                                                                                                                                                               |
| CIPP - Baseline for tenants with Conditional Access, but without Intune                 | This baseline is applied to tenants that have conditional access, and as such will receive Conditional Access Configuration too.                                                                                                                                                       |
| CIPP - Baseline for tenants with Business Premium or up                                 | This baseline is applied to tenants that have all required licensing for a fully secure tenant, and configures all possible products                                                                                                                                                   |
| CIPP - Baseline for tenants with Business Premium or up including workstation hardening | This baseline configures the same as the other business premium baseline, but also includes workstation hardening. This has a higher user impact and is out of scope for this guide. If you'd like to implement this baseline, please check out "Your Route to workstation hardening". |

Import the baselines that you are planning on using, each of these baselines will immediately be setup correctly after importing.

As these baselines are currently not making any changes, we recommend to run them now for a tenant we'll continue the implementation on. Do this by clicking on the actions button for the tenant and selecting "Run Template now" ## REMIND TO KELVIN: Change "Template Tenant" to Dynamic Groups if set.&#x20;

### Edit the baseline

There are cases in which you might want to edit the baseline immediately, for example you've already agreed with your customers to enable the Unified Audit log and don't need permission for these changes. If that's the case, edit the template and set each item you want automatically resolved to "Auto remediate when drift is detected" - This will force the tenant to be in sync with your template immediately.

