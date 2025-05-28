---
hidden: true
---

# Executing the Setup Wizard

{% hint style="danger" %}
* When you're asked to authenticate during the Setup Wizard, **remember to use to the CIPP service account credentials**. If you do not have a service account prepared you can do so now by going to the [Creating the CIPP Service Account](creating-the-cipp-service-account-gdap-ready.md) page and following the instructions there.
{% endhint %}

This guide walks you through the process of executing the Setup Wizard inside CIPP for the first time, and has 3 options based on what you're looking to accomplish. In this example, we use the first-time setup option, but more details on additional options can be found in the sections below.

<table><thead><tr><th width="357">SAM Wizard Option</th><th>When to use</th></tr></thead><tbody><tr><td>Create application for me and connect to my tenants</td><td>This will guide you through all the necessary steps for connecting to your tenants for the first time. Click the Next Step button to start the process. </td></tr><tr><td>Refresh Tokens for existing application</td><td>Select this option if you have used the incorrect account to setup the SAM wizard, need to renew tokens due to an expired password, or when you are instructed to do so by the Helpdesk.</td></tr><tr><td>Manually enter credentials</td><td>This option is for advanced users and those following the migration manual in <a href="migrating-to-hosted-cipp.md">Migrating to a hosted instance of CIPP</a>.</td></tr></tbody></table>

## Walkthrough Steps for Running the SAM Setup Wizard

***

1. Once you've logged into your CIPP instance, navigate to `CIPP` -> `SAM Setup Wizard`
2. For the purposes of this walkthrough, we'll act as if this is your first time running through this process, and you'd like to follow CIPP's recommended settings by clicking `Create application for me and connect to my tenants`.&#x20;
3. Click on the `Next Step` button.
4. Copy the code from the returned step to your clipboard.
5. Then click on the `Login to Microsoft` button.
6. Enter the code we've copied in the previous step & click Next.

![preview](https://storage.app.guidde.com/v0/b/guidde-production.appspot.com/o/quickguiddeScreenshots%2FIEPB08VSavefFaCa9OSp3Y87aGu1%2FcHS8iUw2JCAGwiJxSnp7sp%2Fp5ME1UvQhFjvs1vekExqyr_doc.png?alt=media\&token=c897b30d-a6d1-4719-9b19-81b876758d31\&time=Tue%20Aug%2006%202024%2014:39:39%20GMT-0400%20\(Eastern%20Daylight%20Time\))

7. Select the option "Use another account".

![preview](https://storage.app.guidde.com/v0/b/guidde-production.appspot.com/o/quickguiddeScreenshots%2FIEPB08VSavefFaCa9OSp3Y87aGu1%2FcHS8iUw2JCAGwiJxSnp7sp%2F5AA5BmHeVtaeNbAdvWUwMj_doc.png?alt=media\&token=086de524-e4fc-438d-a869-e1100e54fc11\&time=Tue%20Aug%2006%202024%2014:39:40%20GMT-0400%20\(Eastern%20Daylight%20Time\))

8. **This is where we will enter the credentials you've created for the CIPP service account.** If you have not yet done that, follow the steps on the [Creating the CIPP Service Account](creating-the-cipp-service-account-gdap-ready.md) page. Remember that this account **MUST** use multifactor authentication.

![preview](https://storage.app.guidde.com/v0/b/guidde-production.appspot.com/o/quickguiddeScreenshots%2FIEPB08VSavefFaCa9OSp3Y87aGu1%2FcHS8iUw2JCAGwiJxSnp7sp%2FiyunsATsNKEgE6AKHuK5eY_doc.png?alt=media\&token=ff0bf9ed-86d2-4c8c-85c3-8ccdf0a25982\&time=Tue%20Aug%2006%202024%2014:39:40%20GMT-0400%20\(Eastern%20Daylight%20Time\))

9. Click on the "Continue" button. You may close this window when prompted.

![preview](https://storage.app.guidde.com/v0/b/guidde-production.appspot.com/o/quickguiddeScreenshots%2FIEPB08VSavefFaCa9OSp3Y87aGu1%2FcHS8iUw2JCAGwiJxSnp7sp%2FqwRYUepEHwjkEzRPHkM28r_doc.png?alt=media\&token=5c05596a-2095-4550-80ed-bde6caf508ea\&time=Tue%20Aug%2006%202024%2014:39:40%20GMT-0400%20\(Eastern%20Daylight%20Time\))

10. Back in CIPP, click on the `Open Approval Linl` button that now appears when you see we've arrived at step number 2.
11. Login with the CIPP Service Account again.

![preview](https://storage.app.guidde.com/v0/b/guidde-production.appspot.com/o/quickguiddeScreenshots%2FIEPB08VSavefFaCa9OSp3Y87aGu1%2FcHS8iUw2JCAGwiJxSnp7sp%2FwtsU7NgDxSzEnQUh7PPK8M_doc.png?alt=media\&token=4aa50ce1-5905-4f88-b047-b615af42a76f\&time=Tue%20Aug%2006%202024%2014:39:40%20GMT-0400%20\(Eastern%20Daylight%20Time\))

12. Click on the `Accept` button. This will forward you to the page that reports the authentication status. You may close this page when instructed.

![preview](https://storage.app.guidde.com/v0/b/guidde-production.appspot.com/o/quickguiddeScreenshots%2FIEPB08VSavefFaCa9OSp3Y87aGu1%2FcHS8iUw2JCAGwiJxSnp7sp%2F14VtsFExYq3qBYps5WZ8hY_doc.png?alt=media\&token=08f3e5c9-e41d-4dd4-acb9-be9fb0f40f85\&time=Tue%20Aug%2006%202024%2014:39:43%20GMT-0400%20\(Eastern%20Daylight%20Time\))

13. Back in CIPP, you should see it says "Setup Completed".&#x20;
14. You should now navigate to Application Settings > Permissions.
15. &#x20;From there, you'll want to review the Permissions Check section. This check should show a successful result when all steps have been performed. If you need to run an updated check, click the Refresh button. If there are any errors, you can click the Details button and further information on the errors will be displayed, including the ability to repair any missing permissions.

### Next Steps

Your next step will depend on if you have existing GDAP relationships to add or if you need to do a fresh GDAP onboarding.

1. If you have existing GDAP relationships move on to [Adding Tenants & Consenting the CIPP-SAM Application](adding-tenants-and-consenting-the-cipp-sam-application.md).
2. If you need to do a fresh GDAP onboarding move on to [Tenant Onboarding](gdap-invite-wizard.md).
