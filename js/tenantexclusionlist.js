$(document).ready(function () {
    (function () {
        $.ajax({
            'async': true,
            'global': false,
            'url': 'api/ExecExcludeTenant?List=true',
            'dataType': "json",
            'success': function (data) {
                if (Array.isArray(data)) {
                    // Loop over the JSON array.
                    var html = [];
                    data.forEach(function (item) {
                        var htmldata = `<div class="d-flex align-items-center justify-content-between px-4">
                            <div class="d-flex align-items-center">
                            <i class="fas fa-exclamation-triangle fa-2x text-yellow"></i></i>
                            <div class="ms-4">
                            <div class="small">${item.Name}</div>
                            <div class="text-xs text-muted">Added on ${item.Date}</div>
                            </div>
                            </div>
                            <div class="ms-4 small">
                            <div class="badge bg-light text-dark me-3">Added by ${item.User}</div>
                            <nothing class="APILink"><a actionname="Remove the exclusion for ${item.Name}" href="api/ExecExcludeTenant?RemoveExclusion=True&TenantFilter=${item.Name}">Remove</a></nothing>
                            </div>
                            </div>
                            <hr />`;
                        html.push(htmldata)
                    });
                } else {
                    var html = '<div class="d-flex align-items-center justify-content-between px-4">' +
                        '<div class="d-flex align-items-center">' +
                        '<i class="fas fa-exclamation-triangle fa-2x text-yellow"></i></i>' +
                        '<div class="ms-4">' +
                        '<div class="small">' + data.Name + '</div>' +
                        '<div class="text-xs text-muted">Added on ' + data.Date + '</div>' +
                        '</div>' +
                        '</div>' +
                        '<div class="ms-4 small">' +
                        '<div class="badge bg-light text-dark me-3">Added by ' + data.User + '</div>' +
                        '<nothing class="APILink"> <a actionname="Remove the exclusion for ' + data.Name + '" href="api/ExecExcludeTenant?RemoveExclusion=True&TenantFilter=' + data.Name + '">Remove</a></nothing>' +
                        '</div>' +
                        '</div>' +
                        '<hr />';
                }
                $('#ExclusionList').append(html)
            }
        });
        return json;
    })();


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
