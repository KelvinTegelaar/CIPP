$(document).ready(function () {
    var todayDate = new Date().toISOString().slice(0, 10);
    let searchParams = new URLSearchParams(window.location.search)
    if (searchParams.has('Tenantfilter')) {
        var TenantID = searchParams.get('Tenantfilter')
    } else {
        TenantID = null
    }
    $('.datatable-1').dataTable(
        {
            language: {
                paginate: {
                    next: '<i class="fas fa-arrow-right"></i>',
                    previous: '<i class="fas fa-arrow-left"></i>'
                }
            },
            "columnDefs": [
                { "className": "dt-center", "targets": [1, 2, 3, 4] },
                { "width": "10%", "targets": -1 }

            ],
            "deferRender": true,
            "pageLength": 25,
            responsive: true,
            "ajax": {

                "url": "/api/ListMFAUsers?TenantFilter=" + TenantID,
                "dataSrc": "",
            },
            dom: 'fBlrtip',
            buttons: [
                { extend: 'copyHtml5', className: 'btn btn-primary btn-sm' },
                { extend: 'excelHtml5', className: 'btn btn-primary btn-sm', title: 'User List - ' + TenantID + " - " + todayDate, exportOptions: { columns: [0, 1, 2, 3, 4] } },
                { extend: 'csvHtml5', className: 'btn btn-primary btn-sm', title: 'User List - ' + TenantID + " - " + todayDate, exportOptions: { columns: [0, 1, 2, 3, 4] } },
                { extend: 'pdfHtml5', className: 'btn btn-primary btn-sm', orientation: 'landscape', title: 'User List - ' + TenantID + " - " + todayDate, exportOptions: { columns: [0, 1, 2, 3, 4] } },
            ],
            "columns": [
                { "data": "UPN" },
                { "data": "PerUser" },
                { "data": "MFARegistration" },
                { "data": "CoveredByCA" },
                { "data": "CoveredBySD" }
            ],
            "order": [[0, "asc"]],
        });
    $('.dataTables_paginate').addClass("btn-group datatable-pagination");
    $('.dataTables_paginate > a').wrapInner('<span />');


});