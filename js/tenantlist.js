var tenants = [];
$(document).ready(function () {
    let searchParams = new URLSearchParams(window.location.search)
    var tenantSelectID = '';
    if (searchParams.has('Tenantfilter')) {
        tenantSelectID = searchParams.get('Tenantfilter')
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
                tenants.push(item);
                $("#exampleDataList").prop("disabled", false);
                var option = document.createElement('option');
                option.value = item.defaultDomainName;
                option.text = item.displayName;
                dataList.appendChild(option);
                if (tenantSelectID !== '') {
                    $("#exampleDataList").val(tenantSelectID);
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

    //added datatable error handling here instead of editing all the files
    $.fn.dataTable.ext.errMode = function(settings, helpPage, message) {
        $("#AccountTable tr td").text("Error!");
        $("#toasty .toast-body").text("An error occured. Please review the log.");
        $("#toasty").toast("show");
    }
});

function onInput() {
    let searchParams = new URLSearchParams(window.location.search);
    var val = document.getElementById("exampleDataList").value;
    var existingTenant = tenants.filter(obj => {
        return obj.defaultDomainName == val;
    });

    if(existingTenant.length > 0) {
        history.pushState(null, null, '?page='+ searchParams.get('page') + '&Tenantfilter=' + existingTenant[0].defaultDomainName);
        $('#bodycontent').load(searchParams.get('page') + '.html');
    }
}


