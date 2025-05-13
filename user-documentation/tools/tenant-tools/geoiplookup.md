# IP Database

IP addresses stored in the CIPP IP Database are whitelisted from all audit logs and alerts. This includes any tenant alert that utilizes CIPPBadRepIP.&#x20;

### Geo IP Check

This tool allows you to lookup geographic information about an IP address. Enter an IP address to find out the Org, City, Region, Country, and Zip associated with the IP addresses registration. A map will also show you the approximate location of the IP address.

### IP Whitelist

The table will display any IP addresses that you have added to the whitelist.

### How to add an IP Address to the Whitelist

{% stepper %}
{% step %}
### Select the tenant

In the tenant selector in the top menu bar, select the tenant that you want this entry to appear under. Select All Tenants if you want this to apply to all tenants.
{% endstep %}

{% step %}
### Run the Geo IP Check

Run the check for the IP address you want to add to the table
{% endstep %}

{% step %}
### Select Action

Click the button under the map that corresponds with your desired outcome to add the IP address as trusted or not trusted

* Add to Whitelist - This will add the IP address to the whitelist as trusted
* Remove from Whitelist - This will add the IP address to the whitelist as not trusted
{% endstep %}
{% endstepper %}

***

### Feature Requests / Ideas

We value your feedback and ideas. Please raise any [feature requests](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=\&labels=enhancement%2Cno-priority\&projects=\&template=feature.yml\&title=%5BFeature+Request%5D%3A+) on GitHub.
