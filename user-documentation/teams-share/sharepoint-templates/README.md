# SharePoint Templates

The SharePoint Templates page lists the saved SharePoint provisioning templates in CIPP. Each template defines one or more site templates and their document libraries, which can be deployed to tenants to provision SharePoint sites in a consistent way. From here you can create, edit, copy, and delete templates, as well as deploy a template to one or more tenants.

## Page Actions

<details>

<summary>Create New Template</summary>

Opens the [create-new-template.md](create-new-template.md "mention") page.

</details>

<details>

<summary>Deploy Template</summary>

Deploying pushes a saved template out to your tenants, provisioning the sites, document libraries, and permissions it defines. Deployment is started from the **Deploy Template** button on the SharePoint Templates page, which opens a side panel.

1. Select **Deploy Template** on the SharePoint Templates page to open the deployment panel.
2. **Select Template** — choose the saved template you want to deploy.
3. **Select Tenants** — choose one or more tenants to deploy the template to.
4. **Site / Team Owner** — choose the user who will be set as the owner of every site or Team the template creates. The list shows enabled, licensed users from the selected tenant, and the chosen owner must have a licence. This owner is applied to every tenant you selected, so it needs to be a valid licensed user in each of them.
5. Select **Deploy Template** to queue the deployment. The button only becomes available once a template, at least one tenant, and an owner have been chosen.
6. Follow the **Deployment Progress** view, which updates live as each site, library, and permission is provisioned. When it finishes, you can select **Deploy Again** to run another deployment, or **Close** to dismiss the panel.

</details>

## Table Details

| Column              | Description                                                                         |
| ------------------- | ----------------------------------------------------------------------------------- |
| Template Name       | The name given to the SharePoint template.                                          |
| Site Template Count | The number of site templates defined within this template.                          |
| Library Count       | The total number of document libraries across all of the template's site templates. |
| Updated By          | The user who last updated the template.                                             |
| Timestamp           | The date and time the template was last modified.                                   |

## Table Actions

<table><thead><tr><th>Action</th><th>Description</th><th data-type="checkbox">Bulk Action Available</th></tr></thead><tbody><tr><td>Edit Template</td><td>Opens the selected template in the same editor as <a data-mention href="create-new-template.md">create-new-template.md</a> so you can change its settings.</td><td>true</td></tr><tr><td>Copy Template</td><td>Opens the editor pre-filled from the selected template so you can save it as a new template under a different name.</td><td>true</td></tr><tr><td>Delete Template</td><td>Permanently removes the selected template.</td><td>true</td></tr><tr><td>More Info</td><td>Opens the Extended Info flyout with the full details for the selected row.</td><td>false</td></tr></tbody></table>

***

{% include "../../../.gitbook/includes/feature-request.md" %}
