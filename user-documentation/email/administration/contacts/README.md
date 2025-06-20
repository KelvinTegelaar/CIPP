---
description: View & Edit Contacts in your M365 tenants
---

# Contacts

This page provides information on Exchange contacts.

### Action Buttons

{% content-ref url="add.md" %}
[add.md](add.md)
{% endcontent-ref %}

### Table Details

The properties returned are for the Graph resource type `contact`. For more information on the properties please see the [Graph documentation](https://learn.microsoft.com/en-us/graph/api/resources/contact?view=graph-rest-1.0#properties).

| Fields       | Description                                                                               |
| ------------ | ----------------------------------------------------------------------------------------- |
| Display Name | The display name of the contact.                                                          |
| Mail         | The e-mail address of the contact.                                                        |
| ID           | The GUID of the contact.                                                                  |
| Given Name   | The first name of the contact.                                                            |
| Surname      | The last name of the contact.                                                             |
| Addresses    | A button that will pop open a table containing the addresses of the contact.              |
| Phones       | A button that will pop open a table containing the various phone numbers for the contact. |

### Table Actions

<table><thead><tr><th>Action</th><th>Description</th><th data-type="checkbox">Bulk Action Available</th></tr></thead><tbody><tr><td>Edit Contact</td><td>Opens the <a href="edit.md">page to edit</a> the selected contact</td><td>true</td></tr><tr><td>Delete Contact</td><td>Opens a modal to confirm you want to delete the selected contact.</td><td>false</td></tr></tbody></table>



***

{% include "../../../../.gitbook/includes/feature-request.md" %}
