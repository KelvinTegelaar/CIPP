---
id: addingusers
title: Post-Install Configuration
description: Adding users
slug: /gettingstarted/postinstall/addingusers
---

## Adding Users

:::caution Hosted requests

By default you do not have backend access to the hosted environment. You can request new user invites via email, or request backend access by contacting the helpdesk.
:::
After deployment you'll need to give each user access. To generate an invite for a user follow these steps:

- Go to the Azure Portal.
- Go to your CIPP Resource Group.
- Select your CIPP Static Web App `CIPP-SWA-XXXX`.
- Select **Role Management** (Not IAM Role Management).
- Select **invite user**.
- Enter the UPN for the user. It is important to make sure that this matches the M365 UPN.
- Add the roles for the user.


 Currently CIPP supports three roles, `readonly`, `editor`, and `admin`. Further information on the roles and how to assign these is on the [Roles](/docs/user/gettingstarted/roles/) page.

