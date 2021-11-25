$(document).ready(function () {
    //gets the current Tenantfilter
    let searchParams = new URLSearchParams(window.location.search)
    var TenantID = '';
    if (searchParams.has('Tenantfilter')) {
        TenantID = searchParams.get('Tenantfilter')
    }

    if (searchParams.has('Tenantfilter')) {
        var TenantFilter = searchParams.get('Tenantfilter')
        $('#tenantID').val(TenantID)
        $.ajax({
            'async': true,
            'global': false,
            'url': 'api/ListTenants?TenantFilter=' + TenantID,
            'dataType': "json",
            'success': function (data) {
                //basic fields
                $('#displayName').val(data.displayName)
                $('#defaultDomainName').val(data.defaultDomainName)
                $('#id').val(data.id)
                //extended fields
                $('#RawJson').text(JSON.stringify(data, null, 2))
            }
        }
        )

    }


});

