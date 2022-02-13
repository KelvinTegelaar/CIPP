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
    Uri     = "https://api.github.com/repos/$owner/$repo/releases"
    Headers = @{
        'Accept' = 'application/vnd.github.v3+json'
    }
}

$Releases = Invoke-RestMethod @ReleaseParams

$OutputDirectory = Join-Path -Path '.' -ChildPath 'releases' -AdditionalChildPath $Repo

if (!(Test-Path $OutputDirectory)) {
    New-Item -ItemType Directory -Force -Path $OutputDirectory | Out-Null
}

$DoubleBreak = ''
$DoubleBreak += [System.Environment]::NewLine
$DoubleBreak += [System.Environment]::NewLine

ForEach ($Release in $Releases) {
    $NameParts = $Release.name -Split ' - '

    $Version = $NameParts[0]
    $Name = $NameParts[1]

    $FinalVersion = ''
    $DisplayName = ''

    if ($Version) {
        $StrippedVersion = $Version -replace ' ', ''
        $SanitisedVersion = $StrippedVersion -replace '[^0-9.]', ''
        $FinalVersion = $SanitisedVersion -replace '[.]', '-'
        if ($Name) {
            $DisplayName = $Version
        } else {
            $DisplayName = $Release.name
        }
    } else {
        $StrippedVersion = $Release.name -replace ' ', ''
        $SanitisedVersion = $StrippedVersion -replace '[^0-9.]', ''
        $FinalVersion = $SanitisedVersion -replace '[.]', '-'
    }

    $MarkDown = ''
    $MarkDown += '---'
    $MarkDown += [System.Environment]::NewLine
    $MarkDown += "title: $($Repo) - $($DisplayName)"
    $MarkDown += [System.Environment]::NewLine
    $MarkDown += "date: $($Release.created_at)"
    $MarkDown += [System.Environment]::NewLine
    $MarkDown += "tags: [${Repo}]"
    $MarkDown += [System.Environment]::NewLine
    $MarkDown += "slug: $Repo/v$FinalVersion"
    $MarkDown += [System.Environment]::NewLine
    $Markdown += '---'
    $Markdown += $DoubleBreak
    if ($Name) {
        $Markdown += "<p className='version-subtitle'>$($Name)</p>"
        $Markdown += $DoubleBreak
    }
    $Markdown += '<!--truncate-->'
    $Markdown += $DoubleBreak
    $MarkDown += $Release.body

    $MarkDownFile = Join-Path -Path $OutputDirectory -ChildPath "v$FinalVersion.md"
    
    if (!(Test-Path $MarkDownFile)) {
        $Markdown | Out-File -FilePath $MarkDownFile
    } else {
        Write-Warning "File already exists: $MarkDownFile"
    }
}