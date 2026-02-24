Write-Host 'Starting CIPP Dev Emulators' -ForegroundColor Cyan

# Verify Windows Terminal is available
Get-Command wt -ErrorAction Stop | Out-Null

# Stop any existing node processes
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -ErrorAction SilentlyContinue

# Get paths
$Path = (Get-Item $PSScriptRoot).Parent.Parent.FullName

# Run installation script to ensure dependencies are installed and updated before starting emulators
pwsh -File (Join-Path $PSScriptRoot 'Start-CippDevInstallation.ps1')
$ApiPath = Join-Path -Path $Path -ChildPath 'CIPP-API'
$FrontendPath = Join-Path -Path $Path -ChildPath 'CIPP'

Write-Host 'Starting emulators...' -ForegroundColor Cyan

# Build commands with error handling
$azuriteCommand = 'try { azurite } catch { Write-Error $_.Exception.Message } finally { Read-Host "Press Enter to exit" }'
$apiCommand = 'try { func start } catch { Write-Error $_.Exception.Message } finally { Read-Host "Press Enter to exit" }'
$frontendCommand = 'try { npm run dev } catch { Write-Error $_.Exception.Message } finally { Read-Host "Press Enter to exit" }'
$swaCommand = 'try { npm run start-swa } catch { Write-Error $_.Exception.Message } finally { Read-Host "Press Enter to exit" }'

# Start Windows Terminal with all tabs
wt --title CIPP`; new-tab --title 'Azurite' -d $Path pwsh -c $azuriteCommand`; new-tab --title 'FunctionApp' -d $ApiPath pwsh -c $apiCommand`; new-tab --title 'CIPP Frontend' -d $FrontendPath pwsh -c $frontendCommand`; new-tab --title 'SWA' -d $FrontendPath pwsh -c $swaCommand
