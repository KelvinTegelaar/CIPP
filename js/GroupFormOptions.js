$(document).ready(function () {
    //gets the current Tenantfilter
    let searchParams = new URLSearchParams(window.location.search)
    if (searchParams.has('Tenantfilter')) {
        var TenantID = searchParams.get('Tenantfilter')
    }
    //checks if a GroupID is present, and if so, we prefill the form.
    if (searchParams.has('GroupID')) {
        var GroupID = searchParams.get('GroupID')
        $('#GroupID').val(GroupID)
        $('#tenantID').val(TenantID)
        $.ajax({
            'async': true,
            'global': false,
            'url': 'api/ListGroups?TenantFilter=' + TenantID + '&GroupID=' + GroupID,
            'dataType': "json",
            'success': function (data) {
                //basic fields
                $('#inputdisplayname').val(data[0].displayName)
                $('#Username').val(data[0].mailNickname)
                $('#Domain').val(data[0].primDomain)
                $('#Description').val(data[0].description)
                //extended fields


                $('#RawJson').text(JSON.stringify(data, null, 2))
            }
        }
        )

        $.ajax({
            'async': true,
            'global': false,
            'url': 'api/ListGroups?TenantFilter=' + TenantID + '&GroupID=' + GroupID + '&owners=true',
            'dataType': "json",
            'success': function (data) {
                if (Array.isArray(data)) {
                    // Loop over the JSON array.
                    data.forEach(function (item) {
                        $('#currentMembers').append('<li>' + item.displayName + ' - ' + item.mail + ' - Owner</li>')
                    });
                } else {
                    $('#currentMembers').append('<li>' + data.displayName + ' - ' + data.mail + ' - Owner</li>')
                }
            }
        }
        )

        $.ajax({
            'async': true,
            'global': false,
            'url': 'api/ListGroups?TenantFilter=' + TenantID + '&GroupID=' + GroupID + '&members=true',
            'dataType': "json",
            'success': function (data) {
                if (Array.isArray(data)) {
                    // Loop over the JSON array.
                    data.forEach(function (item) {
                        $('#currentMembers').append('<li>' + item.displayName + ' - ' + item.mail + ' - Member</li>')
                    });
                } else {
                    $('#currentMembers').append('<li>' + data.displayName + ' - ' + data.mail + ' - Member</li>')
                }
            }
        }
        )
    }

    //Creates domain dropdown

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


});

