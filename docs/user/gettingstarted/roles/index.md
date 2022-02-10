---
id: roles
title: Roles
description: How to grant users access to the CIPP App
slug: /gettingstarted/roles
---

CIPP features a role management system which utilises the [Roles feature of Azure Static Web Apps](https://docs.microsoft.com/en-us/azure/static-web-apps/authentication-authorization?tabs=invitations#roles). The roles available in CIPP are as follows:

|  Role Name              | Description                                                                     |
| ----------------------- | ------------------------------------------------------------------------------  |
| readonly                | Only allowed to read and list items and send push messages to users             |
| editor                  | Allowed to perform everything, except editing tenant exclusions and standards   |
| admin                   | Allowed to perform everything                                                   |

You can assign these roles to users using the [Role Management system of Azure Static Web Apps](https://docs.microsoft.com/en-us/azure/static-web-apps/authentication-authorization?tabs=invitations#role-management)

:::tip User Acceptance
After invite link is sent to the user, they must click on it to accept the invite and gain access to the app.
:::

To assign a role to a user you would follow these steps:

* Go to the Azure Portal.
* Go to your CIPP Resource Group.
* Select your CIPP Static Web App `CIPP-SWA-XXXX`.
* Select **Role Management** (Not IAM Role Management).
* Select **invite user**.
* Add the roles for the user.

