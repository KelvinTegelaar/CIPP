$(document).ready(function () {
    let searchParams = new URLSearchParams(window.location.search)
    if (searchParams.has('page')) {
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

                "url": "/api/ListAutopilotConfig?type=ESP&Tenantfilter=" + TenantID,
                "dataSrc": "",
            },
            dom: 'fBlrtip',
            buttons: [
                { extend: 'copyHtml5', className: 'btn btn-primary btn-sm' },
                { extend: 'excelHtml5', className: 'btn btn-primary btn-sm', title: 'Enrollment Status Page - ' + TenantID + " - " + todayDate, exportOptions: {columns: [ 0,1,2,3,4,5,6 ]}   },
                { extend: 'csvHtml5', className: 'btn btn-primary btn-sm', title: 'Enrollment Status Page - ' + TenantID + " - " + todayDate, exportOptions: {columns: [ 0,1,2,3,4,5,6 ]}  },
                { extend: 'pdfHtml5', className: 'btn btn-primary btn-sm', orientation: 'landscape', title: 'Enrollment Status Page - ' + TenantID + " - " + todayDate, exportOptions: {columns: [ 0,1,2,3,4,5,6 ]} },
            ],
            "columns": [
                { "data": "displayName" },
                { "data": "description" },
                { "data": "installProgressTimeoutInMinutes" },
                { "data": "showInstallationProgress" },
                { "data": "blockDeviceSetupRetryByUser" },
                { "data": "allowDeviceResetOnInstallFailure" },
                { "data": "allowDeviceUseOnInstallFailure" },
                {
                    "data": "id",
                    render: function (id, type, row) { return '<a href=index.html?page=EditESP&Config&ID=' + id + '&Tenantfilter=' + TenantID + '><i class="fas fa-cog fa-fw"></i></a>'; }
                }
            ],
            "order": [[0, "asc"]],
        });
    $('.dataTables_paginate').addClass("btn-group datatable-pagination");
    $('.dataTables_paginate > a').wrapInner('<span />');
});
