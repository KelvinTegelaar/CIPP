
$(document).ready(function () {
    var tenants = [];
    let searchParams = new URLSearchParams(window.location.search)
    var tenantSelectID = '';
    if (searchParams.has('Tenantfilter')) {
        tenantSelectID = searchParams.get('Tenantfilter')
    } else {
        $(":text").prop("disabled", true);
        $("#Contactlist").prop("disabled", false);
    }

    var dataList = document.getElementById('ContactlistOptions');
    $.ajax({
        'async': true,
        'global': false,
        'url': 'api/ListContacts?tenantfilter=' + tenantSelectID,
        'dataType': "json",
        'beforeSend': function () {
            $("#Contactlist").val('Loading contacts ...');
        },
        'success': function (data) {
            data.forEach(function (item) {
                tenants.push(item);
                $("#Contactlist").prop("disabled", false);
                var option = document.createElement('option');
                option.value = item.userPrincipalName;
                option.text = item.displayName;
                dataList.appendChild(option);
                $("#Contactlist").val('')
            });
        },
        'error': function (xhr, ajaxOptions, thrownError) {
            $("#Contactlist").val('Could not load contacts: Failed to connect to API:' + thrownError);
            $("#Contactlist").prop("disabled", false);
        }
    });

    $(".wizardbutton").click(function (e) {
        e.preventDefault();
        $($(this).attr('href')).tab("show");
    });


});
