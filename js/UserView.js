$(document).ready(function () {
    //gets the current Tenantfilter
    let searchParams = new URLSearchParams(window.location.search)
    var TenantID = '';
    if (searchParams.has('Tenantfilter')) {
        TenantID = escapeHTML(searchParams.get('Tenantfilter'))
    }
    //checks if the default location has been set, and if so, use that again.
    var DisplayName
    var EmailAddress
    //checks if a userid is present, and if so, we prefill the form.
    if (searchParams.has('UserID')) {

        var UserID = escapeHTML(searchParams.get('UserID'))
        $('#userID').val(UserID)
        $('#tenantID').val(TenantID)
        $.ajax({
            'async': true,
            'global': false,
            'url': 'api/ListUsers?TenantFilter=' + TenantID + '&UserID=' + UserID,
            'dataType': "json",
            'success': function (data) {
                DisplayName = data[0].displayName
                EmailAddress = data[0].userPrincipalName

                document.getElementById("UserName").innerHTML = data[0].displayName

                document.getElementById("UserDetails").innerHTML = '<table class="table">' +
                    "<tr><td>First Name</td><td>" + data[0].givenName + "</td></tr>" +
                    "<tr><td>Last Name</td><td>" + data[0].surname + "</td></tr>" +
                    "<tr><td>User Principal Name</td><td>" + data[0].userPrincipalName + "</td></tr>" +
                    "<tr><td>Licenses</td><td>" + data[0].LicJoined + "</td></tr>" +
                    "<tr><td>Alias</td><td>" + data[0].mailNickname + "</td></tr>" +
                    "<tr><td>Primary Domain</td><td>" + data[0].primDomain + "</td></tr>" +
                    "<tr><td>Usage Location</td><td>" + data[0].usageLocation + "</td></tr>" +
                    "<tr><td>Street Address</td><td>" + data[0].streetAddress + "</td></tr>" +
                    "<tr><td>City</td><td>" + data[0].city + "</td></tr>" +
                    "<tr><td>Postcode</td><td>" + data[0].postalCode + "</td></tr>" +
                    "<tr><td>Country</td><td>" + data[0].country + "</td></tr>" +
                    "<tr><td>Company Name</td><td>" + data[0].companyName + "</td></tr>" +
                    "<tr><td>Department</td><td>" + data[0].department + "</td></tr>" +
                    "<tr><td>Postal Code</td><td>" + data[0].postalCode + "</td></tr>" +
                    "<tr><td>Mobile Phone</td><td>" + data[0].mobilePhone + "</td></tr>" +
                    "<tr><td>Business Phone</td><td>" + data[0].businessPhones + "</td></tr></table>"

                var loginDetails = `<table class="table">
                    <tr><td>Last Sign in Date</td><td>${data[0].LastSigninDate}</td></tr>
                    <tr><td>Last Sign in Application</td><td>${data[0].LastSigninApplication}</td></tr>
                    <tr><td>Last Sign in Status</td><td>${data[0].LastSigninStatus}</td></tr>
                    <tr><td>Last Sign in Result</td><td>${data[0].LastSigninResult}</td></tr>
                    <tr><td>Last Sign in Failure Reason</td><td>${data[0].LastSigninFailureReason}</td></tr>
                    </table>`
                $("#LastLoginDetails").html(loginDetails);

                var userActions = '<a href=index.html?page=EditUser&Tenantfilter=' + TenantID + '&UserID=' + UserID + '><i data-bs-toggle="tooltip" data-bs-placement="top" title="Edit User" class="fas fa-cog fa-fw"></i> Edit User</a><nothing class="APILink"><br />' +
                    '<a actionname="Send Push to ' + DisplayName + '" href=api/ExecSendPush?TenantFilter=' + TenantID + '&UserEmail=' + EmailAddress + '><i data-bs-toggle="tooltip" data-bs-placement="top" title="Send MFA Push to User" class="fas fa-exchange-alt fa-fw"></i></i> Send MFA Push to User</a><br />' +
                    '<a actionname="convert ' + DisplayName + ' to a shared mailbox" href=api/ExecConvertToSharedMailbox?TenantFilter=' + TenantID + '&ID=' + UserID + '><i data-bs-toggle="tooltip" data-bs-placement="top" title="Convert to Shared" class="fas fa-share-alt fa-fw"></i> Convert to Shared Mailbox</a><br />' +
                    '<a actionname="disable ' + DisplayName + '" href=api/ExecDisableUser?TenantFilter=' + TenantID + '&ID=' + UserID + '><i data-bs-toggle="tooltip" data-bs-placement="top" title="Block Sign in" class="fas fa-ban fa-fw"></i> Block Sign in</a><br />' +
                    '<a actionname="reset the password for ' + DisplayName + '" href=api/ExecResetPass?TenantFilter=' + TenantID + '&ID=' + UserID + '><i data-bs-toggle="tooltip" data-bs-placement="top" title="Reset password" class="fas fa-key fa-fw"></i></i> Reset password</a><br />' +
                    '<a actionname="Delete ' + DisplayName + '" href=api/RemoveUser?TenantFilter=' + TenantID + '&ID=' + UserID + '><i data-bs-toggle="tooltip" data-bs-placement="top" title="Delete user" class="fas fa-user-times fa-fw"></i></i> Delete user</a></nothing><br />';
                $('#ActionDetails').html(userActions);

                var m365Management = `<a target="_blank" href="https://portal.azure.com/${TenantID}/#blade/Microsoft_AAD_IAM/UserDetailsMenuBlade/Profile/userId/${UserID}"><i data-bs-toggle="tooltip" data-bs-placement="top" title="Open user in Azure AD" class="fas fa-users fa-fw"></i> View in Azure AD</a><br />
                <a target="_blank" href="https://endpoint.microsoft.com/${TenantID}/#blade/Microsoft_AAD_IAM/UserDetailsMenuBlade/Profile/userId/${UserID}"><i data-bs-toggle="tooltip" data-bs-placement="top" title="Open user in Endpoint Manager" class="fas fa-laptop fa-fw"></i> View in Endpoint Manager (Intune)</a><br />
                `
                $('#M365Management').html(m365Management);

                var emailDetails = `<table class="table"><tbody><tr><td></td><td></td></tr>
                <tr><td>Primary Email</td><td>${data[0].mail}</td></tr>
                <tr><td>Other Email Addresses</td><td>${data[0].otherMails.join(', ')}</td></tr>
                <tr><td>Proxy Addresses</td><td>${data[0].Aliases}</td></tr></tbody></table>`
                $('#EmailDetails').html(emailDetails);
                //"<tr><td>Raw</td><td>" +  JSON.stringify(data, null, 2) + "</td></tr></table>"
                $.ajax({
                    'async': true,
                    'global': false,
                    'url': 'api/ListSites?type=OneDriveUsageAccount&TenantFilter=' + TenantID + '&UserUPN=' + EmailAddress,
                    'dataType': "json",
                    'success': function (data) {
                        $.each(data, function (index, value) {
                            var oneDriveUsedPercent = Math.round((value.UsedGB / value.Allocated) * 100)
                            if (oneDriveUsedPercent >= 95) { var colourCalculation = "bg-danger" }
                            if (oneDriveUsedPercent < 95 && oneDriveUsedPercent >= 90) { var colourCalculation = "bg-warning" }
                            if (oneDriveUsedPercent < 90) { var colourCalculation = "bg-success" }

                            var oneDriveTable = `<table class="table"><tbody>
                        <tr><td>Site URL</td><td>${value.URL}</td></tr>
                        <tr><td>Usage</td><td>${value.UsedGB} / ${value.Allocated} GB</td></tr>
                        <tr><td>Percent</td><td><div class="progress"><div class="progress-bar ${colourCalculation}" role="progressbar" style="width: ${oneDriveUsedPercent}%" aria-valuenow="${value.UsedGB}" aria-valuemin="0" aria-valuemax="${value.Allocated}">${oneDriveUsedPercent}%</div></div></td></tr>
                        <tr><td>Files</td><td>${value.FileCount}</td></tr>
                        <tr><td>Last Active</td><td>${value.LastActive}</td></tr>
                        </tbody></table>`
                            $("#OneDriveDetails").html(oneDriveTable);
                        });
                    }
                }
                )
            }
        }
        ),
            $.ajax({
                'async': true,
                'global': false,
                'url': 'api/ListUserConditionalAccessPolicies?TenantFilter=' + TenantID + '&UserID=' + UserID,
                'dataType': "json",
                'success': function (data) {
                    var table = $('<table class="table"><tbody>');
                    $.each(data, function (index, value) {
                        var TableRow = "<tr>";
                        TableRow += "<td>" + value.displayName + "</td>";
                        TableRow += "</tr>";
                        $(table).append(TableRow);
                    });
                    $("#ConditionalAccessDetails").html(table);
                }
            }
            ),
            $.ajax({
                'async': true,
                'global': false,
                'url': 'api/ListUserDevices?TenantFilter=' + TenantID + '&UserID=' + UserID,
                'dataType': "json",
                'success': function (data) {
                    var tbl_body = document.createElement("tbody");
                    $.each(data, function (index, value) {
                        var accountEnabled;
                        if (value.accountEnabled === true) {
                            accountEnabled = '<td><i class="fas fa-check-circle text-success fa-2x"></i></td>';
                        } else {
                            accountEnabled = '<td><i class="fas fa-times-circle text-danger fa-2x"></i></a></td>';
                        }

                        var isCompliant;
                        if (value.isCompliant === true) {
                            isCompliant = '<td><i class="fas fa-check-circle text-success fa-2x"></i></td>';
                        } else {
                            isCompliant = '<td><i class="fas fa-times-circle text-danger fa-2x"></i></a></td>';
                        }

                        var onPremisesSyncEnabled;
                        if (value.onPremisesSyncEnabled === true) {
                            onPremisesSyncEnabled = '<td><i class="fas fa-check-circle text-success fa-2x"></i></td>';
                        } else {
                            onPremisesSyncEnabled = '<td><i class="fas fa-times-circle text-muted fa-2x"></i></a></td>';
                        }

                        var displayLink;
                        if (value.EPMID == null) {
                            displayLink = value.displayName;
                        } else {
                            displayLink = `<a target="_blank" href="https://endpoint.microsoft.com/${TenantID}#blade/Microsoft_Intune_Devices/DeviceSettingsMenuBlade/overview/mdmDeviceId/${value.EPMID}">${value.displayName}</a>`;
                        }



                        var tbl_row = `<tr><td>${displayLink}</td>
                        ${accountEnabled}
                        ${isCompliant}
                        <td>${value.manufacturer}</td>
                        <td>${value.model}</td>
                        <td>${value.operatingSystem}</td>
                        <td>${value.operatingSystemVersion}</td>
                        <td>${value.createdDateTime}</td>
                        <td>${value.approximateLastSignInDateTime}</td>
                        <td>${value.deviceOwnership}</td>
                        <td>${value.enrollmentType}</td>
                        <td>${value.managementType}</td>
                        ${onPremisesSyncEnabled}
                        <td>${value.trustType}</td></tr>`

                        $(tbl_body).append(tbl_row);
                    });
                    $("#UserDevices").append(tbl_body);
                }
            }
            ),
            $.ajax({
                'async': true,
                'global': false,
                'url': 'api/ListUserGroups?TenantFilter=' + TenantID + '&UserID=' + UserID,
                'dataType': "json",
                'success': function (data) {
                    var tbl_body = document.createElement("tbody");
                    $.each(data, function (index, value) {
                        var mailEnabled;
                        if (value.MailEnabled === true) {
                            mailEnabled = '<td><i class="fas fa-check-circle text-success fa-2x"></i></td>';
                        } else {
                            mailEnabled = '<td><i class="fas fa-times-circle text-muted fa-2x"></i></a></td>';
                        }

                        var securityGroup;
                        if (value.SecurityGroup === true) {
                            securityGroup = '<td><i class="fas fa-check-circle text-success fa-2x"></i></td>';
                        } else {
                            securityGroup = '<td><i class="fas fa-times-circle text-muted fa-2x"></i></a></td>';
                        }

                        var onPremisesSyncEnabled;
                        if (value.OnPremisesSync === true) {
                            onPremisesSyncEnabled = '<td><i class="fas fa-check-circle text-success fa-2x"></i></td>';
                        } else {
                            onPremisesSyncEnabled = '<td><i class="fas fa-times-circle text-muted fa-2x"></i></a></td>';
                        }

                        var isAssignableToRole;
                        if (value.IsAssignableToRole === true) {
                            isAssignableToRole = '<td><i class="fas fa-check-circle text-success fa-2x"></i></td>';
                        } else {
                            isAssignableToRole = '<td><i class="fas fa-times-circle text-muted fa-2x"></i></a></td>';
                        }

                        var tbl_row = `<tr><td><a href="https://aad.portal.azure.com/${TenantID}/#blade/Microsoft_AAD_IAM/GroupDetailsMenuBlade/Overview/groupId/${value.id}">${value.DisplayName}</a></td>
                        ${mailEnabled}
                        <td>${value.Mail}</td>
                        ${securityGroup}
                        <td>${value.GroupTypes}</td>
                        ${onPremisesSyncEnabled}
                        ${isAssignableToRole}</tr>`

                        $(tbl_body).append(tbl_row);
                    });
                    $("#UserGroups").append(tbl_body);
                }
            }
            ),
            $.ajax({
                'async': true,
                'global': false,
                'url': 'api/ListUserSigninLogs?TenantFilter=' + TenantID + '&UserID=' + UserID,
                'dataType': "json",
                'success': function (data, type, row) {
                    var tbl_body = document.createElement("tbody");
                    $.each(data, function (index, value) {
                        var LoginStateIcon;
                        if (value.LoginStatus === 0) {
                            LoginStateIcon = '<td><i class="fas fa-check-circle text-success fa-2x"></i></td>';
                        } else {
                            LoginStateIcon = '<td><i class="fas fa-times-circle text-danger fa-2x"></i></a></td>';
                        }
                        var ConditionalAccessStatusIcon;
                        if (value.ConditionalAccessStatus === 'success') {
                            ConditionalAccessStatusIcon = '<td><i class="fas fa-check-circle text-success fa-2x"></i></td>';
                        } else {
                            ConditionalAccessStatusIcon = '<td><i class="fas fa-times-circle text-danger fa-2x"></i></a></td>';
                        }
                        var TableOpener;
                        var OverallLoginStatusIcon;
                        if (value.OverallLoginStatus === 'Success') {
                            OverallLoginStatusIcon = '<td><i class="fas fa-check-circle text-success fa-2x"></i></td>';
                            TableOpener = '<tr>'
                        } else {
                            OverallLoginStatusIcon = '<td><i class="fas fa-times-circle text-danger fa-2x"></i></a></td>';
                            TableOpener = '<tr class="table-danger">'
                        }
                        var DeviceCompliant;
                        if (value.OverallLoginStatus === true) {
                            DeviceCompliant = '<td><i class="fas fa-check-circle text-success fa-2x"></i></td>';
                        } else {
                            DeviceCompliant = '<td><i class="fas fa-times-circle text-danger fa-2x"></i></a></td>';
                        }
                        var captblname = "captbl" + value.id.toString();
                        var fulldetailsname = "fullDetails" + value.id.toString();
                        var additionaldetailsname = "additionalDetails" + value.id.toString();
                        var tbl_row = `${TableOpener}<td>${value.Date}</td>
                        <td>${value.Application}</td>
                        ${LoginStateIcon}
                        ${ConditionalAccessStatusIcon}
                        ${OverallLoginStatusIcon}
                        <td>${value.IPAddress}</td>
                        <td>${value.Town}</td>
                        <td>${value.State}</td>
                        <td>${value.Country}</td>
                        <td>${value.Device}</td>
                        ${DeviceCompliant}
                        <td>${value.OS}</td>
                        <td>${value.Browser}</td>
                        <td>
                        <button type="button" class="btn btn-secondary btn-sm" data-bs-toggle="modal" data-bs-target="#Log${value.id}MoreInfo">More</button>
                        <!-- Modal -->
                        <div class="modal fade" id="Log${value.id}MoreInfo" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                            <div class="modal-dialog modal-lg">
                                <div class="modal-content">
                                    <div class="modal-header">
                                        <h5 class="modal-title" id="exampleModalLabel">Conditional Access Policies Applied</h3></h5>
                                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                    </div>
                                    <div class="modal-body" id="${captblname}">
                                    </div>
                                    <div class="modal-header">
                                        <h5 class="modal-title" id="exampleModalLabel">Additional Details</h3></h5>
                                    </div>
                                    <div class="modal-body" id="${additionaldetailsname}">
                                    </div>
                                    <div class="modal-header">
                                        <h5 class="modal-title" id="exampleModalLabel">Full Details</h3></h5>
                                    </div>
                                    <div class="modal-body" >
                                    <pre id="${fulldetailsname}"></pre>
                                    </div>
                                    <div class="modal-footer">
                                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        </td></tr>`
                        $(tbl_body).append(tbl_row);
                    });
                    $("#UserSignIn").append(tbl_body);
                    $.each(data, function (index, value) {
                        var tbl_cap = $('<table class="table"><tbody>');
                        $.each(value.AppliedCAPs, function (index, capValue) {
                            var CAPTableRow = `<tr><td>${capValue.Name}</td><td>${capValue.Result}</td></tr>`;
                            $(tbl_cap).append($(CAPTableRow));
                        });
                        var additionalDetails = `<table class="table"><tbody>                        
                        <tr><td>Additional Details</td><td>${value.AdditionalDetails}</td></tr>
                        <tr><td>Failure Reason</td><td>${value.FailureReason}</td></tr></tbody></table>`;
                        var captblname = "captbl" + value.id.toString();
                        var fulldetailsname = "fullDetails" + value.id.toString();
                        var additionaldetailsname = "additionalDetails" + value.id.toString();
                        $('#' + fulldetailsname).append(JSON.stringify(value.FullDetails, null, 2));
                        $('#' + captblname).append(tbl_cap);
                        $('#' + additionaldetailsname).append(additionalDetails);
                    });
                }
            }
            ),
            $.ajax({
                'async': true,
                'global': false,
                'url': 'api/ListUserMailboxDetails?TenantFilter=' + TenantID + '&UserID=' + UserID,
                'dataType': "json",
                'success': function (data) {
                    var forwardingDeliver;
                    if (data[0].ForwardAndDeliver === true) {
                        forwardingDeliver = '<td><i class="fas fa-check-circle text-success fa-2x"></i></td>';
                    } else {
                        forwardingDeliver = '<td><i class="fas fa-times-circle text-muted fa-2x"></i></a></td>';
                    }
                    var hiddenFromAddress;
                    if (data[0].HiddenFromAddressLists === true) {
                        hiddenFromAddress = '<td><i class="fas fa-check-circle text-muted fa-2x"></i></td>';
                    } else {
                        hiddenFromAddress = '<td><i class="fas fa-times-circle text-muted fa-2x"></i></a></td>';
                    }
                    var litiationHold;
                    if (data[0].LitiationHold === true) {
                        litiationHold = '<td><i class="fas fa-check-circle text-muted fa-2x"></i></td>';
                    } else {
                        litiationHold = '<td><i class="fas fa-times-circle text-muted fa-2x"></i></a></td>';
                    }
                    var EWSEnabled;
                    if (data[0].EWSEnabled === true) {
                        EWSEnabled = '<td><i class="fas fa-check-circle text-muted fa-2x"></i></td>';
                    } else {
                        EWSEnabled = '<td><i class="fas fa-times-circle text-muted fa-2x"></i></a></td>';
                    }
                    var MailboxMAPIEnabled;
                    if (data[0].MailboxMAPIEnabled === true) {
                        MailboxMAPIEnabled = '<td><i class="fas fa-check-circle text-muted fa-2x"></i></td>';
                    } else {
                        MailboxMAPIEnabled = '<td><i class="fas fa-times-circle text-muted fa-2x"></i></a></td>';
                    }
                    var MailboxOWAEnabled;
                    if (data[0].MailboxOWAEnabled === true) {
                        MailboxOWAEnabled = '<td><i class="fas fa-check-circle text-muted fa-2x"></i></td>';
                    } else {
                        MailboxOWAEnabled = '<td><i class="fas fa-times-circle text-muted fa-2x"></i></a></td>';
                    }
                    var MailboxImapEnabled;
                    if (data[0].MailboxImapEnabled === true) {
                        MailboxImapEnabled = '<td><i class="fas fa-check-circle text-muted fa-2x"></i></td>';
                    } else {
                        MailboxImapEnabled = '<td><i class="fas fa-times-circle text-muted fa-2x"></i></a></td>';
                    }
                    var MailboxPopEnabled;
                    if (data[0].MailboxPopEnabled === true) {
                        MailboxPopEnabled = '<td><i class="fas fa-check-circle text-muted fa-2x"></i></td>';
                    } else {
                        MailboxPopEnabled = '<td><i class="fas fa-times-circle text-muted fa-2x"></i></a></td>';
                    }
                    var MailboxActiveSyncEnabled;
                    if (data[0].MailboxActiveSyncEnabled === true) {
                        MailboxActiveSyncEnabled = '<td><i class="fas fa-check-circle text-muted fa-2x"></i></td>';
                    } else {
                        MailboxActiveSyncEnabled = '<td><i class="fas fa-times-circle text-muted fa-2x"></i></a></td>';
                    }
                    var SpamBlocked;
                    if (data[0].BlockedForSpam === true) {
                        SpamBlocked = '<td><i class="fas fa-times-circle text-danger fa-2x"></i></td>';
                    } else {
                        SpamBlocked = '<td><i class="fas fa-check-circle text-muted fa-2x"></i></a></td>';
                    }

                    var emailSettings = `<table class="table"><tbody>
                    <tr><td>User Not Restricted</td><td>${SpamBlocked}</td></tr>
                    <tr><td>Litation Hold</td><td>${litiationHold}</td></tr>
                    <tr><td>Hidden from Address Lists</td><td>${hiddenFromAddress}</td></tr>
                    <tr><td>EWS Enabled</td><td>${hiddenFromAddress}</td></tr>
                    <tr><td>MAPI Enabled</td><td>${MailboxMAPIEnabled}</td></tr>
                    <tr><td>OWA Enabled</td><td>${MailboxOWAEnabled}</td></tr>
                    <tr><td>IMAP Enabled</td><td>${MailboxImapEnabled}</td></tr>
                    <tr><td>POP Enabled</td><td>${MailboxPopEnabled}</td></tr>
                    <tr><td>Active Sync Enabled</td><td>${MailboxActiveSyncEnabled}</td></tr>
                    <tr><td>Forward and Deliver</td><td>${forwardingDeliver}</td></tr>
                    <tr><td>Forwarding Address</td><td>${data[0].ForwardingAddress}</td></tr>
                    </tbody></table>`
                    $("#EmailSettings").html(emailSettings);


                    var usedPercent = (data[0].TotalItemSize / data[0].ProhibitSendReceiveQuota) * 100;
                    if (usedPercent >= 95) { var colourCalculation = "bg-danger" }
                    if (usedPercent < 95 && usedPercent >= 90) { var colourCalculation = "bg-warning" }
                    if (usedPercent < 90) { var colourCalculation = "bg-success" }

                    var emailUsage = `<table class="table"><tbody>
                    <tr><td>Total Items</td><td>${data[0].ItemCount}</td></tr>
                    <tr><td>Total Size</td><td>${data[0].TotalItemSize} GB</td></tr>
                    <tr><td>Prohibit Send</td><td>${data[0].ProhibitSendQuota} GB</td></tr>
                    <tr><td>Total Send & Recieve</td><td>${data[0].ProhibitSendReceiveQuota} GB</td></tr>
                    <tr><td>Usage</td><td><div class="progress"><div class="progress-bar ${colourCalculation}" role="progressbar" style="width: ${usedPercent}%" aria-valuenow="${data[0].TotalItemSize}" aria-valuemin="0" aria-valuemax="${data[0].ProhibitSendReceiveQuota}">${usedPercent}%</div></div></td></tr></tbody></table>`
                    $("#EmailUsage").html(emailUsage);


                    var emailPermissions = $('<table class="table"><thead><tr><th>User</th><th>Permissions</th></thead><tbody>');
                    $.each(data[0].Permissions, function (index, value) {
                        var TableRow = `<tr><td>${value.User}</td><td>${value.AccessRights}</td></tr>`;
                        $(emailPermissions).append(TableRow);
                    });
                    $("#EmailPermissions").html(emailPermissions);
                }
            }
            )

    }
    //only shows input when needed
    $('input[type="checkbox"]').click(function () {
        var inputValue = $(this).attr("switches");
        $("#" + inputValue).toggle();
    });
    //only shows license list when needed
    $('input[type="radio"]').click(function () {
        var inputValue = $(this).attr("switches");
        $("#" + inputValue).toggle();
    });
    //fills the usage location array from a local json for speed.
    var UsageLocationList = document.getElementById('UsageLocationList');
    $.getJSON("js/countrylist.json", function (data) {
        data.forEach(function (item) {
            var option = document.createElement('option');
            option.value = item.Code
            option.text = item.Name;
            UsageLocationList.appendChild(option);
        });
        var LastLocation = localStorage.getItem('DefaultLocation')
        if (LastLocation) {
            $('#LocationDataList').val(LastLocation)
        }
    }).fail(function () {
        console.log("An error has occurred.");
    });

    //Creates licenses checkboxes

    (function () {
        $.ajax({
            'async': true,
            'global': false,
            'url': 'api/ListLicenses?TenantFilter=' + TenantID,
            'dataType': "json",
            'success': function (data) {
                if (Array.isArray(data)) {
                    // Loop over the JSON array.
                    data.forEach(function (item) {
                        var html = '<div class="form-check"><input class="form-check-input" id="' + item.skuId + '" name="License_' + item.skuId + '" type="checkbox" value="' + item.skuId + '" /><label class="form-check-label" for="' + item.skuId + '">' + item.skuPartNumber + ' (' + item.availableUnits + ' available)</label></div>';
                        $('#LicenseList').append(html)
                    });
                } else {
                    var html = '<div class="form-check"><input class="form-check-input" id="' + data.skuId + '" name="License_' + data.skuId + '" type="checkbox" value="' + data.skuId + '" /><label class="form-check-label" for="' + data.skuId + '">' + data.skuPartNumber + ' (' + data.availableUnits + ' available)</label></div>';
                    $('#LicenseList').append(html)
                }
            }
        });
    })();

    var DomainOption = document.getElementById('DomainOption');
    (function () {
        $.ajax({
            'async': true,
            'global': false,
            'url': 'api/ListDomains?TenantFilter=' + TenantID,
            'dataType': "json",
            'success': function (data) {
                if (Array.isArray(data)) {
                    // Loop over the JSON array.
                    data.forEach(function (item) {
                        var option = document.createElement('option');
                        option.value = item.id
                        option.text = item.id;
                        DomainOption.appendChild(option);

                    });
                } else {
                    var option = document.createElement('option');
                    option.value = data.id
                    option.text = data.id;
                    DomainOption.appendChild(option);
                }
            }
        });
    })();

    //append tenant in back to users
    if (TenantID !== '') {
        var href = $(".back-to-users").attr("href");
        $(".back-to-users").attr("href", href + "&Tenantfilter=" + TenantID);
    }
    //checks if a user location has been filled in, and if so, add it as the default 
    $("#LocationDataList").change(function () {
        localStorage.setItem('DefaultLocation', $(this).val())
    });
});
