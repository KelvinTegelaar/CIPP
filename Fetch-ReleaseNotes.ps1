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
    Uri     = "https://api.github.com/repos/${owner}/${repo}/releases"
    Headers = @{
        'Accept' = 'application/vnd.github.v3+json'
    }
}

$Releases = Invoke-RestMethod @ReleaseParams

$OutputDirectory = Join-Path -Path '.' -ChildPath 'releases' -AdditionalChildPath $Repo

if (!(Test-Path $OutputDirectory)) {
    New-Item -ItemType Directory -Force -Path $OutputDirectory | Out-Null
}

ForEach ($Release in $Releases) {
    $MarkDown = ''
    $MarkDown += '---'
    $MarkDown += [System.Environment]::NewLine
    $MarkDown += "title: ${Repo} - $($Release.name)"
    $MarkDown += [System.Environment]::NewLine
    $MarkDown += 'authors: CIPP'
    $MarkDown += [System.Environment]::NewLine
    $MarkDown += "date: $(Get-Date -Date $Release.created_at -Format 'yyyy-MM-dd')"
    $MarkDown += [System.Environment]::NewLine
    $MarkDown += "tags: [${Repo}, release]"
    $MarkDown += [System.Environment]::NewLine

    $StrippedName = $Release.name -replace ' ', ''
    $SanitisedName = $StrippedName -replace '[^0-9.]', ''
    $FinalName = $SanitisedName -replace '[.]', '-'

    $MarkDown += "slug: ${Repo}/v${FinalName}"
    $MarkDown += [System.Environment]::NewLine
    $Markdown += '---'
    $Markdown += [System.Environment]::NewLine
    $Markdown += [System.Environment]::NewLine
    $Markdown += '<!--truncate-->'
    $Markdown += [System.Environment]::NewLine
    $Markdown += [System.Environment]::NewLine
    $MarkDown += $Release.body

    $MarkDownFile = Join-Path -Path $OutputDirectory -ChildPath "v${FinalName}.md"
    
    if (!(Test-Path $MarkDownFile)) {
        $Markdown | Out-File -FilePath $MarkDownFile
    } else {
        Write-Warning "File already exists: $MarkDownFile"
    }
}