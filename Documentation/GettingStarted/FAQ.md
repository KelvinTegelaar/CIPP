## Installation Questions

`Why can't I install CIPP using the "Deploy to Azure" button?`

:    If you're experiencing issues with installation please report these in `#cipp-issues` on the [CIPP Discord](https://discord.gg/kYgsfrX2)

`Why can't I get details for a particular tenant / any tenants?`

:   1. If you have a guest account in a tenant that has the same UPN as    you used to generate your tokens - you will experience issues.
    1. Conditional access may block the correct functioning of the tokens - check your CA policies and also make sure you're not geo-blocking the function app's location.
    1. You cannot use third party MFA on the account used to generate SAM tokens.

    ??? example "Token test script"
        You can use the script below to test your tokens:

        ```powershell
            $ApplicationID = "YourAppID"
            $applicationsecret = "yourappsecret"
            $refreshtoken = "YourRefreshToken"
            $MyTenant = "YourPartnertenant.onmicrosoft.com"

            function Connect-graphAPI {
                [CmdletBinding()]
                Param
                (
                    [parameter(Position = 0, Mandatory = $false)]
                    [ValidateNotNullOrEmpty()][String]$ApplicationId,
                    
                    [parameter(Position = 1, Mandatory = $false)]
                    [ValidateNotNullOrEmpty()][String]$ApplicationSecret,
                    
                    [parameter(Position = 2, Mandatory = $true)]
                    [ValidateNotNullOrEmpty()][String]$TenantID,
            
                    [parameter(Position = 3, Mandatory = $false)]
                    [ValidateNotNullOrEmpty()][String]$RefreshToken
            
                )
                Write-Verbose "Removing old token if it exists"
                $Script:GraphHeader = $null
                Write-Verbose "Logging into Graph API"
                try {
                    if ($ApplicationId) {
                        Write-Verbose "   using the entered credentials"
                        $script:ApplicationId = $ApplicationId
                        $script:ApplicationSecret = $ApplicationSecret
                        $script:RefreshToken = $RefreshToken
                        $AuthBody = @{
                            client_id     = $ApplicationId
                            client_secret = $ApplicationSecret
                            scope         = 'https://graph.microsoft.com/.default'
                            refresh_token = $RefreshToken
                            grant_type    = "refresh_token"
                            
                        }
                        
                    }
                    else {
                        Write-Verbose "   using the cached credentials"
                        $AuthBody = @{
                            client_id     = $script:ApplicationId
                            client_secret = $Script:ApplicationSecret
                            scope         = 'https://graph.microsoft.com/.default'
                            refresh_token = $script:RefreshToken
                            grant_type    = "refresh_token"
                            
                        }
                    }
                    $AccessToken = (Invoke-RestMethod -Method post -Uri "https://login.microsoftonline.com/$($tenantid)/oauth2/v2.0/token" -Body $Authbody -ErrorAction Stop).access_token
            
                    $Script:GraphHeader = @{ Authorization = "Bearer $($AccessToken)" }
                }
                catch {
                    write-error "Could not log into the Graph API for tenant $($TenantID): $($_.Exception.Message)"
                }
            
            }
    
            write-host "Generating token to log into Intune" -ForegroundColor Green
            Connect-graphAPI -ApplicationId $applicationid -ApplicationSecret $applicationsecret -RefreshToken $refreshtoken -TenantID $MyTenant
            $Tenants = (Invoke-RestMethod -Uri "https://graph.microsoft.com/v1.0/contracts?`$top=999" -Method GET -Headers $script:GraphHeader).value
            foreach ($Tenant in $Tenants) {
                Connect-graphAPI -ApplicationId $applicationid -ApplicationSecret $applicationsecret -RefreshToken $refreshtoken -TenantID $tenant.customerid
                (Invoke-RestMethod -Uri "https://graph.microsoft.com/v1.0/users" -Method GET -Headers $script:GraphHeader).value
            }
        ```