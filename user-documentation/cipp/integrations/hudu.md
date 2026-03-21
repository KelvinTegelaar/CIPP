# Hudu

{% hint style="danger" %}
If you have Hudu behind Cloudflare Zero Trust Tunnel, please also set up the [cloudflare.md](cloudflare.md "mention") integration and enable the `Connect to HUDU through CloudFlare Tunnel with the Service Account credentials.` toggle.
{% endhint %}

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

1. Inside CIPP browse to **CIPP** -> **Integrations**
2. Select **Hudu**.
3. Please enter the FQDN you use to connect to Hudu:
   * https://yoursubdomain.huducloud.com or a self hosted address
4. Enter the API Key you created in Hudu.
5. Set the configuration to enabled to enable automatic synchronization once every 24 hours. You can optionally reschedule next sync date if you want to ensure the sync only runs outside of business hours.
6. Choose which assets you want to sync, including device serials you want to exclude from sync.
7. Click the Submit button.
8. Once the settings are saved click the '**Test Extension**' you should see a message at the top of the page saying '**Successfully Connected to Hudu Version: current version**', if you do not see this please check your API Key and FQDN.

#### Step 4 - Mapping CIPP to Hudu

After the API settings are set you can now map Hudu Assets to Microsoft 365 / CIPP Items.

**Organization Mapping**

1. Go to the **Tenant Mapping Table.**
2. You have two options for mapping organizations
   * Manually pick the Hudu Company from the dropdown lists and match them to the Microsoft 365 tenants. Then click the Set Mappings button.
   * Select the **Automap Hudu Organizations** button.
     * This will try to match Microsoft 365 tenants where the name exactly matches in both.
3. Click Save Mappings.

**Field Mapping**

1. Scroll down to the **Field Mapping Table.**
2. For each field you wish to populate in Hudu select the asset layout from the dropdown menu. For users it is recommended to use the "People" template to prevent synchronisation issues.
3. Click Save Mappings

#### Custom CSS

In some cases the information provided in the M365 Rich Text Field is cut off or formatted incorrectly, use this custom CSS code in your Hudu settings to help format it:

```
.card__item table {
  border-collapse: collapse;
  margin: 5px 0;
  font-size: 0.8em;
  font-family: sans-serif;
  min-width: 400px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);
}
.card__item h2,
.card__item p {
  font-size: 0.8em;
  font-family: sans-serif;
}
.card__item th,
.card__item td {
  padding: 5px 5px;
  width: auto;
}
.card__item thead tr {
  text-align: left;
}
.card__item tr {
  border-bottom: 1px solid #dddddd;
}

.custom-fast-fact.custom-fast-fact--warning { background: #f5c086; }
.custom-fast-fact.custom-fast-fact--datto-low { background: #2c81c8; }
.custom-fast-fact.custom-fast-fact--datto-moderate { background: #f7c210; }
.custom-fast-fact.custom-fast-fact--datto-high { background: #f68218; }
.custom-fast-fact.custom-fast-fact--datto-critical { background: #ec422e; }

.nasa__block {
  height: auto;
}
.nasa__block td {
  white-space: normal;
  word-wrap: break-word;
  word-break: break-word;
}

.mce-content-body {
  max-height: none !important;
  overflow: visible !important;
}
.writer-wrap {
  max-height: none;
  overflow-y: auto;
}

/* === License & Management Link Card Grids === */

/* Suppress generated <br> tags between sections */
.rich_text_content .o365 + br {
  display: none;
}

/* Flex for management button rows */
.o365 {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px 0;
  align-items: stretch;
}

/* Grid for license tile rows — equal-width columns */
.o365:has(.o365__app) {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(155px, 1fr));
}

.o365__app {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 14px;
  min-width: 130px;
  border-radius: 6px;
  border: 1px solid rgba(200, 200, 200, 0.15);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  font-family: sans-serif;
  font-size: 0.8em;
  text-align: center;
}
.o365__app strong {
  font-size: 1em;
  line-height: 1.2;
  display: block;
}
.o365__app font {
  font-size: 0.72rem !important;
  opacity: 0.65;
  display: block;
  line-height: 1.2;
}

.o365 .button {
  border-radius: 6px;
  padding: 8px 14px;
  font-size: 0.85em;
  font-family: sans-serif;
  font-weight: 500;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  transition: box-shadow 0.15s ease, transform 0.1s ease;
  white-space: nowrap;
  margin: 0;
  cursor: pointer;
}
.o365 .button:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
  transform: translateY(-1px);
}
.o365 .button a {
  display: flex;
  align-items: center;
  gap: 6px;
  text-decoration: none;
}

.section-label {
  font-family: sans-serif;
  font-size: 0.7em;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--primaryl1);
  margin-top: 16px;
  margin-bottom: 6px;
  padding-bottom: 5px;
  padding-left: 2px;
  border-bottom: 1px solid rgba(21, 112, 239, 0.3);
}.card__item table{
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

.writer-wrap { 
    max-height: 2000px; 
    overflow: scroll; 
}
```

#### Special Thanks

Special thanks to Luke Whitelock and his [HuduM365Automation](https://github.com/lwhitelock/HuduM365Automation) function app code.

***

{% include "../../../.gitbook/includes/feature-request.md" %}
