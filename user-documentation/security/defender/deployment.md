# Defender Deployment

Disable Catchup Quick ScanThe Defender Deployment setup form allows you to set up default defender policies for your tenants or create specific policies.

{% stepper %}
{% step %}
### Tenant Selection

Select one or more tenants to apply the policies. This is a required field, and at least one tenant must be selected.
{% endstep %}

{% step %}
### Defender Setup Options

Optionally toggling this on will allow you to configure various defender settings such as compliance, telemetry, and device connections.

#### General

| Setting                                                                                        | Description                                                                                                                              |
| ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Allow Microsoft Defender for Endpoint to enforce Endpoint Security Configurations (Compliance) | Enables Defender to enforce compliance configurations. <mark style="color:$warning;">Required to enable the other setup sections.</mark> |
| Block unsupported OS versions                                                                  | Blocks devices with unsupported OS versions from connecting.                                                                             |

#### Android

| Setting                                                                                  | Description                                                                                                                           |
| ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Connect Android devices to Microsoft Defender for Endpoint                               | Connects Android devices to Defender <mark style="color:$warning;">and enables selection of the other options in this section</mark>. |
| Connect Android devices version 6.0.0 and above to Microsoft Defender for Endpoint (MAM) | Enables MAM-based compliance for Android 6.0+                                                                                         |
| Block Android device access when Microsoft Defender for Endpoint is unavailable          | Blocks Android device access if Defender is unreachable.                                                                              |

#### macOS

| Setting                                                                     | Description                                                                                                                         |
| --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Connect Mac devices to Microsoft Defender for Endpoint                      | Connects macOS devices to Defender <mark style="color:$warning;">and enables selection of the other options in this section</mark>. |
| Block Mac device access when Microsoft Defender for Endpoint is unavailable | Blocks Mac device access if Defender is unreachable.                                                                                |

#### EDR Policy

| Setting                                                                  | Description                                                                                                                                                            |
| ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| EDR: Connect Defender Configuration Package automatically from Connector | Automatically connects the Defender config package from the connector <mark style="color:$warning;">and enables selection of the other options in this section</mark>. |
| EDR: Enable Sample Sharing                                               | Enables sharing of file samples for analysis.                                                                                                                          |
| Assignment _(radio, shown when EDR Config is ON)_                        | Do not assign / Assign to all users / Assign to all devices / Assign to all users and devices                                                                          |

#### iOS / iPadOS

| Setting                                                                                           | Description                                                                                                                              |
| ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Connect iOS/iPadOS devices to Microsoft Defender for Endpoint                                     | Connects iOS/iPadOS devices to Defender <mark style="color:$warning;">and enables selection of the other options in this section</mark>. |
| Connect iOS/iPadOS devices version 13.0 and above to Microsoft Defender for Endpoint (Compliance) | Enables compliance-based connection for iOS 13+.                                                                                         |
| Enable App Sync (sending application inventory) for iOS/iPadOS devices                            | Sends application inventory for iOS/iPadOS to Defender.                                                                                  |
| Block iOS device access when Microsoft Defender for Endpoint is unavailable                       | Blocks iOS device access if Defender is unreachable.                                                                                     |
| Allow partner to collect iOS certificate metadata                                                 | Permits Defender to collect iOS certificate metadata.                                                                                    |
| Allow partner to collect iOS personal certificate metadata                                        | Permits Defender to collect iOS personal certificate metadata.                                                                           |

#### Windows

| Setting                                                                                              | Description                                                                                                                                                |
| ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Connect Windows devices version 10.0.15063 and above to Microsoft Defender for Endpoint (Compliance) | Connects Windows 10 (build 15063+) devices for compliance <mark style="color:$warning;">and enables selection of the other options in this section</mark>. |
| Connect Windows devices to Microsoft Defender for Endpoint (MAM)                                     | Enables MAM-based connection for Windows.                                                                                                                  |
| Block Windows device access when Microsoft Defender for Endpoint is unavailable                      | Blocks Windows device access if Defender is unreachable.                                                                                                   |
{% endstep %}

{% step %}
### Defender Defaults Policy Options

#### Defender Defaults Policy

| Setting                             | Description                                                                                                                                             |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Allow Archive Scanning              | Enables scanning of archive files (zip, cab, etc.).                                                                                                     |
| Allow behavior monitoring           | Enables monitoring of application behavior for suspicious activity.                                                                                     |
| Allow Cloud Protection              | Enables cloud-based protection for faster threat intelligence.                                                                                          |
| Allow e-mail scanning               | Enables scanning of email content and attachments.                                                                                                      |
| Allow Full Scan on Network Drives   | Enables full scans on mapped network drives.                                                                                                            |
| Allow Full Scan on Removable Drives | Enables full scans on removable/USB drives.                                                                                                             |
| Allow Script Scanning               | Enables scanning of scripts before execution.                                                                                                           |
| Enable Low CPU priority             | Reduces CPU priority for Defender scans to minimize impact.                                                                                             |
| Allow Metered Connection Updates    | Allows Defender definition updates over metered connections.                                                                                            |
| Disable Local Admin Merge           | Prevents local admin policy from merging with enterprise policy.                                                                                        |
| Avg CPU Load Factor (%)             | Sets the maximum average CPU usage for scans. Range: 0–100. Placeholder: 50.                                                                            |
| Allow On Access Protection          | Controls real-time on-access file scanning. Options: Not Allowed / Allowed (Default).                                                                   |
| Submit Samples Consent              | Controls automatic sample submission. Options: Always prompt / Send safe samples automatically (Default) / Never send / Send all samples automatically. |
| Allow scanning of downloaded files  | Enables scanning of files downloaded from the internet.                                                                                                 |
| Allow Realtime monitoring           | Enables real-time monitoring of files and processes.                                                                                                    |
| Allow Scanning Network Files        | Enables scanning of files on mapped network drives.                                                                                                     |
| Allow users to access UI            | Allows end users to access the Defender user interface.                                                                                                 |
| Check Signatures before scan        | Verifies signatures before initiating a scan.                                                                                                           |
| Signature Update Interval (hours)   | How often Defender checks for definition updates. Range: 0–24. Placeholder: 8.                                                                          |
| Disable Catchup Full Scan           | Disables scheduled catchup full scans for endpoints that missed a scan.                                                                                 |
| Disable Catchup Quick Scan          | Disables scheduled catchup quick scans for endpoints that missed a scan.                                                                                |
| Cloud Extended Timeout (seconds)    | Sets how long Defender waits for a cloud response. Range: 0–50. Placeholder: 0.                                                                         |
| Enable Network Protection           | Options: Disabled (Default) / Enabled (block mode) / Enabled (audit mode).                                                                              |
| Cloud Block Level                   | Options: Default / High / High Plus / Zero Tolerance.                                                                                                   |

#### Threat Remediation Actions

Per-severity remediation action (same options for all four levels): Clean / Quarantine / Remove / Allow / User defined / Block

* Low severity threats
* Moderate severity threats
* High severity threats
* Severe threats

#### Policy Assignment

Do not assign / Assign to all users / Assign to all devices / Assign to all users and devices
{% endstep %}

{% step %}
### Exclusion Policy

| Setting             | Description                                                                                   |
| ------------------- | --------------------------------------------------------------------------------------------- |
| Excluded Extensions | Comma separated list of file extensions to exclude from scanning (e.g., txt, log, tmp).       |
| Excluded Paths      | Comma separated list of file/folder paths to exclude (e.g., C:\temp).                         |
| Excluded Processes  | Comma separated list of processes to exclude (e.g., notepad.exe).                             |
| Assignment          | Do not assign / Assign to all users / Assign to all devices / Assign to all users and devices |
{% endstep %}

{% step %}
### ASR

#### ASR Rules

| Setting                                                                                           | Description                                                                                                                                                                                                                |
| ------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Mode                                                                                              | Block mode / Audit mode / Warn mode                                                                                                                                                                                        |
| Block execution of potentially obfuscated scripts                                                 | Detects suspicious properties within obfuscated scripts (such as heavily encoded or scrambled code) and blocks execution. Targets malware that uses obfuscation to evade detection.                                        |
| Block Adobe Reader from creating child processes                                                  | Prevents Adobe Reader from spawning child processes. This is a common technique used to execute malicious code through PDF files. Applies to all versions of Adobe Reader.                                                 |
| Block Win32 API calls from Office macros                                                          | Prevents Office VBA macros from making Win32 API calls, which are frequently used in macro-based malware to execute shellcode or download payloads.                                                                        |
| Block credential stealing from the Windows local security authority subsystem                     | Prevents credential dumping from LSASS (lsass.exe), blocking tools like Mimikatz from extracting passwords and hashes from memory.                                                                                         |
| Block process creations originating from PSExec and WMI commands                                  | Blocks process creation via PSExec and WMI, which are commonly used in lateral movement and remote execution attacks. Note: may impact legitimate admin tooling.                                                           |
| Block persistence through WMI event subscription                                                  | Prevents malware from using WMI event subscriptions to maintain persistence across reboots. Targets fileless malware that uses WMI as an execution and persistence mechanism.                                              |
| Block use of copied or impersonated system tools                                                  | Blocks use of copies or renamed versions of legitimate Windows system tools (e.g., cmd.exe, powershell.exe copied to another location) commonly used to evade detection.                                                   |
| Block Office applications from creating executable content                                        | Prevents Word, Excel, and PowerPoint from writing executable files to disk, blocking a common macro malware delivery technique.                                                                                            |
| Block Office applications from injecting code into other processes                                | Prevents Office applications from injecting code into other running processes, which is used by some exploit techniques to execute malicious code under a trusted process.                                                 |
| Block rebooting machine in Safe Mode                                                              | Prevents attackers from rebooting the device into Safe Mode, a technique used by some ransomware families to disable security tools before encrypting files.                                                               |
| Block executable files from running unless they meet a prevalence, age, or trusted list criterion | Blocks executable files that are new, rarely seen, or not on a trusted list. Uses cloud intelligence to evaluate file reputation before allowing execution. Can generate false positives for legitimate but rare software. |
| Block JavaScript or VBScript from launching downloaded executable content                         | Prevents JS and VBScript files (frequently used as malware droppers) from downloading and executing binaries. Targets drive-by download attacks.                                                                           |
| Block Webshell creation for Servers                                                               | Prevents the creation of web shell scripts on servers. Targets post-exploitation persistence where attackers drop scripts into web-accessible directories to maintain remote access.                                       |
| Block Office communication application from creating child processes                              | Prevents Outlook, Teams, and other Office communication apps from spawning child processes. Targets phishing-based attacks that exploit these applications.                                                                |
| Block all Office applications from creating child processes                                       | Blanket block on child process creation from any Office application. Broader than the communication app rule — covers Word, Excel, PowerPoint, and others.                                                                 |
| Block untrusted and unsigned processes that run from USB                                          | Prevents execution of untrusted or unsigned binaries from USB/removable devices. Helps mitigate attacks delivered via physical media.                                                                                      |
| Use advanced protection against ransomware                                                        | Enables heuristic-based ransomware detection in addition to signature-based protection. Analyzes file behavior patterns associated with ransomware activity.                                                               |
| Block executable content from email client and webmail                                            | Prevents executable files and scripts from being launched directly from email clients (Outlook) and webmail. Targets phishing attachments.                                                                                 |
| Block abuse of exploited vulnerable signed drivers                                                | Prevents malware from using legitimately signed but vulnerable drivers (BYOVD — Bring Your Own Vulnerable Driver) to gain kernel-level access and disable security software.                                               |
| Assignment                                                                                        | Do not assign / Assign to all users / Assign to all devices / Assign to all users and devices                                                                                                                              |
{% endstep %}
{% endstepper %}

For more details on each setting, refer to the [Microsoft Defender for Endpoint documentation](https://learn.microsoft.com/en-us/microsoft-365/security/defender-endpoint/microsoft-defender-endpoint?view=o365-worldwide).

***

{% include "../../../.gitbook/includes/feature-request.md" %}
