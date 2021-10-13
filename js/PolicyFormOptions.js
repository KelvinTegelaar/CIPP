$(document).ready(function () {
    //gets the current Tenantfilter
    let searchParams = new URLSearchParams(window.location.search)
    if (searchParams.has('Tenantfilter')) {
        var TenantID = searchParams.get('Tenantfilter')
    }
    //checks if a ID is present, and if so, we prefill the form.
    if (searchParams.has('ID')) {
        var ID = searchParams.get('ID')
        $('#ID').val(ID)
        $('#tenantID').val(TenantID)
        $.ajax({
            'async': true,
            'global': false,
            'url': 'api/ListIntunePolicy?TenantFilter=' + TenantID + '&ID=' + ID,
            'dataType': "json",
            'success': function (data) {
                //basic fields
                $('#DisplayName').val(data[0].displayName)
                $('#Description').val(data[0].description)
                //extended fields
                $('#RawJson').text(JSON.stringify(data, null, 2))
            }
        }
        )

    }


});

