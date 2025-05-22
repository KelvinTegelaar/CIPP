# Hudu

The Hudu integration provides several different options to give you control over what is synchronised from CIPP to Hudu.

Data is synchronized automatically once every 24 hours from Microsoft 365 / CIPP to Hudu. This is scheduled once you save the extension and map your tenants.

{% hint style="info" %}
For User and Device information a Rich Text field called "Microsoft 365" is used. This field is created after the first sync once you've set your Field Mappings to the appropriate asset layout.
{% endhint %}

### Configuring the integration

#### Step 1 - Obtain API Credentials

1. First login to your Hudu instance as an Administrator.
2. Browse to **Admin -> Account Administration -> API Keys**
3. Select **+ New API Key** at the top right.
4. Fill out the details for the API Application:
   * Enter a Name such as '**CIPP Integration**'.
   * Optional: Get a list of potential IP addresses from your function app to limit the API scope to just the function app.
5. Click **Create New Key**.
6. Copy the API key to a secure place.

{% hint style="warning" %}
In order for CIPP to access your Hudu asset layouts, a **global** API key must be created. The Company Scope field should be left blank.
{% endhint %}

#### Step 2 - CIPP Settings

You should now be ready to configure settings inside CIPP

1. Inside CIPP browse to **Settings** -> **CIPP** -> **Extension Settings**
2. Select the **Hudu** tab.
3. Please enter the FQDN you use to connect to Hudu:
   * https://yoursubdomain.huducloud.com or a self hosted address
4. Enter the API Key you created in Hudu.
5. Set the configuration to enabled to enable automatic synchronization once every 24 hours.
6. Click the Set Extension Settings button.
7. Once the settings are saved click the '**Test Extension**' you should see a message at the top of the page saying '**Successfully Connected to Hudu Version: current version**', if you do not see this please check your API Key and FQDN.

#### Step 4 - Mapping CIPP to Hudu

After the API settings are set you can now map Hudu Assets to Microsoft 365 / CIPP Items.

**Organization Mapping**

1. Go to the **Hudu Organization Mapping Table.**
2. You have two options for mapping organizations
   * Manually pick the Hudu Company from the dropdown lists and match them to the Microsoft 365 tenants. Then click the Set Mappings button.
   * Select the **Automap Hudu Organizations** button.
     * This will try to match Microsoft 365 tenants where the name exactly matches in both.
3. Click Save Mappings.

**Field Mapping**

1. Scroll down to the **Hudu Field Mapping Table.**
2. For each field you wish to populate in Hudu select the asset layout from the dropdown menu. For users it is recommended to use the "People" template to prevent synchronisation issues.
3. Click Save Mappings

#### Custom CSS

In some cases the information provided in the M365 Rich Text Field is cut off or formatted incorrectly, use this custom CSS code in your Hudu settings to help format it:

```
.card__item table{
	border-collapse: collapse;
	margin: 5px 0;
	font-size: 0.8em;
	font-family: sans-serif;
	min-width: 400px;
	box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);
}
.card__item h2, .card__item p{
	font-size: 0.8em;
	font-family: sans-serif;
}
.card__item th, .card__item td {
	padding: 5px 5px;
	width:auto;
}
.card__item thead tr {
	text-align: left;
}
.card__item tr {
	border-bottom: 1px solid #dddddd;
}

.custom-fast-fact.custom-fast-fact--warning {
    background: #f5c086;
}
 .custom-fast-fact.custom-fast-fact--datto-low {
     background: #2C81C8;
}
 .custom-fast-fact.custom-fast-fact--datto-moderate {
     background: #F7C210;
}

 .custom-fast-fact.custom-fast-fact--datto-high {
     background: #F68218;
}

 .custom-fast-fact.custom-fast-fact--datto-critical {
     background: #EC422E;
}

.nasa__block {
   height:auto;
}

.nasa__block td {
   white-space: normal;
   word-wrap: break-word;
   word-break: break-word;
}

.mce-content-body {
    max-height: 600px !important;
    overflow-y: scroll !important;
}
```

#### Special Thanks

Special thanks to Luke Whitelock and his [HuduM365Automation](https://github.com/lwhitelock/HuduM365Automation) function app code.

***

### Feature Requests / Ideas

We value your feedback and ideas. Please raise any [feature requests](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=\&labels=enhancement%2Cno-priority\&projects=\&template=feature.yml\&title=%5BFeature+Request%5D%3A+) on GitHub.
