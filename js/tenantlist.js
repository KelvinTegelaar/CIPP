var tenants = [];
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
                tenants.push(item);
                var option = document.createElement('option');
                option.value = item.defaultDomainName;
                option.text = item.displayName;
                dataList.appendChild(option);
            });
        }
    });
});

function onInput() {
    var val = document.getElementById("exampleDataList").value;
    var existingTenant = tenants.filter(obj => {
        return obj.defaultDomainName == val;
    });

    if(existingTenant.length > 0) {
        history.pushState(null, null, '?page=SharepointList&Tenantfilter=' + existingTenant[0].defaultDomainName);
        $('#bodycontent').load('SharepointList.html');
    }
}


