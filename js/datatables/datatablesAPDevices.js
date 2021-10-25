$(document).ready(function () {
    let searchParams = new URLSearchParams(window.location.search)
    if (searchParams.has('Tenantfilter')) {
        var TenantID = searchParams.get('Tenantfilter')
    }
    var todayDate = new Date().toISOString().slice(0, 10);
    $('.datatable-1').dataTable(
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
            "pageLength": 25,
            responsive: true,
            "ajax": {

                "url": "/api/ListAPDevices?Tenantfilter=" + TenantID,
                "dataSrc": "",
            },
            dom: 'fBlrtip',
            buttons: [
                { extend: 'copyHtml5', className: 'btn btn-primary btn-sm' },
                { extend: 'excelHtml5', className: 'btn btn-primary btn-sm', title: 'Autopilot Device List - ' + TenantID + " - " + todayDate, exportOptions: { columns: [0, 1, 2, 3, 4] } },
                { extend: 'csvHtml5', className: 'btn btn-primary btn-sm', title: 'Autopilot Device List - ' + TenantID + " - " + todayDate, exportOptions: { columns: [0, 1, 2, 3, 4] } },
                { extend: 'pdfHtml5', className: 'btn btn-primary btn-sm', orientation: 'landscape', title: 'Autopilot Device List - ' + TenantID + " - " + todayDate, exportOptions: { columns: [0, 1, 2, 3, 4] } },
            ],
            "columns": [
                { "data": "serialNumber" },
                { "data": "manufacturer" },
                { "data": "model" },
                { "data": "groupTag" },
                { "data": "enrollmentState" },
                {
                    "data": "id",
                    render: function (id, type, row) { return '<nothing class="APILink"><a actionname="remove ' + row.serialNumber + ' from autopilot devices" href=api/RemoveAPDevice?TenantFilter=' + TenantID + '&ID=' + id + '><i data-bs-toggle="tooltip" data-bs-placement="top" title="Remove AP Device" class="fas fa-trash fa-fw"></i>'; }
                }
            ],
            "order": [[0, "asc"]],
        });
    $('.dataTables_paginate').addClass("btn-group datatable-pagination");
    $('.dataTables_paginate > a').wrapInner('<span />');
});