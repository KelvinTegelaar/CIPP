$(document).ready(function () {
    let searchParams = new URLSearchParams(window.location.search)
    var TenantID = '';
    var UserID = '';
    UserID = searchParams.get('UserID')
    TenantID = searchParams.get('Tenantfilter')
    $('#TenantFilter').val(TenantID)
    $('#UserID').val(UserID)

    $.ajax({
        'async': true,
        'global': false,
        'url': 'api/ExecBECCheck?TenantFilter=' + TenantID + '&userid=' + UserID,
        'dataType': "json",
        'contentType': "application/json",
        'success': function (data) {
            $('#loader').html(`<i class="fas fa-check-circle text-success fa-2x"></i>`)
            //activesync
            if (data.SuspectUserDevices != "") {
                data.SuspectUserDevices.forEach(function (item) {
                    $('#Devices').append(`<tr><td>${item.DeviceModel}</td><td>${item.FirstSyncTime}</td><td>${item.DeviceUserAgent}</td></tr>`);
                });
            } else {
                $('#Devices').append(`<tr><td>No information found - Please run HAWK for a full overview</td><td></td><td></td></tr>`);

            }
            //lastlogon event
            if (data.LastSuspectUserLogon.ErrorCode != null) {
                data.LastSuspectUserLogon.forEach(function (item) {
                    $('#LastUserLogons').append(`<tr><td>${item.AppDisplayName}</td><td>${item.CreatedDateTime}</td><td>${item.Status.ErrorCode}</td><td>${item.Status.AdditionalDetails}</td></tr>`);
                });
            } else {
                $('#LastUserLogons').append(`<tr><td>No information found - Please run HAWK for a full overview</td><td></td><td></td></tr>`);

            }
            //lastlogon event
            if (data.SuspectUserMailboxLogons != "") {
                data.SuspectUserMailboxLogons.forEach(function (item) {
                    $('#Logons').append(`<tr><td>${item.ClientIP}</td><td>${item.UserId}</td><td>${item.ClientInfoString}</td><td>${item.ResultStatus}</td><td>${item.CreationTime}</td></tr>`);
                });
            } else {
                $('#Logons').append(`<tr><td>No information found - Please run HAWK for a full overview</td><td></td><td></td></tr>`);

            }
            if (data.ChangedPasswords != "") {
                data.ChangedPasswords.forEach(function (item) {
                    $('#Passwords').append(`<tr><td>${item.ObjectId}</td><td>${item.CreationTime}</td><td>${item.Operation}</td><td>${item.UserId}</td></tr>`);
                });
            } else {
                $('#Passwords').append(`<tr><td>No information found - Please run HAWK for a full overview</td><td></td><td></td></tr>`);

            }
            if (data.NewRules != "") {
                data.NewRules.forEach(function (item) {
                    $('#Rules').append(`<tr><td>${item.ClientIP}</td><td>${item.Parameters[3].Value}</td><td>${item.CreationTime}</td><td>${item.UserId}</td></tr>`);
                });
            } else {
                $('#Rules').append(`<tr><td>No information found - Please run HAWK for a full overview</td><td></td><td></td></tr>`);

            }
            if (data.MailboxPermissionChanges != "") {
                data.MailboxPermissionChanges.forEach(function (item) {
                    if (item.Operation === "Add-MailboxPermission" || item.Operation === "Remove-MailboxPermission") {
                        $('#Permissions').append(`<tr><td>${item.Operation}</td><td>${item.UserKey}</td><td>${item.ObjectId}</td><td>${item.Parameters[3].Value}</td></tr>`);
                    }
                    else {
                        $('#Permissions').append(`<tr><td>${item.Operation}</td><td>${item.UserKey}</td><td>${item.MailboxOwnerUPN}${item.Item.ParentFolder.Path}</td><td>${item.Item.ParentFolder.MemberRights}</td></tr>`)
                    }
                });
            } else {
                $('#Permissions').append(`<tr><td>No information found - Please run HAWK for a full overview</td><td></td><td></td></tr>`);

            }
            if (data.AddedApps != "") {
                data.AddedApps.forEach(function (item) {
                    $('#OauthChanges').append(`<tr><td>${item.Operation}</td><td>${item.UserId}</td><td>${item.ObjectId}</td><td>${item.ResultStatus}</td></tr>`);
                });
            } else {
                $('#OauthChanges').append(`<tr><td>No information found - Please run HAWK for a full overview</td><td></td><td></td></tr>`);

            }

            if (data.NewUsers != "") {
                data.NewUsers.forEach(function (item) {
                    $('#NewUsers').append(`<tr><td>${item.ObjectId}</td><td>${item.CreationTime}</td><td>${item.UserId}</td></tr>`);
                });
            } else {
                $('#NewUsers').append(`<tr><td>No information found - Please run HAWK for a full overview</td><td></td><td></td></tr>`);

            }
        },
        'error': function (xhr, ajaxOptions, thrownError) {
            $("#loader").html('<i class="fas fa-times-circle text-danger fa-2x"></i>Error - could not retrieve information from API. Please run HAWK instead.')
        }
    });
})
