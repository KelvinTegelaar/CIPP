
$(document).ready(function () {
    var todayDate = new Date().toISOString().slice(0, 10);

    var oTable = $('.datatable-1').dataTable(
        {
            language: {
                paginate: {
                    next: '<i class="fas fa-arrow-right"></i>',
                    previous: '<i class="fas fa-arrow-left"></i>'
                }
            },
            "columnDefs": [
                { "className": "dt-center", "targets": [-1] },

            ],
            "deferRender": true,
            "pageLength": 10,
            "ajax": {

                "url": "/api/ListIntuneTemplates",
                "dataSrc": "",
            },
            dom: 'fBlrtip',
            buttons: [
                { extend: 'copyHtml5', className: 'btn btn-primary btn-sm' },
                { extend: 'excelHtml5', className: 'btn btn-primary btn-sm', title: 'Applied Standards - ' + todayDate, exportOptions: { columns: [0, 1, 2] } },
                { extend: 'csvHtml5', className: 'btn btn-primary btn-sm', title: 'Applied Standards - ' + todayDate, exportOptions: { columns: [0, 1, 2] } },
                { extend: 'pdfHtml5', className: 'btn btn-primary btn-sm', orientation: 'landscape', title: 'Applied Standards - ' + todayDate, exportOptions: { columns: [0, 1, 2] } },
            ],
            "columns": [
                { "data": "Displayname" },
                { "data": "Description" },
                { "data": "Type" },
                { "data": "RAWJson" },
                {
                    "data": "GUID",
                    render: function (id, type, row) { return '<nothing class="APILink"><a actionname="remove policy template ' + row.Displayname + '" href="api/RemoveIntuneTemplate?ID=' + id + '"><i class="fas fa-trash-alt fa-fw"></i></a></nothing>' }
                },
            ],
            "order": [[0, "asc"]],

        });
    $('.dataTables_paginate').addClass("btn-group datatable-pagination");
    $('.dataTables_paginate > a').wrapInner('<span />');
});
