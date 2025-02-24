# Password Pusher

This integration allows you to generate password links instead of plain text passwords. Configure authentication and expiration settings that will apply to all generated passwords. If you are a Hosted PWPush Pro customer you can also select an account for branding if you enable Bearer Authentication. Self-Hosted must use the Email Address and API Key method for authenticated pushes.

{% hint style="danger" %}
Currently Password Pusher website policy "Force the default value?" forces the use of this option with the default value for all account members. It cannot be changed by account members. Currently when enabled will break the pwpush url. Don't turn on for now.
{% endhint %}

{% hint style="info" %}
The policy in Password Pusher only applies to the password generator on the front-end of the site which is only a helper / convenience tool. CIPP Password Policy reside in CIPP > Applications > General > Tab Password Styles
{% endhint %}

***

{% include "../../../.gitbook/includes/feature-request.md" %}
