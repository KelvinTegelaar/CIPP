# CA Vacation Mode

### Overview

The "Add Vacation Mode" feature enables administrators to schedule tasks that temporarily modify Conditional Access (CA) policies for users. This feature is particularly useful for managing user access during vacation periods, ensuring that CA exclusions are applied and removed automatically according to a defined schedule.

## **Add Vacation Mode**

**Navigate** to **Tenant Administration** -> **Conditional Access** -> **CA Vacation Mode**.

Schedule tasks to add and remove users from CA exclusions for a specific period. Select the appropriate CA policy and specify the date range for the exclusions.

Fields are as follows:

* **Tenant**: Select the tenant for which the CA exclusions apply. The selected tenant determines the users and policies available for modification.
* **User**: Choose the user from the list of available users in the selected tenant. This specifies whose CA policies will be affected.
* **CA Policy**: Select the Conditional Access policy to be modified. This policy defines the access conditions that will be temporarily adjusted.
* **Scheduled Start Date**: Set the date and time for when the exclusion should begin. This is when the CA policy change will take effect.
* **Scheduled End Date**: Set the date and time for when the exclusion should end. This determines when the original CA policy settings will be restored.

Click `Set Vacation Mode` to finalize the schedule.

### Cancel Scheduled Vacation Mode

Sometimes you may need to cancel a scheduled vacation mode entry. To do this, click the Actions three dots menu and select `Cancel Vacation Mode` for the row you no longer need. Confirming will remove this scheduled entry from the task schedule.

***

### Feature Requests / Ideas

We value your feedback and ideas. Please raise any [feature requests](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=\&labels=enhancement%2Cno-priority\&projects=\&template=feature.yml\&title=%5BFeature+Request%5D%3A+) on GitHub.

