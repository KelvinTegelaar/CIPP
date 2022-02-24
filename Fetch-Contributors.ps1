[CmdletBinding()]
param (
    [Parameter(Mandatory)]
    [String]
    $Owner,
    [Parameter(Mandatory)]
    [String[]]
    $Repos
)
$RawContributors = [HashTable]::New()
ForEach ($Repo in $Repos) {
    $ReleaseParams = @{
        Method  = 'GET'
        Uri     = "https://api.github.com/repos/$owner/$repo/contributors"
        Headers = @{
            'Accept' = 'application/vnd.github.v3+json'
        }
    }
    $Result = Invoke-RestMethod @ReleaseParams
    $RawContributors.$repo = $Result
}

$ContributorsOne = $RawContributors[$Repos[0]]
$ContributorsTwo = $RawContributors[$Repos[1]]

$Contributors = @($ContributorsOne; $ContributorsTwo) | Group-Object Id | ForEach-Object {
    $ContributorToKeep = $_.Group[0]
    if ($ContributorToKeep.contributions) {
        $ContributorToKeep.contributions += $_.Group[1].contributions
        $ContributorToKeep
    }
}

$OutputDirectory = Join-Path -Path '.' -ChildPath 'data'

if (!(Test-Path $OutputDirectory)) {
    New-Item -ItemType Directory -Force -Path $OutputDirectory | Out-Null
}

$JSONFile = Join-Path -Path $OutputDirectory -ChildPath 'contributors.json'
    
$Contributors | Sort-Object -Property contributions -Descending | ConvertTo-Json -Depth 5 | Out-File -FilePath $JSONFile -Encoding UTF8