Param($Version)
Set-Location (Get-Item $PSScriptRoot).Parent.FullName
$Files = @('version_latest.txt', 'public/version_latest.txt')
foreach ($File in $Files) {
    Set-Content $File -Value $Version
}

$Package = Get-Content package.json | ConvertFrom-Json
$Package.version = $Version
$Package | ConvertTo-Json -Depth 10 | Set-Content package.json
