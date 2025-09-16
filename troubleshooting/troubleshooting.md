# Error Codes

Below are error codes that can occur in CIPP. Use this page to troubleshoot your received error code.

### Multi-Factor Authentication Troubleshooting

1. The account you use to generate your SAM tokens for CIPP must have Microsoft (Azure AD) MFA enabled, it can't use third-party MFA.
2. You can't have the `Allow users to remember multi-factor authentication on devices they trust` option enabled in the [classic MFA admin portal](https://account.activedirectory.windowsazure.com/UserManagement/MfaSettings.aspx) in the partner tenant.
3. Check our section on [conditionalaccess.md](../setup/installation/conditionalaccess.md "mention") on how to handle Conditional Access issues.

### Request not applicable to target tenant.

The required license for this feature is not available for this tenant. Check the tenant's license information to ensure that it has the necessary license for the requested operation. Most seen around security tasks that require M365 Business Premium or Entra ID P1.

### Neither tenant is B2C or tenant doesn't have premium license

This feature requires a P1 license or higher. Check the license information of your client's tenant to ensure that they have the necessary licenses.

### Response status code does not indicate success: 400 (Bad Request).

Error 400 occurred. There is an issue with the request. Most likely an incorrect value is being sent. If you receive this error with a permissions check, please redo your CIPP [sam-setup-wizard.md](../user-documentation/cipp/sam-setup-wizard.md "mention"). In the case of a CPV refresh you may get this code if you are using Duo as an MFA solution.

### _Provide valid credential._

This occurs when GDAP has been deployed, but the user is not in any of the GDAP groups.

### Subscription within the tenant has lapsed

There is no Exchange subscription available, so exchange connections are no longer possible.

### _User was not found._

The relationship between this tenant and the partner has been dissolved from the **client** side. Check the partner relationship information and ensure that it is still active. This error also occurs when a GDAP relationship has expired or is not configured correctly.

### _The user or administrator has not consented to use the application_

Multiple Potential Causes:

1. The user has not authorized the CIPP-SAM Application. Use the Settings -> Tenants -> Refresh button to refresh the permissions.
2. The user that was used for the CIPP authorization is a guest in this tenant
3. You have not added the user to the correct group(s) for CIPP to function. See [recommended-roles.md](../setup/installation/recommended-roles.md "mention") for more information.

### AADSTS50020 or AADSTS50177

Multiple Potential Causes:

* The user has not authorized the CIPP-SAM Application. Use the Settings -> Tenants -> Refresh button to refresh the permissions.
* The user that was used for the CIPP authorization is a guest in this tenant
* A Conditional Access policy may be blocking your access. Add your CSP tenant as a serviceProvider exception.
* You have not added the user to the correct group(s) for CIPP to function. See [recommended-roles.md](../setup/installation/recommended-roles.md "mention") for more information.

{% hint style="info" %}
**These errors may also present themselves something like the below. The steps above are still accurate in these cases:**

* The user you have used for your Secure Application Model is a guest in this tenant, or you are using GDAP and have not added the user to the correct group. Please delete the guest user to gain access to this tenant.
* User account from identity provider does not exist in tenant and cannot access the application in that tenant. The account needs to be added as an external user in the tenant first. Sign out and sign in again with a different Azure Active Directory user account.
{% endhint %}

### _"Request invalid or malformed" or "Request is malformed or invalid"_

You have not finished the CIPP Setup Wizard - CIPP cannot connect to the API with the current credentials.

NOTE: If you are receiving this during the CIPP Setup Wizard, copy the complete URL from the address bar in your browser and paste it into a new tab.

### AADSTS650051

This error can appear when performing a tenant access check. Try a GDAP check to see if you have the correct permissions in place, when you do try a CPV refresh, if the CPV refresh fails with an error it means we most likely do not have write access to the tenant.

### Insufficient access rights to perform the operation.

The user does not have sufficient access rights to perform the operation or is missing the necessary Exchange role. Check the user's access rights and Exchange role information, when using GDAP the user must be in the "Exchange Administrators" group.

### Device object was not found in the tenant 'xxxxxxxxxx' or 'UserPrincipal doesn't have the key ID configured'

When executing the first authorization for CIPP, a trusted device was used. This device has been deleted from the Intune portal. Reauthorization is required by using the Setup Wizard "First Setup" option.

### The provided grant has expired due to it being revoked, a fresh auth token is needed. The user might have changed or reset their password

The user that authorized the CSP or Graph API connection has had their password changed, sessions revoked, or account disabled. Reauthorization is required by using the Setup Wizard "Refresh Tokens for existing application registration" option.

### AADSTS50076: Due to a configuration change made by your administrator, or because you moved to a new location, you must use multi-factor authentication to access

This error can have three causes.

1. The user has not had MFA set up when performing authorization.
2. The client has Conditional Access policies blocking CIPP's access. See the chapter about [conditionalaccess.md](../setup/installation/conditionalaccess.md "mention")[Conditional Access](../setup/installation/conditionalaccess.md) to resolve.
3. The CIPP-SAM application in the customer tenant is disabled for login. This can be remediated by doing the following:
   1. Navigate to the customer tenant and log in either via the partner relationship or a customer admin account.
   2. Locate the CIPP-SAM app under Enterprise Application by removing the Application type filter.
   3. Under the properties tab, set "Enabled for users to sign-in?" to "Yes"
   4. Wait a few minutes and run a tenant access check.

### Presented multi-factor authentication has expired to the policies configured by your administrator, you must refresh your multi-factor authentication to access

This error occurs when a Conditional Access Policy has set the maximum lifetime. Suggested is to change the Conditional Access Policy to exclude "Service Provider users". See the chapter about how to resolve this under Conditional Access.

### The token has expired

The refresh token could not be retrieved and stored. The user must reauthorize.

### The property 'LastGraphError' cannot be found on this object

This error occurs when CIPP cannot write to the errors table - Clear your tenant cache from the settings menu and try again. You might also receive the error when a tenant access check has failed, the only way to clear the Last Graph Error is by removing the tenant cache.

### AADSTS7000222: The provided client secret keys for app {appid} are expired.

This occurs when the app has existed for more than 2 years and requires a new certificate or secret, or when a secret has been expired manually.

1. [Go to Azure Portal](https://portal.azure.com/#view/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/~/RegisteredApps)
2. Find and click on your app
3. Navigate to "Certificates & secrets"
4. Click "+ New client secret"
5. Enter a description, choose an expiration, and click "Add"
6. Copy the new client **secret value**
7. Go to CIPP -> Settings -> Setup Wizard
8. Use the option "Manually enter credentials"
9. Enter only the new secret and click Next.

### You discarded changes when syncing GitHub Repositories

<details>

<summary>Frontend</summary>

* Find your repository secret by going to your CIPP Repository, go to "settings" (cog icon along the top), click on "Secrets and variables" in the left menu, then "actions"

- Note down the name of your repository secret (Should be similar to "AZURE\_STATIC\_WEB\_APPS\_API\_TOKEN\_RANDOM\_WORD\_047D97703"

* Create a new file (name doesn’t matter as long as it ends in .yml) in your .github/workflows folder

- Copy the contents of [this file](https://files.gitbook.com/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FhV8luribpATiHNQ8bdts%2Fuploads%2Flm19bd0FqKW9IntaFJtN%2Fcipp-workflow.yml?alt=media\&token=e617df6b-2b95-4c1a-83d6-4c31e732e33f) into the new file you created

* Edit lines 25 and 44 to your repository secret name noted down in step 2 above

</details>

<details>

<summary>Backend</summary>

* Find your repository secret by going to your CIPP-API Repository, go to "settings" (cog icon along the top), click on "Secrets and variables" in the left menu, then "actions"

- Note down the name of your repository secret (Should be similar to "AZUREAPPSERVICE\_PUBLISHPROFILE\_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"

* Create a new file (name doesn’t matter as long as it ends in .yml) in your .github/workflows folder

- Copy the contents of this [file](https://files.gitbook.com/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FhV8luribpATiHNQ8bdts%2Fuploads%2F8BlraL9QHmZYlFWB1DOT%2Fcipp-api-workflow\[1].yml?alt=media\&token=4f5febb8-9fdc-4fb2-ac39-3b363529d167)[ into](https://files.gitbook.com/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FhV8luribpATiHNQ8bdts%2Fuploads%2F8BlraL9QHmZYlFWB1DOT%2Fcipp-api-workflow\[1].yml?alt=media\&token=4f5febb8-9fdc-4fb2-ac39-3b363529d167) the new file you created

* Edit lines 4 and 26 so they have your function name in

- Edit Line 29 to your repository secret name noted down in step 2 above

</details>

### My costs are very high, or the application is not responsive

This issue can occur when you restart the app during an important task. It's never recommended to restart the function app, and if you do unexpected results can happen. The Function Host uses something called durable functions, which when handled incorrectly can cause performance issues or increase costs due to looping tasks.

1. **Log In to Azure Portal**: Sign in to your Azure account at [portal.azure.com](https://portal.azure.com/).
2. **Navigate to Storage Account**: Go to 'Storage accounts' and select the storage account that starts with 'CIPP'
3. **Access Queues**: Inside the storage account click on Storage Explorer,
4. **Clear Data Individually**:
   * Delete each queue. This will automatically be recreated when required.
   * Delete all data in the "Blobs" section as well.
5. Restart the function app.

This procedure can also be used to safely restart the function app when required.

#### Credits

This troubleshooting document was created with the help of [Ashley Cooper](https://www.linkedin.com/in/adelnet/)
