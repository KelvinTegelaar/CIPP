$(".postbec").click(function (e) {
    var form = $('#BECForm');
    var postdata = getFormData(form);
    $.ajax({
        'async': true,
        'global': false,
        'url': 'api/ExecBECCheck',
        'dataType': "json",
        'contentType': "application/json",
        'type': "post",
        'data': JSON.stringify(postdata),
        'success': function (data) {
            var devicestable = []

            data.SuspectUserDevices.forEach(function (item) {
                devicestable.push(`<tr>
                  <td>${item.clientType}</td>
                <td>${item.FirstSyncTime}</td>
                <td>${item.DeviceUserAgent}</td>
                </tr>`)
            });
            var devicetablecomplete = `
            Active Sync Devices:
            <table class="table">
            <tr>
            <th>Client Type</th>
            <th>First Synced</th>
            <th>User Agent</th>
            </tr>
            ${devicestable}
            </table>`

            $("#investigationdata").html(devicetablecomplete)
        },
        'error': function (xhr, ajaxOptions, thrownError) {
            $("#investigationdata").html('Error - could not retrieve information from API. Please run HAWK instead.')
        }
    });
})