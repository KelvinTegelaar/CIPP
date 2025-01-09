# Executing the SAM Setup Wizard

{% hint style="info" %}
**Do not attempt to log in to CIPP with the CIPP Service Account you created.** Make sure you've gone through the steps of [inviting yourself into your CIPP instance](addingusers.md) either via Azure (self-hosted) or through the Management Portal (hosted).
{% endhint %}

## Walkthrough Video for Running the SAM Setup Wizard

***

{% embed url="https://app.guidde.com/share/playbooks/cHS8iUw2JCAGwiJxSnp7sp?origin=IEPB08VSavefFaCa9OSp3Y87aGu1" %}

{% hint style="danger" %}
**When using the SAM Wizard to create your CIPP-SAM application, it's important to remember the following:**

* You're using a chromium based browser. It **MUST** allow cookies and have any ad-blocker disabled for the duration of the wizard. Do not use in-private mode.
* When you're asked to authenticate during the SAM Setup Wizard, **remember to use to the CIPP service account credentials**. If you do not have a service account prepared you can do so now by going to the [Creating the CIPP Service Account](creating-the-cipp-service-account-gdap-ready.md) page and following the instructions there.
{% endhint %}

This guide walks you through the process from the video of executing the SAM Wizard inside CIPP for the first time, and has 3 options based on what you're looking to accomplish. In this example, we use the first-time setup option, but more details on additional options can be found in the sections below.

<table><thead><tr><th width="357">SAM Wizard Option</th><th>When to use</th></tr></thead><tbody><tr><td>I would like CIPP to create an application for me.</td><td>This will guide you through all the necessary steps for connecting to your tenants for the first time. Click the Start Setup Wizard button to start the process. </td></tr><tr><td>I would like to refresh my token or replace the user for previous token.</td><td>Select this option if you have used the incorrect account to setup the SAM wizard, need to renew tokens due to an expired password, or when you are instructed to do so by the Helpdesk.</td></tr><tr><td>I have an existing application and would like to manually enter or update my token.</td><td>This option is for advanced users and those following the migration manual in <a href="migrating-to-hosted-cipp.md">Migrating to a hosted instance of CIPP</a>.</td></tr></tbody></table>

## Walkthrough Steps for Running the SAM Setup Wizard

***

1. Once you've logged into your CIPP instance, navigate to `Settings` -> `SAM Setup Wizard`

![preview](https://storage.app.guidde.com/v0/b/guidde-production.appspot.com/o/quickguiddeScreenshots%2FIEPB08VSavefFaCa9OSp3Y87aGu1%2FcHS8iUw2JCAGwiJxSnp7sp%2FjN3yvLBGqe4e12772J9oZi_doc.png?alt=media\&token=88d39647-fa7c-4be5-b7a7-3341dc0dff96\&time=Tue%20Aug%2006%202024%2014:39:39%20GMT-0400%20\(Eastern%20Daylight%20Time\))

2. For the purposes of this walkthrough, we'll act as if this is your first time running through this process, and you'd like to follow CIPP's recommended settings by clicking `I would like CIPP to create an application for me`.&#x20;

![See the table above the walkthough for details on the other options you can choose](https://storage.app.guidde.com/v0/b/guidde-production.appspot.com/o/quickguiddeScreenshots%2FIEPB08VSavefFaCa9OSp3Y87aGu1%2FcHS8iUw2JCAGwiJxSnp7sp%2F3qrR2UFC94DwTZqUeAnfRn_doc.png?alt=media\&token=7b1f55c9-db17-4f05-b341-d6ace0a924b2\&time=Tue%20Aug%2006%202024%2014:39:39%20GMT-0400%20\(Eastern%20Daylight%20Time\))

3. On the next page, click on the `Start Setup Wizard` button.

![preview](https://storage.app.guidde.com/v0/b/guidde-production.appspot.com/o/quickguiddeScreenshots%2FIEPB08VSavefFaCa9OSp3Y87aGu1%2FcHS8iUw2JCAGwiJxSnp7sp%2FdiM5PqXfPZj1iSiMti8PPB_doc.png?alt=media\&token=28620037-8a95-44c0-9b9d-49b59545fdb7\&time=Tue%20Aug%2006%202024%2014:39:39%20GMT-0400%20\(Eastern%20Daylight%20Time\))

4. Copy the code from the returned step to your clipboard.

![preview](https://storage.app.guidde.com/v0/b/guidde-production.appspot.com/o/quickguiddeScreenshots%2FIEPB08VSavefFaCa9OSp3Y87aGu1%2FcHS8iUw2JCAGwiJxSnp7sp%2FhsfCwahyun5FmQsAJcnchb_doc.png?alt=media\&token=f6a160de-4939-4e9c-9c61-8279bd08d885\&time=Tue%20Aug%2006%202024%2014:39:39%20GMT-0400%20\(Eastern%20Daylight%20Time\))

5. Then click on the "HERE" link beside the code.

![preview](https://storage.app.guidde.com/v0/b/guidde-production.appspot.com/o/quickguiddeScreenshots%2FIEPB08VSavefFaCa9OSp3Y87aGu1%2FcHS8iUw2JCAGwiJxSnp7sp%2Fhg6Xor9YMkG3jniQ6cFAPc_doc.png?alt=media\&token=489c2701-5ff8-4ca9-b7b0-cd288ab746b4\&time=Tue%20Aug%2006%202024%2014:39:39%20GMT-0400%20\(Eastern%20Daylight%20Time\))

6. Enter the code we've copied in the previous step & click Next.

![preview](https://storage.app.guidde.com/v0/b/guidde-production.appspot.com/o/quickguiddeScreenshots%2FIEPB08VSavefFaCa9OSp3Y87aGu1%2FcHS8iUw2JCAGwiJxSnp7sp%2Fp5ME1UvQhFjvs1vekExqyr_doc.png?alt=media\&token=c897b30d-a6d1-4719-9b19-81b876758d31\&time=Tue%20Aug%2006%202024%2014:39:39%20GMT-0400%20\(Eastern%20Daylight%20Time\))

7. Select the option "Use another account".

![preview](https://storage.app.guidde.com/v0/b/guidde-production.appspot.com/o/quickguiddeScreenshots%2FIEPB08VSavefFaCa9OSp3Y87aGu1%2FcHS8iUw2JCAGwiJxSnp7sp%2F5AA5BmHeVtaeNbAdvWUwMj_doc.png?alt=media\&token=086de524-e4fc-438d-a869-e1100e54fc11\&time=Tue%20Aug%2006%202024%2014:39:40%20GMT-0400%20\(Eastern%20Daylight%20Time\))

8. **This is where we will enter the credentials you've created for the CIPP service account.** If you have not yet done that, follow the steps on the [Creating the CIPP Service Account](creating-the-cipp-service-account-gdap-ready.md) page. Remember that this account **MUST** use multifactor authentication.

![preview](https://storage.app.guidde.com/v0/b/guidde-production.appspot.com/o/quickguiddeScreenshots%2FIEPB08VSavefFaCa9OSp3Y87aGu1%2FcHS8iUw2JCAGwiJxSnp7sp%2FiyunsATsNKEgE6AKHuK5eY_doc.png?alt=media\&token=ff0bf9ed-86d2-4c8c-85c3-8ccdf0a25982\&time=Tue%20Aug%2006%202024%2014:39:40%20GMT-0400%20\(Eastern%20Daylight%20Time\))

9. Click on the "Continue" button. You may close this window when prompted.

![preview](https://storage.app.guidde.com/v0/b/guidde-production.appspot.com/o/quickguiddeScreenshots%2FIEPB08VSavefFaCa9OSp3Y87aGu1%2FcHS8iUw2JCAGwiJxSnp7sp%2FqwRYUepEHwjkEzRPHkM28r_doc.png?alt=media\&token=5c05596a-2095-4550-80ed-bde6caf508ea\&time=Tue%20Aug%2006%202024%2014:39:40%20GMT-0400%20\(Eastern%20Daylight%20Time\))

10. Back in CIPP, click on the link that now appears when you see we've arrived at step number 2.

![preview](https://storage.app.guidde.com/v0/b/guidde-production.appspot.com/o/quickguiddeScreenshots%2FIEPB08VSavefFaCa9OSp3Y87aGu1%2FcHS8iUw2JCAGwiJxSnp7sp%2FuWMoBJDLtE5U6CUP6o43Li_doc.png?alt=media\&token=c475131e-d940-4e8d-a143-ccfe83309ec5\&time=Tue%20Aug%2006%202024%2014:39:40%20GMT-0400%20\(Eastern%20Daylight%20Time\))

11. Login with the CIPP Service Account again.

![preview](https://storage.app.guidde.com/v0/b/guidde-production.appspot.com/o/quickguiddeScreenshots%2FIEPB08VSavefFaCa9OSp3Y87aGu1%2FcHS8iUw2JCAGwiJxSnp7sp%2FwtsU7NgDxSzEnQUh7PPK8M_doc.png?alt=media\&token=4aa50ce1-5905-4f88-b047-b615af42a76f\&time=Tue%20Aug%2006%202024%2014:39:40%20GMT-0400%20\(Eastern%20Daylight%20Time\))

12. Click on the `Accept` button. This will forward you to the page that reports the authentication status. You may close this page when instructed.

![preview](https://storage.app.guidde.com/v0/b/guidde-production.appspot.com/o/quickguiddeScreenshots%2FIEPB08VSavefFaCa9OSp3Y87aGu1%2FcHS8iUw2JCAGwiJxSnp7sp%2F14VtsFExYq3qBYps5WZ8hY_doc.png?alt=media\&token=08f3e5c9-e41d-4dd4-acb9-be9fb0f40f85\&time=Tue%20Aug%2006%202024%2014:39:43%20GMT-0400%20\(Eastern%20Daylight%20Time\))

13. Back in CIPP, you should see it says "Setup Completed". You can now click on the "Application Settings" button.

![preview](https://storage.app.guidde.com/v0/b/guidde-production.appspot.com/o/quickguiddeScreenshots%2FIEPB08VSavefFaCa9OSp3Y87aGu1%2FcHS8iUw2JCAGwiJxSnp7sp%2FrqUCQomo5WWjsPgYghRAdm_doc.png?alt=media\&token=4c15d798-f706-40ff-a091-760b58f49861\&time=Tue%20Aug%2006%202024%2014:39:42%20GMT-0400%20\(Eastern%20Daylight%20Time\))

14. &#x20;From there, you'll want to click on the "Run Permissions Check" button. This check should show a successful result when all steps have been performed.

![preview](https://storage.app.guidde.com/v0/b/guidde-production.appspot.com/o/quickguiddeScreenshots%2FIEPB08VSavefFaCa9OSp3Y87aGu1%2FcHS8iUw2JCAGwiJxSnp7sp%2FaoJqpzioF48aq66e4Xw39d_doc.png?alt=media\&token=98e3b4c0-1a48-4c4f-90cd-8c5a944ca784\&time=Tue%20Aug%2006%202024%2020:33:11%20GMT-0400%20\(Eastern%20Daylight%20Time\))

And that's it! Now you're ready to move on to [adding your tenants and consenting the application.](adding-tenants-and-consenting-the-cipp-sam-application.md)
