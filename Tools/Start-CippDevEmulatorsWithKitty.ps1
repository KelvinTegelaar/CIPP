Get-Command kitty -ErrorAction Stop | Out-Null
Write-Host 'Starting CIPP Dev Emulators'
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -ErrorAction SilentlyContinue
$Path = (Get-Item $PSScriptRoot).Parent.Parent.FullName

if (Test-Path (Join-Path $Path 'CIPP-API-Processor')) {
  $Process = Read-Host -Prompt 'Start Process Function (y/N)?'
}

if ($Process -eq 'y') {
  kitty --detach --title 'CIPP' -o allow_remote_control=yes -- pwsh -c "
  kitty @new-window --new-tab --tab-title `"Azurite`" --cwd $Path -- azurite ;
  kitty @new-window --new-tab --tab-title `"FunctionApp`" --cwd (Join-Path $Path `"CIPP-API`") -- func start;
  kitty @new-window --new-tab --tab-title `"CIPP Frontend`" --cwd (Join-Path $Path `"CIPP`") -- npm run dev ;
  kitty @new-window --new-tab --tab-title `"SWA`" --cwd (Join-Path $Path `"CIPP`") -- npm run start-swa;
  kitty @new-window --new-tab --tab-title `"CIPP-API-Processor`" --cwd (Join-Path $Path `"CIPP-API-Processor`") -- func start --port 7072"
  
} else {
  kitty --detach --title 'CIPP' -o allow_remote_control=yes -- pwsh -c "
  kitty @new-window --new-tab --tab-title `"Azurite`" --cwd $Path -- azurite ;
  kitty @new-window --new-tab --tab-title `"FunctionApp`" --cwd (Join-Path $Path `"CIPP-API`") -- func start;
  kitty @new-window --new-tab --tab-title `"CIPP Frontend`" --cwd (Join-Path $Path `"CIPP`") -- npm run dev ;
  kitty @new-window --new-tab --tab-title `"SWA`" --cwd (Join-Path $Path `"CIPP`") -- npm run start-swa"
}
