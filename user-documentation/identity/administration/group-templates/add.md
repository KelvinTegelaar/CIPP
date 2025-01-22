# Add Group Template

This page will allow you to create a group template for ease of deployment to your clients' tenants. Enter the group's "Display Name", "Description", and "Username" before selecting the radial for the group type you'd like to set.

### Additional Group Type Settings

| Group Type                  | Additional Settings                                                                                                                       |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Azure Role Group            | None                                                                                                                                      |
| Security Group              | None                                                                                                                                      |
| Microsoft 365 Group         | None                                                                                                                                      |
| Dynamic Group               | Dynamic Group Parameters (see below)                                                                                                      |
| Dynamic Distribution Group  | Dynamic Group Parameters ( see below)                                                                                                     |
| Distribution List           | Let people outside the organization email the group - Allows the group to receive messages from both inside and outside the organization. |
| Mail Enabled Security Group | None                                                                                                                                      |

**Dynamic Group Parameters:** For Dynamic Groups, a text box for entering the dynamic group parameters syntax becomes available e.g.: `(user.userPrincipalName -notContains "#EXT#@") -and (user.userType -ne "Guest")`.

***

{% include "../../../../.gitbook/includes/feature-request.md" %}
