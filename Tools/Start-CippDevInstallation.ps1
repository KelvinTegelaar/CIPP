$Path = (Get-Item $PSScriptRoot).Parent.Parent.FullName

if (-not((Get-Command npm -ErrorAction SilentlyContinue) -or (Get-Command yarn -ErrorAction SilentlyContinue))) {
  throw 'npm or yarn is required to install the CIPP development environment.'
}

if (-not(Get-Command yarn -ErrorAction SilentlyContinue)) {
  Write-Host 'Installing Yarn'
  npm install --global yarn
}

if (-not(Get-Command azurite -ErrorAction SilentlyContinue)) {
  Write-Host 'Installing Azurite'
  yarn global add 'azurite'
}

if (-not(Get-Command swa -ErrorAction SilentlyContinue)) {
  Write-Host 'Installing @azure/static-web-apps-cli'
  yarn global add '@azure/static-web-apps-cli'
}

if (-not(Get-Command func -ErrorAction SilentlyContinue)) {
  Write-Host 'Installing Azure Functions Core Tools'
  yarn global add 'azure-functions-core-tools@4'
}

if (-not(yarn global list | Select-String -Pattern 'next')) {
  Write-Host 'Installing Next.js'
  yarn global add 'next'
}

yarn install --cwd (Join-Path $Path "CIPP") --network-timeout 500000
