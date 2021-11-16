$('#RawJSON').on('change paste keyup select', function () {
    var form = $('#StandardsForm')
    var postdata = getFormData(form)
    $.ajax({
        'async': true,
        'global': false,
        'url': "api/ExecDecodeIntuneData",
        'type': "post",
        'data': JSON.stringify(postdata),
        'contentType': "application/json",
        'success': function (data) {
            $('#FormOverview').html(data);
        }
    });
});