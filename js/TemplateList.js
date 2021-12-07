
$(document).ready(function () {

    var dataList = document.getElementById('TemplateListOptions');
    $.ajax({
        'async': true,
        'global': false,
        'url': 'api/ListIntuneTemplates',
        'dataType': "json",
        'beforeSend': function () {
            $("#TemplateList").val('Loading templates..');
        },
        'success': function (data) {
            data.forEach(function (item) {
                var option = document.createElement('option');
                option.value = item.Displayname;
                option.text = item.Description;
                option.setAttribute('guid', item.GUID);
                dataList.appendChild(option);
                $("#TemplateList").val('')
            });
        },
        'error': function (xhr, ajaxOptions, thrownError) {
            $("#TemplateList").val('Could not load users: Failed to connect to API:' + thrownError);
        }
    });

});

function onInputTemplateList() {
    var val = document.getElementById("TemplateList").value;
    var guid = $('#TemplateListOptions [value="' + val + '"]').attr('guid')
    $.ajax({
        'async': true,
        'global': false,
        'url': 'api/ListIntuneTemplates?ID=' + guid,
        'dataType': "json",
        'success': function (data) {
            $('#Displayname').val(data[0].Displayname)
            $('#Description').val(data[0].Description)
            $('#TemplateType').val(data[0].Type)
            $('#RawJSON').val(data[0].RAWJson)

        }
    });

}
