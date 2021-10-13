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
        var SendingData = TableToCSV('datatable-1', ',');
        $('#Devices').val(SendingData)
    });

});