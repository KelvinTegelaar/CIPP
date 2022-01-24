---
id: roles
title: Roles
description: How to grant users access to
slug: /gettingstarted/roles
---

CIPP features a role management system which utilises the [Roles feature of Azure Static Web Apps](https://docs.microsoft.com/en-us/azure/static-web-apps/authentication-authorization?tabs=invitations#roles). The roles we have configured are as follows:

- **readonly** - a user that is only allowed to read and list items, and send push messages to users.
- **editor** - a user that is allowed to perform everything, except editing tenant exclusions and standards.
- **admin** - a user that is allowed to perform everything.

Adding these roles is done using the [Role Management system of Azure Static Web Apps](https://docs.microsoft.com/en-us/azure/static-web-apps/authentication-authorization?tabs=invitations#role-management). To assign a role to a user you would follow these steps:

- Go to the Azure Portal
- Go to your CIPP Resource Group
- Click on CIPP-SWA-XXXX
- Click on Role Management (Not IAM. Role Management.)
- Click invite user
- Add the roles for the user.
