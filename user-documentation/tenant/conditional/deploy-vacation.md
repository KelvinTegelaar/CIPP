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

