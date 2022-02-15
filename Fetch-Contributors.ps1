[CmdletBinding()]
param (
    [Parameter(Mandatory)]
    [String]
    $Owner,
    [Parameter(Mandatory)]
    [String]
    $Repo
)
$ReleaseParams = @{
    Method  = 'GET'
    Uri     = "https://api.github.com/repos/$owner/$repo/contributors"
    Headers = @{
        'Accept' = 'application/vnd.github.v3+json'
    }
}

$Contributors = Invoke-RestMethod @ReleaseParams

$OutputDirectory = Join-Path -Path '.' -ChildPath 'data'

if (!(Test-Path $OutputDirectory)) {
    New-Item -ItemType Directory -Force -Path $OutputDirectory | Out-Null
}

$JSONFile = Join-Path -Path $OutputDirectory -ChildPath 'contributors.json'
    
$Contributors | ConvertTo-Json | Out-File -FilePath $JSONFile