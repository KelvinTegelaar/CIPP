$(document).ready(function () {
    $('#datatable-1').SetEditable();
    $('#but_add').click(function () {
        rowAddNewAndEdit('datatable-1');
    });

    $(".wizardbutton").click(function (e) {
        e.preventDefault();
        $($(this).attr('href')).tab("show");
    });

    $("#SendData").click(function (e) {
        var currentdata = $('#Devices').val()
        if (currentdata == "") {
            var SendingData = TableToCSV('datatable-1', ',');
            $('#Devices').val(SendingData)
        }
    });


    $('#upload').click(function (e) {
        e.preventDefault();
        $('#filename').click()
    });
    $('#filename').change(function (e) {
        var csv = $('#filename');
        var csvFile = csv[0].files[0];
        if (csvFile != undefined) {
            reader = new FileReader();
            reader.onload = function (e) {
                csvResult = e.target.result
                $('#Devices').val(csvResult);
            }
            reader.readAsText(csvFile);
        }
    });
});

