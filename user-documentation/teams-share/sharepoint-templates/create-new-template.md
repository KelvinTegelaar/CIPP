# Create New Template

This page is used to create a new SharePoint provisioning template, or to edit or copy an existing one. A template defines one or more site templates, each with its own document libraries and permissions, which can later be deployed to your tenants to provision SharePoint sites in a consistent way. The page opens in one of three modes depending on how you reach it: **Create** a new template, **Edit** an existing template in place, or **Copy** an existing template into a new one. When copying, the name is pre-filled with a "(Copy)" suffix and saving creates a separate template rather than overwriting the original.

## Template Settings

These settings apply to the template as a whole.

| Setting                            | Description                                                                                                                                                        |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Template Name                      | The name for the template. Required.                                                                                                                               |
| Create as Microsoft Teams          | When enabled, each site is provisioned as a Microsoft Teams team rather than a standalone SharePoint site.                                                         |
| Create groups if they do not exist | When enabled, any groups referenced by the template's permissions that do not already exist in the target tenant are created as security groups during deployment. |
| Skip if exists                     | When enabled, if a site or team with the same name already exists in the target tenant it is left untouched, and no libraries or permissions are applied to it.    |

## Site Templates

The Site Templates section is a card canvas where you define each SharePoint site the template should provision. Select **Add New Site Template** to add a site template card; there is no limit on the number you can add, and any card can be removed from its options ("...") menu.

Each site template has:

* **A name**, entered in the card header, which becomes the name of the provisioned site.
* **A mandatory site-level permission object.** Every site template must have at least one root-level permission grant. Until it does, the card is outlined in red and the Save button stays disabled. Add or edit it from the card's options menu.
* **One or more document libraries**, described below.

## Document Libraries

Within each site template card, select **Add Library** to add a document library. Each library has a name. From a library's options ("...") menu you can configure unique permissions for that library; a lock icon marks any library that carries its own permissions. A library with no unique permissions inherits the permissions of its site template.

The **Add Column** and **Manage Metadata** options in the library menu are placeholders and are not yet available; columns and metadata can be added to the deployed libraries later.

## Permissions

Permissions are configured as permission objects at two levels: on a site template (site-level, mandatory) and on individual libraries (optional). Both use the same editor, and each entry is a pairing of a group and a permission level.

| Field              | Description                                                 |
| ------------------ | ----------------------------------------------------------- |
| Group Display Name | The display name of the group to grant access to. Required. |
| Permission Level   | The level of access to grant the group. Required.           |

Groups are referenced by display name only. During deployment the name is matched against each target tenant, so the same template can be deployed anywhere without editing. Enable **Create groups if they do not exist** in Template Settings to have any missing groups created automatically.

The available permission levels are SharePoint's built-in levels:

| Permission Level | Access granted                                         |
| ---------------- | ------------------------------------------------------ |
| Read             | View items.                                            |
| Contribute       | View, add, update, and delete items.                   |
| Edit             | Contribute access plus the ability to manage lists.    |
| Design           | Edit access plus the ability to approve and customise. |
| Full Control     | Full administrative control.                           |

## Quick Stats

A Quick Stats panel beside the builder shows a live count of the Site Templates, Libraries Defined, and Permission Grants currently in the template. The counts update as you build.

## Saving

Select **Save Template** to store the template. Save only becomes available once the template is valid: a template name is set and every site template has at least one root-level permission. Saving a new template or a copy creates a new template, while saving an edit updates the existing template in place. You are then returned to the SharePoint Templates list.

***

{% include "../../../.gitbook/includes/feature-request.md" %}
