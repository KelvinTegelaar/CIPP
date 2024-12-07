Import-Module Microsoft.Graph
Connect-MgGraph -Scopes 'DeviceManagementConfiguration.Read.All', 'DeviceManagementServiceConfig.Read.All'
$i = 0
$settingsUrl = "https://graph.microsoft.com/beta/deviceManagement/configurationSettings?`$top=999&`$skip=$i"
$Settings = do {
    $settingsResponse = Invoke-MgGraphRequest -Method Get -Uri $settingsUrl
    Write-Host "Getting settings from $i to $($i + 999): $settingsUrl"
    if ($null -ne $settingsResponse.value) {
        foreach ($setting in $settingsResponse.value) {
           
            $options = if ($setting.options -ne $null) {
                $setting.options | ForEach-Object {
                    [pscustomobject]@{
                        id          = $_.itemId
                        displayName = $_.displayName
                        description = $_.description
                    }
                }
            } 

            [pscustomobject]@{
                id          = $setting.id
                displayName = $setting.displayName
                options     = $options
            }
        }
    }
    $i += 999
    $settingsUrl = "https://graph.microsoft.com/beta/deviceManagement/configurationSettings?`$top=999&`$skip=$i"
    Write-Host "last setting is $($settingsResponse.value[-1].id)"
} while ($null -ne $settingsResponse.value.id)
