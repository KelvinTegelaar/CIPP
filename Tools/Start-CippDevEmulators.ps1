Write-Host "Starting CIPP Dev Emulators"
$Path = (Get-Item $PSScriptRoot).Parent.Parent.FullName
wt --title CIPP`; new-tab --title 'Azurite' -d $Path pwsh -c azurite`; new-tab --title 'FunctionApp' -d $Path\CIPP-API pwsh -c func start`; new-tab --title 'CIPP Frontend' -d $Path\CIPP pwsh -c npm run start`; new-tab --title 'SWA' -d $Path\CIPP pwsh -c npm run start-swa

