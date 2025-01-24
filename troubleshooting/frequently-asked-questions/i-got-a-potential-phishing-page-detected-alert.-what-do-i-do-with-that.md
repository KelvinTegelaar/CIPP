# I got a "Potential Phishing page detected" alert. What do I do with that?

Introduced in v5.0.0, CIPP has a Standard that can be enabled called "Enable Phishing Protection system via branding CSS". This standard is what generated that alert.

## Overview

### What does the standard do?

{% hint style="info" %}
This is intended to be a high-level review. If you want to go deep in the technical weeds, the standard is based on a project called Clarion by HuskyHacks. Check out the [GitHub repo](https://github.com/HuskyHacks/clarion) for full technical details on the inspiration for this standard.
{% endhint %}

This standard modifies the tenant's branding. This will either add to existing branding or create a new custom branding if one does not exist. Once modified, the branding will include an image that is the size of a single pixel. This image acts as a type of canary token.

{% hint style="info" %}
Canary? What? The canary token concept is based on the old practice of keeping a canary in coal mines. The canary was more sensitive to carbon monoxide and would show signs of carbon monoxide poising much faster than the miners. If the canary got sick, they knew it was time to get out.
{% endhint %}

When a user encounters an Adversary in the Middle (AitM) login page, a common practice is to load the tenant's custom branding in order to most effectively fool end users who have been taught to look for the branding as a sign of the page being valid. Because the standard has created the canary token as part of the branding, that single pixel image gets loaded.

When that single pixel image gets loaded, it detects the site's referrer. If that referrer is not a legitimate Microsoft login page, it triggers the alert and causes the tenant branding to reveal a different image to warn off the end user from continuing the login process:

<figure><img src="../../.gitbook/assets/image (3).png" alt=""><figcaption><p>Warning Image Added When AitM Site Detected</p></figcaption></figure>

In most cases, this should be enough to stop the AitM attack. as the text "DO NOT ENTER YOUR PASSWORD" will be placed directly over the password form field.

### What information does the canary token get?

Since the image is loaded in the user's browser, you're limited to client-side information gathering.&#x20;

* &#x20;Website's URL (Note: This may not always be scraped from the page.)
* Public IP address the page was accessed from&#x20;
* The tenant that was attempting to be logged in to

### What can I do with this alert?

Given the limited information that can be provided by the alert, you're unlikely to be able to pin this to an exact user in most cases. You may get lucky and correlate a public IP address to a user; however, that's not common. Here are a few actions you can take:

* If the URL is provided, contact the site's hosting provider and alert them to the AitM site.&#x20;
* If the URL is provided, block the domain in all your environments, DNS filters, etc.
* Review Entra ID logs from around the alert to see if you can locate any anomalous sign ins. This could indicate that the warning was not successful, and that the user provided their full credentials to the attacker.
* Have the client's Account Manager reach out to the client's decision maker. Inform the client of the alert and any results of your investigation. Use this conversation as an opportunity to discuss your security offerings around Security Awareness Training and email protection. There could be an opportunity to refresh those offerings with them or introduce them if they have previously been resistant.

### Common Sources of False Positives

Since the standard is based on detecting the site's referrer, there are a number of ways that you could see a false positive:

* Browser Extensions: Any browser extension that modifies the page's CSS could modify the site's referrer. A common extension that modifies the page's CSS is [Dark Reader](https://darkreader.org/).

***

{% include "../../.gitbook/includes/feature-request.md" %}
