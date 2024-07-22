# Defender Standards

## Low Impact

| Standard Name                    | Description                                                                                                                                                              | Recommended By | PowerShell Equivalent                                | APIName                |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------- | ---------------------------------------------------- | ---------------------- |
| Default Anti-Phishing Policy     | This creates a Anti-Phishing policy that automatically enables Mailbox Intelligence and spoofing, optional switches for Mailtips.                                        | "CIS"          | Set-AntiphishPolicy or New-AntiphishPolicy           | AntiPhishPolicy        |
| Default Atp Policy For O365      | This creates a Atp policy that enables Defender for Office 365 for Sharepoint, OneDrive and Microsoft Teams.                                                             | "CIS"          | Set-AtpPolicyForO365                                 | AtpPolicyForO365       |
| Default Malware Filter Policy    | This creates a Malware filter policy that enables the default File filter and Zero-hour auto purge for malware.                                                          | "CIS"          | Set-MalwareFilterPolicy or New-MalwareFilterPolicy   | MalwareFilterPolicy    |
| Quarantine Release Request Alert | Sets a e-mail address to alert when a User requests to release a quarantined message. This is useful for monitoring and ensuring that the correct messages are released. |                | New-ProtectionAlert and Set-ProtectionAlert          | QuarantineRequestAlert |
| Default Safe Attachment Policy   | This creates a Safe Attachment policy                                                                                                                                    | "CIS"          | Set-SafeAttachmentPolicy or New-SafeAttachmentPolicy | SafeAttachmentPolicy   |
| Default SafeLinks Policy         | This creates a safelink policy that automatically scans, tracks, and and enables safe links for Email, Office, and Teams for both external and internal senders          | "CIS"          | Set-SafeLinksPolicy or New-SafeLinksPolicy           | SafeLinksPolicy        |

## Medium Impact

| Standard Name              | Description                                                                      | PowerShell Equivalent                                          | APIName          |
| -------------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------- | ---------------- |
| Default Spam Filter Policy | This standard creates a Spam filter policy similar to the default strict policy. | New-HostedContentFilterPolicy or Set-HostedContentFilterPolicy | SpamFilterPolicy |
