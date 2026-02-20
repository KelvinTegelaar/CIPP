# Add Custom Application

You can add custom (win32) applications via this option.

## Details

| Field                                   | Description                                                                                                                                                                                                                                                                     |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Application Name                        | The display name for the app in Intune. This is what end users and admins see in the Company Portal and Intune console.                                                                                                                                                         |
| Publisher                               | The publisher/vendor name displayed in Intune. Defaults to "CIPP" if not provided.                                                                                                                                                                                              |
| Description                             | A text description of what&#xD; the app does. Shows up in the Intune console and Company Portal app details.                                                                                                                                                                    |
| Install Script (PowerShell)             | The PowerShell script that runs to install the application. This is the actual script content (not a file path) — CIPP base64-encodes it and uploads it to Intune as install.ps1.                                                                                               |
| Uninstall Script (PowerShell, Optional) | The PowerShell script that runs to remove the application. This is the actual script content that gets uploaded as uninstall.ps1. If omitted, the app won't have an uninstall action.                                                                                           |
| Detection Path                          | The file system path used to determine if the app is already installed (e.g., C:\Program Files\MyApp). Can be a folder path or a full file path. If omitted, CIPP creates a default detection rule that looks for a marker file in %ProgramData%\CIPPApps\ named after the app. |
| Detection File/Folder Name              | A specific file name to look for inside detectionPath (e.g., app.exe). Use this when your detection path is a folder and you want to check for a specific file within it. If omitted, CIPP treats the last segment of detectionPath as the thing to detect.                     |
| Install as System                       | When enabled, the install runs under the SYSTEM account. When disabled, it runs as the logged-in user. Maps to Intune's runAsAccount (system vs user).                                                                                                                          |
| Disable Restart                         | When enabled, suppresses device restarts after installation. When disabled, allows Intune to restart the device if needed. Maps to deviceRestartBehavior (suppress vs allow).                                                                                                   |
| Run as 32-bit on 64-bit system          | When enabled, forces the PowerShell scripts to run in 32-bit mode on 64-bit systems. Leave off unless the app specifically requires 32-bit execution.                                                                                                                           |
| Enforce signature check                 | When enabled, Intune verifies that the PowerShell scripts are digitally signed before running them. Off by default.                                                                                                                                                             |
| Mark for Uninstallation                 | Toggle for marking the app for uninstallation rather than installation. When on, the assignment intent becomes Uninstall instead of Required.                                                                                                                                   |
| Assign To                               | Controls which devices/users get the app: Do not assign, Aassign to all users, Assign to all devices, Assign to all users and devices, or assign to custom group.                                                                                                               |

***

{% include "../../../../../.gitbook/includes/feature-request.md" %}
