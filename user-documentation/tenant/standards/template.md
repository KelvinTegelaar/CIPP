# Add Standards Template

When creating a standard it is recommend to think about how you want your standards to be setup first. CyberDrain recommends splitting out standards per category, or service level. This prevents standards from becoming so large they become impossible to manage as too many items are in one standard. You can also split out categories such as "Intune Templates", "Entra Settings", "Managed Devices" etc.

For optimal performance and reliability we recommend to not have more than 40 standards per template.

{% stepper %}
{% step %}
### Set a Name for the Template

In the "Template Name" field, enter the name for this template
{% endstep %}

{% step %}
### Assign Template to Tenants

In the "Included Tenants" dropdown, select the tenant or tenants that you want this template to apply to. You can optionally select a tenant group to include. Including a tenant group will allow you to select tenant(s) or tenant group(s) to exclude.

{% hint style="info" %}
If you select "AllTenants", you will be shown an additional dropdown for "Excluded Tenants" to indicate any tenants or tenant groups that you don't want this standard to apply to.
{% endhint %}

{% hint style="warning" %}
Just under the tenant assignment dropdown(s), you will see a toggle called "Do not run on schedule". If you turn on this toggle, this template will only run manually. Leave this toggle off if you would like this standard to run every three hours.
{% endhint %}
{% endstep %}

{% step %}
### Add Standards to Template

Click the "+ Add Standards to this template" button in the upper right of the page. This will display a modal that has a complete list of all CIPP standards that can be configured. For more information on each standard, see the standards category pages.

{% hint style="info" %}
This page has a "Filter Standards" box that will return standards that match for the name or description.
{% endhint %}

Toggle on the "Add this standard to the template" for each desired template. Once completed, click the "Close" button on the modal.
{% endstep %}

{% step %}
### Configure All Standards

For each standard:

* Set the desired Action(s). For assistance on selecting which action, review [#actions](./#actions "mention").
* Each standard will then have the potential for additional fields that need to be set. Please review those fields and configure as desired.
* Click Save to store the configured settings. Click Cancel to clear out your changes.
{% endstep %}

{% step %}
### Save Template

Once all other steps are completed and all tenants show configured, click the "Save Template" button at the bottom of the left column that should now be enabled.
{% endstep %}
{% endstepper %}

### Standards Filtering

On both the add and edit standards template page, you will see options for how to filter the standards list added to the template. This is helpful for those templates that contain a lot of standards.

* Search: A search box at the top will allow you to do keyword searches for standards

#### View, Sort, and Filter Options

| Option          | Description                                                                                                                               |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| View            | With options for Cards and List, this will toggle how the table is presented to you                                                       |
| Sort By         | This will present you with options for which attribute to sort the view by. Options are Name or Date Added                                |
| Order           | This will alter the direction the selected "Sort By" is displayed. Options are "Ascending" and "Descending"                               |
| Categories      | This will allow you to pick from the CIPP Standards categories to display only those you wish to review.                                  |
| Impact          | This will allow you to pick from the CIPP defined standards Impact to display only those you wish to review.                              |
| Recommended By  | This will allow you to pick from the different organizations that recommend tenant settings to display only those you wish to review.     |
| Compliance Tags | This will allow you to pick from the different compliance frameworks to display only those you wish to review.                            |
| New (30 days)   | This toggle will allow you to display only those standards that have been recently added to CIPP for easy adoption of the latest updates. |

***

{% include "../../../.gitbook/includes/feature-request.md" %}
