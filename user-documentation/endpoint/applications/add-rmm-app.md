---
description: Deploy MSP RMM applications.
---

# Add MSP App

You can add MSP RMM applications to deploy through Microsoft Endpoint Manager. Below you will find the settings required for each RMM:

### Details

<details>
<summary>ConnectWise Automate</summary>
  
| Field                             | Description                                              |
| --------------------------------- | -------------------------------------------------------- |
| Intune Application Display Name   | Name the application will appear as in MEM               |
| Installer Token                   | See note below                                           |
| Automate Server (including HTTPS) | FQDN of your Automate server                             |
| Location ID                       | Automate site ID                                         |

Generating an installer token:
  See this [community script](https://forums.mspgeek.org/files/file/50-generate-agent-installertoken/) for how to create a token to use in installation.
</details>
<details>
<summary>ConnectWise RMM (formerly Command/Continuum)</summary>
  
| Field                             | Description                                              |
| --------------------------------- | -------------------------------------------------------- |
| Intune Application Display Name   | Name the application will appear as in MEM               |
| Client URL                        | Full URL path to download of installer for site          |
</details>
<details>
<summary>Datto RMM</summary>
  
| Field                             | Description                                              |
| --------------------------------- | -------------------------------------------------------- |
| Intune Application Display Name   | Name the application will appear as in MEM               |
| Server URL                        | FQDN including https://                                  |
| Datto ID                          | Datto site ID                                            | 
</details>
<details>
<summary>Huntress</summary>
  
| Field                             | Description                                              |
| --------------------------------- | -------------------------------------------------------- |
| Intune Application Display Name   | Name the application will appear as in MEM               |
| Account Key                       | Your MSP account key                                     |
| Organization Key                  | Identifier for the client organization in Huntress       |

Huntress documentation on specifics of how to name organization keys can be found [here](https://support.huntress.io/hc/en-us/articles/4404012734227-Using-Account-Keys-Organization-Keys-and-Agent-Tags).
</details>
<details>
<summary>ImmyBot</summary>
  
| Field                             | Description                                              |
| --------------------------------- | -------------------------------------------------------- |
| Intune Application Display Name   | Name the application will appear as in MEM               |
| Client URL                        | Full path to ImmyBot agent installer for your account    |

ImmyBot recommends having all newly installed agents land into their holding area before being assigned to groups for onboarding, etc.
</details>
<details>
<summary>Syncro RMM</summary>
  
| Field                             | Description                                              |
| --------------------------------- | -------------------------------------------------------- |
| Intune Application Display Name   | Name the application will appear as in MEM               |
| Client URL                        | Full path to agent installer for your account            |

</details>

### Assignment Options
| Field                             | Description                                              |
| --------------------------------- | -------------------------------------------------------- |
| Do not assign                     | Adds application to MEM but does not deploy              |
| Assign to all users               | Targets all users for app deployment                     |
| Assign to all devices             | Targets all devices for app deployment                   |
| Assign to all users and devices   | Targets all users and devices for app deployment         |
| Assign to Custom Group            | Enter comma separated row of group display name(s)       |

### Feature Requests / Ideas

Please raise any [feature requests](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=\&labels=enhancement%2Cno-priority\&projects=\&template=feature.yml\&title=%5BFeature+Request%5D%3A+) on GitHub.
