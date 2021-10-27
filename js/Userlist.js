
$(document).ready(function () {
    var tenants = [];
    let searchParams = new URLSearchParams(window.location.search)
    var tenantSelectID = '';
    if (searchParams.has('Tenantfilter')) {
        tenantSelectID = searchParams.get('Tenantfilter')
    } else {
        $(":text").prop("disabled", true);
        $("#Userlist").prop("disabled", false);
    }

    var dataList = document.getElementById('UserlistOptions');
    $.ajax({
        'async': true,
        'global': false,
        'url': 'api/Listusers?tenantfilter=' + tenantSelectID,
        'dataType': "json",
        'beforeSend': function () {
            $("#Userlist").val('Loading users ...');
        },
        'success': function (data) {
            data.forEach(function (item) {
                tenants.push(item);
                $("#Userlist").prop("disabled", false);
                var option = document.createElement('option');
                option.value = item.userPrincipalName;
                option.text = item.displayName;
                dataList.appendChild(option);
                $("#Userlist").val('')
            });
        },
        'error': function (xhr, ajaxOptions, thrownError) {
            $("#Userlist").val('Could not load users: Failed to connect to API:' + thrownError);
            $("#Userlist").prop("disabled", false);
        }
    });

    $(".wizardbutton").click(function (e) {
        e.preventDefault();
        $($(this).attr('href')).tab("show");
    });


});
