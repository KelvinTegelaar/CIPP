---
id: addyourself
title: Post-Install Configuration
description: How to configure CIPP after you've completed installation.
slug: /gettingstarted/postinstall/addyourself
---

At this point you should have completed all the steps in [manual installation or click-to-deploy installation](/docs/user/gettingstarted/installation/) and your deployment has succeeded. Any Red cross means your deployment has failed and you will need to delete the resource group and try deployment again.

## Add yourself as a user

- Go to the Azure Portal.
- Go to your CIPP Resource Group.
- Select your CIPP Static Web App `CIPP-SWA-XXXX`.
- Select **Role Management** (Not IAM Role Management).
- Select **invite user**.
- Enter the UPN for your user. This must match your M365 UPN.
- Add the `admin` role for your user.

After logging in succesfully, you may move on to setting up access to your tenants.
