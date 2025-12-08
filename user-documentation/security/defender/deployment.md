# Defender Deployment

The Defender Deployment page allows you to set up default defender policies for your tenants or create specific policies. The form includes several sections:

* **Tenant Selection**: Select one or more tenants to apply the policies. This is a required field, and at least one tenant must be selected.
* **Defender Setup Options**: Configure various defender settings such as compliance, telemetry, and device connections.
  * **Allow Microsoft Defender for Endpoint to enforce Endpoint Security Configurations (Compliance)**: Enables Defender to enforce compliance configurations.
  * **Connect iOS/iPadOS devices version 13.0 and above to Microsoft Defender for Endpoint (Compliance)**: Connects iOS devices to Defender for compliance.
  * **Connect Android devices version 6.0.0 and above to Microsoft Defender for Endpoint (Compliance)**: Connects Android devices to Defender for compliance.
  * **Connect Windows devices version 10.0.15063 and above to Microsoft Defender for Endpoint (Compliance)**: Connects Windows devices to Defender for compliance.
  * **EDR: Expedite Telemetry Reporting Frequency**: Increases the frequency of telemetry reporting for Endpoint Detection and Response.
  * **Enable App Sync (sending application inventory) for iOS/iPadOS devices**: Sends application inventory for iOS devices.
  * **Block unsupported OS versions**: Blocks devices with unsupported OS versions from connecting.
  * **Connect Android devices to Microsoft Defender for Endpoint**: Connects Android devices to Defender.
  * **Connect iOS/iPadOS devices to Microsoft Defender for Endpoint**: Connects iOS devices to Defender.
  * **EDR: Enable Sample Sharing**: Enables sharing of samples for analysis.
* **Defender Defaults Policy Options**: Set default policies for scanning, monitoring, and protection.
  * **Allow Archive Scanning**: Enables scanning of archive files.
  * **Allow behavior monitoring**: Enables monitoring of application behaviors.
  * **Allow Cloud Protection**: Enables cloud-based protection.
  * **Allow e-mail scanning**: Enables scanning of email content.
  * **Allow Full Scan on Network Drives**: Enables full scans on network drives.
  * **Allow Full Scan on Removable Drives**: Enables full scans on removable drives.
  * **Allow Script Scanning**: Enables scanning of scripts.
  * **Enable Low CPU priority**: Reduces CPU priority for scans.
  * **Allow Metered Connection Updates:**&#x20;
  * **Disable Local Admin Merge:** Blocks merging local admins
  * **Avg CPU Load Factor (%):**&#x20;
  * **Allow on Access Protection:**&#x20;
  * **Submit Samples Consent:**&#x20;
  * **Allow scanning of downloaded files**: Enables scanning of files downloaded from the internet.
  * **Allow Realtime monitoring**: Enables real-time monitoring of files and processes.
  * **Allow Scanning Network Files**: Enables scanning of mapped network drives.
  * **Allow users to access UI**: Allows users to access the Defender user interface.
  * **Check Signatures before scan**: Verifies file signatures before scanning.
  * **Signature Update Interval (hours):**&#x20;
  * **Disable Catchup Full Scan**: Disables catchup full scans.
  * **Disable Catchup Quick Scan**: Disables catchup quick scans.
  * **Cloud External Timeout (seconds):**
  * **Enable Network Protection:**
  * **Cloud Block Level:** Default, High, High Plus, or Zero Tolerance
  * **Threat Remediation Actions:**
    * **Low severity threats:** Set the threats you want to apply to this category
    * **Moderate severity threats:** Set the threats you want to apply to this category
    * **High severity threats:** Set the threats you want to apply to this category
    * **Severe threats:** Set the threats you want to apply to this category
  * **Assign to Group**: Options to assign policies to specific groups (e.g., all users, all devices).
* **ASR Rules**: Define Attack Surface Reduction rules to enhance security.
  * **Block Adobe Reader from creating child processes**: Prevents Adobe Reader from creating child processes.
  * **Block Win32 API calls from Office macros**: Prevents Office macros from making Win32 API calls.
  * **Block credential stealing from the Windows local security authority subsystem**: Prevents credential theft from the local security authority subsystem.
  * **Block process creations originating from PSExec and WMI commands**: Prevents process creation from PSExec and WMI commands.
  * **Block persistence through WMI event subscription**: Prevents persistence through WMI event subscriptions.
  * **Block Office applications from creating executable content**: Prevents Office applications from creating executable files.
  * **Block Office applications from injecting code into other processes**: Prevents Office applications from injecting code.
  * **Block executable files from running unless they meet a prevalence, age, or trusted list criterion**: Blocks executable files based on criteria.
  * **Block JavaScript or VBScript from launching downloaded executable content**: Prevents scripts from launching executables.
  * **Block Office communication application from creating child processes**: Prevents Office communication apps from creating child processes.
  * **Block all Office applications from creating child processes**: Prevents all Office apps from creating child processes.
  * **Block untrusted and unsigned processes that run from USB**: Blocks untrusted processes from USB devices.
  * **Use advanced protection against ransomware**: Enables advanced ransomware protection.
  * **Block executable content from email client and webmail**: Blocks executable content from email clients.
  * **Block abuse of exploited vulnerable signed drivers (Device)**: Prevents abuse of vulnerable signed drivers.
  * **Assign to Group**: Options to assign ASR rules to specific groups (e.g., all users, all devices).

For more details on each setting, refer to the [Microsoft Defender for Endpoint documentation](https://docs.microsoft.com/en-us/microsoft-365/security/defender-endpoint/microsoft-defender-endpoint?view=o365-worldwide).

***

### Feature Requests / Ideas

We value your feedback and ideas. Please raise any [feature requests](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=\&labels=enhancement%2Cno-priority\&projects=\&template=feature.yml\&title=%5BFeature+Request%5D%3A+) on GitHub.
