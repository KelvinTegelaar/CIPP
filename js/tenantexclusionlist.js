$(document).ready(function () {
    var jsonOptions = (function () {
        var json = null;
        $.ajax({
            'async': false,
            'global': false,
            'url': 'api/ExecExcludeTenant?List=true',
            'dataType': "json",
            'success': function (data) {
                json = data;
            }
        });
        return json;
    })();
    if (Array.isArray(jsonOptions)) {
        // Loop over the JSON array.
        jsonOptions.forEach(function (item) {
            var html = '<div class="d-flex align-items-center justify-content-between px-4">' +
                '<div class="d-flex align-items-center">' +
                '<i class="fas fa-exclamation-triangle fa-2x text-yellow"></i></i>' +
                '<div class="ms-4">' +
                '<div class="small">' + item.Name + '</div>' +
                '<div class="text-xs text-muted">Added on ' + item.Date + '</div>' +
                '</div>' +
                '</div>' +
                '<div class="ms-4 small">' +
                '<div class="badge bg-light text-dark me-3">Added by ' + item.User + '</div>' +
                '<nothing class="APILink"><a actionname="Remove the exclusion for ' + item.Name + '" href="api/ExecExcludeTenant?RemoveExclusion=True&TenantFilter=' + item.Name + '">Remove</a></nothing>' +
                '</div>' +
                '</div>' +
                '<hr />';
            $('#ExclusionList').append(html)
        });
    } else {
        var html = '<div class="d-flex align-items-center justify-content-between px-4">' +
            '<div class="d-flex align-items-center">' +
            '<i class="fas fa-exclamation-triangle fa-2x text-yellow"></i></i>' +
            '<div class="ms-4">' +
            '<div class="small">' + jsonOptions.Name + '</div>' +
            '<div class="text-xs text-muted">Added on ' + jsonOptions.Date + '</div>' +
            '</div>' +
            '</div>' +
            '<div class="ms-4 small">' +
            '<div class="badge bg-light text-dark me-3">Added by ' + jsonOptions.User + '</div>' +
            '<nothing class="APILink"> <a actionname="Remove the exclusion for ' + jsonOptions.Name + '" href="api/ExecExcludeTenant?RemoveExclusion=True&TenantFilter=' + jsonOptions.Name + '">Remove</a></nothing>' +
            '</div>' +
            '</div>' +
            '<hr />';
        $('#ExclusionList').append(html)
    }

});

function AddExcludedTenant() {
    $("#Spinner-tenants").hide();
    $("#tenantselector").show();
    document.getElementById("PopModal").click();
    //$("#tenantselector").hide();
}

function onExcludeInput() {
    var val = document.getElementById("exampleDataList").value;
    var opts = document.getElementById('datalistOptions').childNodes;
    for (var i = 0; i < opts.length; i++) {
        if (opts[i].value === val) {
            opts[i].text;
            var jsonOptions = (function () {
                var json = null;
                $.ajax({
                    'async': true,
                    'global': false,
                    'url': 'api/ExecExcludeTenant?AddExclusion=True&TenantFilter=' + opts[i].value,
                    'dataType': "json",
                    'success': function (data) {
                        json = data;
                        $('#APIContent').html(json.Results);
                    },
                    'error': function (xhr, ajaxOptions, thrownError) {
                        $('#APIContent').html('Failed to connect to API: ' + thrownError);
                    }
                });
                return json;
            })();
            $("#tenantselector").hide();
            $("#Spinner-tenants").show();

        }
    }
}
