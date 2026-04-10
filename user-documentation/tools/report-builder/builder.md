# Report Builder

This page allows you to generate a report. Reports are built by adding blocks to the report.

{% hint style="info" %}
Templates will use sample data from the tenant selected in [tenant-select.md](../../shared-features/menu-bar/tenant-select.md "mention") to display while building out the template. All Tenants may not display data as the report is split into individual tenants when scheduled.
{% endhint %}

## Adding a Block to a Report

{% stepper %}
{% step %}
### Select the Block Type

#### Block Types

* Custom Block: A freeform text box that you can use to add structure or narrative to the report.
* Test Result: A block tied to the test suite data collected by CIPP
* Database Data: A block that will pull data directly from the cache database.
{% endstep %}

{% step %}
### Select Block Configuration

For Test Result and Database Data blocks, you will have to select the source information along with toggling if you want remediation recommendations removed. If you add database blocks, you'll have an additional option to enable those items to be emailed as attachments.
{% endstep %}

{% step %}
### Click Add Block

Repeat as necessary before proceeding to reviewing the blocks and further organization.
{% endstep %}
{% endstepper %}

## Report Organization

### Block Header Info

The block header includes some basic information about the block.&#x20;

| Feature     | Description                                                                                                                                                                                                                             | Block Availability                                            |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Title       | The bock title.                                                                                                                                                                                                                         | All cards. Format may alter slightly between the block types. |
| Test Status | <p></p><ul><li>Informational: This test only output information for review.</li><li>Passed: The test included pass/fail criteria and the test passed</li><li>Failed: The test included pass/fail criteria and the test failed</li></ul> | `Test Result`                                                 |
| Card Status | <p></p><ul><li>Live: This card is the live result of the test data</li><li>Edited: This card has been edited and is no longer linked to the live test data.</li></ul>                                                                   | `Test Result`                                                 |
| Database    | Icons indicating that the card is from a Database, whether it is `Text`, `CSV`, or `JSON`, and the number of rows in the data.                                                                                                          | `Database`                                                    |

### Block Actions

Each card has actions that can help you with organizing the report layout:

* Edit: Available on cards that draw from test data, this action will convert the card to static information and allow you to edit the presented text.
* Revert to Live Data: Available on cards that draw from test data that have been edited. This will revert the card to its default state.
* Refresh Data: Available on Database cards, this will pull in the latest data from the database.
* Up/Down Arrows: This will move the specific card up or down in the layout.
* Delete: This will delete the specific card from the report template.

### Database Card Controls

Database cards will allow you to toggle the display between `TEXT`, `CSV`, and `JSON` by clicking the chip next to the card title. You will also be able to select the columns from the database that display by checking and unchecking them.&#x20;

## Report Actions

| Action        | Description                                                                                                                                                                                                                              |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Save Template | Saves the current state of the template                                                                                                                                                                                                  |
| Schedule      | Opens a modal that allows you to schedule the report recurrence and any notifications that you want when the report is completed. See [#report-scheduling-options](builder.md#report-scheduling-options "mention") for more information. |
| Download PDF  | Downloads a PDF of the report.                                                                                                                                                                                                           |
| Preview PDF   | Will open a preview view of the PDF so you can determine if the report looks how you want it to.                                                                                                                                         |

### Report Scheduling Options

#### Task Name

You can adjust the name of the task that will be visible in the [scheduler](../scheduler/ "mention")

#### Recurrence

Select how often you want the report to run. The start time for the interval is when the schedule is set. If you select Once the report will generate now and then not again.

#### Post Execution Actions

* **Email:** The email address configured in [notifications.md](../../cipp/settings/notifications.md "mention") will receive an email with the report body as the message. Any CSV/JSON marked to include will be sent as attachments.
* **PSA:** The ticket body will be the report body. Raw CSV/JSON will not be attached.
* **Webhook:** A JSON payload consisting of the task metadata and results

***

{% include "../../../.gitbook/includes/feature-request.md" %}
