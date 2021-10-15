$(document).ready(function () {
    let searchParams = new URLSearchParams(window.location.search)
    if (searchParams.has('Tenantfilter')) {
        var TenantID = searchParams.get('Tenantfilter')
        $("#exampleDataList").val(TenantID);
    }

    var dataList = document.getElementById('datalistOptions');
    $.ajax({
        'async': true,
        'global': false,
        'url': 'api/ListTenants',
        'dataType': "json",
        'success': function (data) {
            data.forEach(function (item) {
                var option = document.createElement('option');

                option.value = item.displayName;
                option.text = item.defaultDomainName;
                dataList.appendChild(option);
            });
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


