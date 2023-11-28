# GDAP Troubleshooting

### Groups

When you received the error that only x amount of groups were found, or that the group is not assigned to a user it can mean two things;

* You migrated using different tools, such as Microsoft Lighthouse.
* You didn't assign the groups to the user after migrating.

Make sure you assign the correct groups to the CIPP service account. For more information see our best practices [here](../installation/samwizard.md#authorization-best-practices-for-cipp).

### Auto Extend

Auto Extend is only available for relationships without the Global Administrator role. If your relationship contains the Global Administrator role you cannot enable this feature. this measn that you will need to renew the relationship by reinviting the tenant every 2 years.

