$Path = (Get-Item $PSScriptRoot).Parent.Parent.FullName

if (-not(Get-Command npm)) {
  throw 'npm is required to install the CIPP development environment'
}

if (-not(Get-Command azurite)) {
  Write-Host 'Installing Azurite'
  npm install --global 'azurite'
}

if (-not(Get-Command swa)) {
  Write-Host 'Installing @azure/static-web-apps-cli'
  npm install --global '@azure/static-web-apps-cli'
}

if (-not(Get-Command func)) {
  Write-Host 'Installing Azure Functions Core Tools'
  npm install --global 'azure-functions-core-tools@4' --unsafe-perms true
}

if (-not(Get-Command yarn)) {
  Write-Host 'Installing Yarn'
  npm install --global yarn
}

if (-not(yarn list --global --pattern 'next' | Select-String -Pattern 'next')) {
  Write-Host 'Installing Next.js'
  yarn install --global next --network-timeout 500000
}

yarn install --cwd (Join-Path $Path "CIPP") --network-timeout 500000
