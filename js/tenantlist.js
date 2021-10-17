$(document).ready(function () {

    let searchParams = new URLSearchParams(window.location.search)
    if (searchParams.has('Tenantfilter')) {
        var TenantID = searchParams.get('Tenantfilter')
    } else {
        $(":text").prop("disabled", true);
        $("#exampleDataList").prop("disabled", false);
    }

    var dataList = document.getElementById('datalistOptions');
    $.ajax({
        'async': true,
        'global': false,
        'url': 'api/ListTenants',
        'dataType': "json",
        'beforeSend': function () {
            $("#exampleDataList").val('Loading tenants...');
        },
        'success': function (data) {
            data.forEach(function (item) {
                $("#exampleDataList").prop("disabled", false);
                var option = document.createElement('option');

                option.value = item.displayName;
                option.text = item.defaultDomainName;
                dataList.appendChild(option);
                if (TenantID) {
                    $("#exampleDataList").val(TenantID);
                } else {
                    $("#exampleDataList").val('');
                }
            });
        },
        'error': function (xhr, ajaxOptions, thrownError) {
            $("#exampleDataList").val('Could not load tenants: Failed to connect to API:' + thrownError);
            $("#exampleDataList").prop("disabled", false);
        }

    });

});

function onInput() {
    var val = document.getElementById("exampleDataList").value;
    var opts = document.getElementById('datalistOptions').childNodes;
    for (var i = 0; i < opts.length; i++) {
        if (opts[i].value === val) {
            let searchParams = new URLSearchParams(window.location.search)
            if (searchParams.has('Tenantfilter')) {
                var href = new URL(window.location.href)
                href.searchParams.set('Tenantfilter', opts[i].text);
                window.location.href = href.toString()
            } else {
                window.location.href = window.location.href + "&Tenantfilter=" + opts[i].text;
            }
        }
    }
}


