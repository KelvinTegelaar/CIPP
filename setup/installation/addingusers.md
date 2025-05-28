# Adding users to CIPP

## User Roles within CIPP

CIPP supports three default roles for typical day-to-day permissions: `readonly`, `editor`, and `admin`. When adding yourself, `admin` is suitable for any tenant management you need to perform  outside of [managing your own partner tenant](owntenant.md).&#x20;

## Adding Users via the Management App for Hosted Deployments

Hosted clients can use the backend management system to add and remove users.

1. Go to management.cipp.app.
2. Navigate to the **User Management** tab.
3. Enter the UPN for the user in the **Email** field. Ensure this matches the user's M365 UPN.
4. Assign the appropriate roles for the user.

## Adding Users via Azure for Self Hosted Deployments

After deployment you'll need to give each user access. To generate an invite for a user follow these steps:

* Go to the Azure Portal.
* Go to your CIPP Resource Group.
* Select your CIPP Static Web App `CIPP-SWA-XXXX`.
* Select **Role Management** (Not IAM Role Management).
* Select **invite user**.
* Enter the UPN for the user. It is important to make sure that this matches the M365 UPN.
* Add the roles for the user.

