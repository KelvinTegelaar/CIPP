# Add Group

On this page you will enter all of the necessary information to create a group.

| Field               | Description                                                                                       |
| ------------------- | ------------------------------------------------------------------------------------------------- |
| Display Name        | Set the display name that you want visible for this group                                         |
| Description         | Set the description for the group                                                                 |
| Username            | Set the group's username. This will be used in setting the mail nickname, e-mail address, etc.    |
| Primary Domain Name | Select the domain from the dropdown that you wish to set as the primary domain name for the group |
| Owners              | Select one or more owners of the group from the dropdown                                          |
| Members             | Select one or more members of the group from the dropdown                                         |

### Group Types

| Type                        | Additional Settings                                                                                                                       |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Azure Role Group            | None                                                                                                                                      |
| Security Group              | None                                                                                                                                      |
| Microsoft 365 Group         | None                                                                                                                                      |
| Dynamic Group               | Dynamic Group Parameters (see below)                                                                                                      |
| Dynamic Distribution Group  | Dynamic Group Parameters (see below)                                                                                                      |
| Distribution List           | Let people outside the organization email the group - Allows the group to receive messages from both inside and outside the organization. |
| Mail Enabled Security Group | None                                                                                                                                      |

**Dynamic Group Parameters:** For Dynamic Groups, a text box for entering the dynamic group parameters syntax becomes available e.g.: `(user.userPrincipalName -notContains "#EXT#@") -and (user.userType -ne "Guest")`.

***

{% include "../../../../.gitbook/includes/feature-request.md" %}
