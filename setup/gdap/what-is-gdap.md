# What is GDAP

A temporary addition to CIPP is the GDAP Migration tool. The GDAP migration tool was created in collaboration with Microsoft's GDAP team. Please follow the instructions on this page to the letter to achieve a successful migration to GDAP.

The GDAP migration tool will function until November 2023. Migrations after this date will need to be performed manually.

### What is GDAP

{% hint style="info" %}
The set migration dates have been changed by Microsoft. Find the latest information [here](https://learn.microsoft.com/en-gb/partner-center/announcements/2022-october#17)
{% endhint %}

Accessing tenants as a Microsoft Partner is currently done through "DAP". DAP stands for delegated access permissions. DAP gives you Global Administrator access to all your tenants, but has limitations. Microsoft has decided to make DAP more secure, and also more functional. GDAP allows you to access the tenants according to the role you've set. This mean you are able to give one employee "helpdesk" access, and another employee "security" access.

GDAP requires a mapping between roles and security groups in your partner tenant. CIPP creates these groups and mappings for you. Do not select all roles - This is not supported by Microsoft and CIPP. Selecting all roles(or most roles) will guarantee unexpected results. Carefully consider which roles are required for your deployment.

GDAP relationships have a maximum age. Every 2 years(730 days) the relationships will need to be renewed. This currently is a manual action that needs to be performed by the tenant administrator.

GDAP will be a requirement from February 1st for Microsoft Partners, and you will not be able to make new DAP relationships from that point forward.

After the migration date of March 31st, new GDAP relationships will not be created in an automated fashion, and you must log onto the target tenant itself to accept GDAP invites. This is very time consuming so it's recommended to migrate to GDAP now.
