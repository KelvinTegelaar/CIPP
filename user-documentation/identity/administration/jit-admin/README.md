# JIT Admin

Ensure temporary admin accounts aren't left active. CIPP lets you create accounts with specific roles as needed and easily removes them automatically when no longer required. JIT Admin accounts will be displayed in the table.

### Column Details

| Column                   | Description                                             |
| ------------------------ | ------------------------------------------------------- |
| ID                       | GUID of the user                                        |
| Display Name             | Display name of the JIT admin user                      |
| User Principal Name      | UPN of the JIT admin user                               |
| Account Enabled          | Boolean for if the account is enabled                   |
| Jit Admin Enabled        | Boolean for if the JIT admin roles are enabled          |
| Jit Admin Expiration     | Expiration of the JIT admin                             |
| Member Of - Display Name | Display name of the admin role(s) the user is a part of |
| Member Of - Id           | GUID of the admin role(s) the user is a part of         |

{% hint style="warning" %}
This table doesn't utilize a per-row Actions column like many of the other tables introduced with CIPP v7.
{% endhint %}

***

### Feature Requests / Ideas

We value your feedback and ideas. Please raise any [feature requests](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=\&labels=enhancement%2Cno-priority\&projects=\&template=feature.yml\&title=%5BFeature+Request%5D%3A+) on GitHub.
