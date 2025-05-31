---
description: First things to check out after setting up CIPP.
---

# Recommended First Steps

Welcome to the post-setup implementation guide for CIPP! In this guide, you will learn how to navigate and configure various settings within the CIPP application. Let's discover some of the key features of CIPP and see how to use them.&#x20;

{% hint style="info" %}
This guide is not meant to be exhaustive, but rather point you towards other pages in the documentation for a deeper dive. Click any of the available links for more information on each page.
{% endhint %}

{% hint style="success" %}
Select [Setup Wizard](../installation/executing-the-setup-wizard.md) from CIPP settings for easy set up of several of the basics needed to operate CIPP.
{% endhint %}

## Tenant Navigation

Using the [Tenant Selector](../../user-documentation/shared-features/menu-bar/tenant-select.md) at the top you can switch tenants at any time. This allows you to dynamically choose what you're working on. You can also use the Tenant Selector to select "All Tenants" which allows you to see all your tenants in one swoop.

## Personalization

Let's setup some personal things first. The [User Preferences](../../user-documentation/shared-features/menu-bar/user-settings.md) section has your personal preferences and profile information. Let's start by setting up CIPP the way you like it.

## Change How CIPP Looks to You

Click the [Display Mode](../../user-documentation/shared-features/menu-bar/display-mode.md) toggle to switch to your preferred mode to display CIPP.

## Application Settings

Let's go check out some of the application settings next.

### Password Styles

We have two style of passwords we can generate when creating a new user, or resetting a password, the classic password with capitalization, numbers, and symbols. You can also choose the modern passphrase style password. This is a more readable and often stronger password than randomly generated characters

Let's select the "Correct-Battery-Horse" option, which are passphrases.

### DNS Resolver

You can choose the DNS resolver CIPP uses. By default, the resolver is Google.

### Access Checks

CIPP can help you figure out why you can't access a tenant by executing an access check. These checks can help you detect issues with GDAP, access rights, or general M365 issues. These checks are done on the [Permissions ](../../user-documentation/cipp/settings/permissions.md)tab of CIPP Application Settings.

### Tenants Tab

Talking about tenants, let's go check out our internal tenant list. We see all our tenants on the [Tenants ](../../user-documentation/cipp/settings/tenants.md)tab of CIPP Application Settings.

We can exclude a tenant from CIPP. This means the tenant will not be connected to CIPP, and we will not be able to make any changes to this tenant. This is done from the Actions column for individual tenants or the Bulk Actions button when multiple tenants are checked.

### Notifications Tab

Navigate to the [Notifications ](../../user-documentation/cipp/settings/notifications.md)tab.

CIPP can send many types of notifications, in this screen we can do some of the basic setup of these notifications to filter them or select where they need to go.

## User Administration

Let's see how CIPP works in action. We'll navigate to the Identity Management > Administration > [Users ](../../user-documentation/identity/administration/users/)section to start managing users.

## Bulk Actions

Most pages in CIPP work by showing you a table layout. The table allows you to filter data, export it, or execute actions. Let's try executing some bulk actions.

Setting the checkbox means we are going to take a bulk action on that specific row in our table.

You'll find all available actions in the "Bulk Actions" dropdown. Each page has different actions.

Let's look at some more of the options we have. Most tables in CIPP have a three-dot action menu as the right-hand visible column. This three-dot menu gives you a dropdown menu with options and information about that specific row.

For users, we have a lot of actions we can take. We could reset passwords or even add them to groups. Let's not bother our users and check out some other parts of CIPP for now.

## Tools

Navigate to the [Tools ](../../user-documentation/tools/)section.

### Graph Explorer

Select Tools > Tenant Tools > [Graph Explorer](recommended-first-steps.md#graph-explorer).

CIPP has the option to report on anything inside of the Graph API. even when there is not a direct page created for it. You can use the Graph Explorer option to craft your own report. Let's try using the All User with Email Addresses report.

Execute the query by clicking "Apply Filter".

The report allows you to check this data as raw as it comes back from the API. you can also create an export using the PDF or CSV buttons.

## Standards

Let's go check out the standards next by navigating to Tenant Administration > Administration > Standards.

Standards allow you to create a baseline for a tenant. This means you can easily deploy your wanted settings to any tenant. With how important Standards are to the function and power of CIPP, we'll take a deeper dive in [Standards Setup](standards-setup.md), or you can review the full [Standards ](../../user-documentation/tenant/standards/)documentation.

### Best Practice Analyser

Let's go check out some reporting. Click on Tenant Administration > Administration > Standards > [Best Practice Analyser](../../user-documentation/tenant/standards/bpa-report/) next.

The BPA gives you the ability to zoom in on your tenants and their current state. You can use custom reports or use the included examples to tell your clients what actions they need to take to become more secure.

## Alerts

Talking about best practices. You want to be notified when something goes wrong, so let's look at some of the alert options available in Tenant Administration > Administration > [Alert Configuration](../../user-documentation/tenant/administration/alert-configuration/).

The documentation linked above has lots of information on the two types of alerts you can configure in CIPP:&#x20;

* Audit Log Alert: Microsoft Audit Log received alert
* Scripted CIPP Alert: Data processed by CIPP on a schedule

## Tenant Administration

Let's try managing our tenants next. Click on Tenant Administration > Administration > [Tenants](../../user-documentation/tenant/administration/tenants/).

### Tenant Overview

The tenant overview shows you your tenant names, default domains, and direct links to each of the portals. You can use these links to directly manage that tenant using GDAP.

### Tenant Actions

We can also take actions on the tenants. Let's try using the three-dot icon in the Actions column to do so.

You'll find some more information about the tenant in this flyout and you can edit a tenant. This allows you to set a tenant friendly name for CIPP, manage CIPP tenant group memberships, and more!

## Conclusion

There are so many more features, but now that you've understood the basics you can find more of the features yourself. We hope you enjoyed the walkthrough of the basic settings. You're now ready to deep dive into the platform.
