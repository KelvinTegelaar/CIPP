---
id: addingusers
title: Adding users to CIPP
description: Adding users
slug: /gettingstarted/postinstall/addingusers
---

## Hosted Clients

:::tip
Hosted clients can use the backend management system at management.cipp.app to add and remove users.
:::

## Adding Users

After deployment you'll need to give each user access. To generate an invite for a user follow these steps:

- Go to the Azure Portal.
- Go to your CIPP Resource Group.
- Select your CIPP Static Web App `CIPP-SWA-XXXX`.
- Select **Role Management** (Not IAM Role Management).
- Select **invite user**.
- Enter the UPN for the user. It is important to make sure that this matches the M365 UPN.
- Add the roles for the user.


 Currently CIPP supports three roles, `readonly`, `editor`, and `admin`. Further information on the roles and how to assign these is on the [Roles](/docs/user/gettingstarted/roles/) page.

