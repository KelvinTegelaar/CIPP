# Custom Tests

This page will display any custom tests that you have previously created for use in the [dashboard](../../dashboard/ "mention") or [builder](../../tenant/standards/bpa-report/builder/ "mention").

## Feature Walkthrough

{% @storylane/embed subdomain="app" linkValue="qevotii3ats1" url="https://app.storylane.io/share/qevotii3ats1" %}

## Table Details

| Column                | Description                                                                                                                                                                                  |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Script Name           | The display name of the script.                                                                                                                                                              |
| Description           | The description set on the script.                                                                                                                                                           |
| Enabled               | Whether the test runs with the rest of the tests on schedule.                                                                                                                                |
| Alert On Failure      | Whether CIPP sends an alert when there is a failure.                                                                                                                                         |
| **Return Type**       | `JSON` or `Markdown`                                                                                                                                                                         |
| Category              | Existing Options: `License Management`, `Security`, `Compliance`, `User Management`, `Group Management`, `Device Management`, `Guest Management`, `General`, or any custom created category. |
| Pillar                | Classifies which test category this belongs to. One of `Identity`, `Devices`, `Data`                                                                                                         |
| Risk                  | The risk label associated with the script. One of `Low`, `Medium`, `High`, `Critical`                                                                                                        |
| User Impact           | Classifies the impact to the end user. One of `Low`, `Medium`, or `High`                                                                                                                     |
| Implementation Effort | Classifies the effort to remediate a failed test. One of `Low`, `Medium`, or `High`                                                                                                          |
| Version               | The version of the script. Latest is shown by default.                                                                                                                                       |
| Created By            | The UPN of the user that created the script.                                                                                                                                                 |
| Created Date          | Relative time since the script was created                                                                                                                                                   |

## Table Actions

<table><thead><tr><th>Action</th><th>Description</th><th data-type="checkbox">Bulk Action Available</th></tr></thead><tbody><tr><td>Edit Test</td><td>Opens the <a data-mention href="add.md">add.md</a> page with the selected test populated</td><td>false</td></tr><tr><td>View Versions</td><td>Opens <a data-mention href="versions.md">versions.md</a> for the selected test script</td><td>false</td></tr><tr><td>Enable Test</td><td>Enables the selected test(s) to run with the rest of the test suite.</td><td>true</td></tr><tr><td>Disable Test</td><td>Disables the selected test(s) from running</td><td>true</td></tr><tr><td>Enable Alerts</td><td>Enables alerts for failed test runs of the selected test(s)</td><td>true</td></tr><tr><td>Disable Alerts</td><td>Disables alerts for failed test runs of the selected test(s)</td><td>true</td></tr><tr><td>Delete Test</td><td>Permanently deletes all versions of the selected test(s)</td><td>true</td></tr></tbody></table>

***

{% include "../../../.gitbook/includes/feature-request.md" %}
