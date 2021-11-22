$(document).ready(function () {
    //gets the current Tenantfilter
    let searchParams = new URLSearchParams(window.location.search)
    if (searchParams.has('Tenantfilter')) {
        var TenantID = searchParams.get('Tenantfilter')
    }
    //checks if a GroupID is present, and if so, we prefill the form.
    if (searchParams.has('UserID')) {
        var UserID = searchParams.get('UserID')
        $.ajax({
            'async': true,
            'global': false,
            'url': 'api/ListMailboxPermissions?TenantFilter=' + TenantID + '&UserID=' + UserID,
            'dataType': "json",
            'success': function (data) {
                if (Array.isArray(data)) {
                    // Loop over the JSON array.
                    data.forEach(function (item) {
                        $('#currentMembers').append('<li>' + item.User + ' - ' + item.AccessRights + '</li>')
                    });

                }
            }
        }
        )

    }
});

