$(document).ready(function () {
    $('.datatable-1').dataTable(
        {
            language: {
                paginate: {
                    next: '<i class="fas fa-arrow-right"></i>',
                    previous: '<i class="fas fa-arrow-left"></i>'
                }
            },
            "deferRender": true,
            "pageLength": 25,
            responsive: true,
            "ajax": {

                "url": "/api/logs",
                "dataSrc": "",
            },
            dom: 'fBlrtip',
            buttons: [
                { extend: 'copyHtml5', className: 'btn btn-primary btn-sm' },
                { extend: 'excelHtml5', className: 'btn btn-primary btn-sm' },
                { extend: 'csvHtml5', className: 'btn btn-primary btn-sm' },
                { extend: 'pdfHtml5', className: 'btn btn-primary btn-sm' },
            ],
            "columns": [
                { "data": "DateTime" },
                { "data": "API" },
                { "data": "Tenant" },
                { "data": "Message" },
                { "data": "User" },
                { "data": "Severity" }
            ],
            "order": [[0, "desc"]],
        });
    $('.dataTables_paginate').addClass("btn-group datatable-pagination");
    $('.dataTables_paginate > a').wrapInner('<span />');
});
