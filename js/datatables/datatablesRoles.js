$(document).ready(function () {
    let searchParams = new URLSearchParams(window.location.search)
    var TenantID = '';
    if (searchParams.has('Tenantfilter')) {
        TenantID = searchParams.get('Tenantfilter')
    }

    var todayDate = new Date().toISOString().slice(0, 10);
    if (TenantID !== '') {
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

                    "url": "/api/ListRoles?Tenantfilter=" + TenantID,
                    "dataSrc": "",
                },
                dom: 'fBlrtip',
                buttons: [
                    { extend: 'copyHtml5', className: 'btn btn-primary btn-sm' },
                    { extend: 'excelHtml5', className: 'btn btn-primary btn-sm', title: 'Roles List - ' + TenantID + " - " + todayDate, exportOptions: { columns: [0, 1, 2] } },
                    { extend: 'csvHtml5', className: 'btn btn-primary btn-sm', title: 'Roles List - ' + TenantID + " - " + todayDate, exportOptions: { columns: [0, 1, 2] } },
                    { extend: 'pdfHtml5', className: 'btn btn-primary btn-sm', orientation: 'landscape', title: 'Roles List - ' + TenantID + " - " + todayDate, exportOptions: { columns: [0, 1, 2] } },
                ],
                "columns": [
                    { "data": "DisplayName" },
                    { "data": "Description" },
                    { "data": "Members" }
                ],
                "order": [[0, "asc"]],
            }
        );
    }
    else {
        $("#RolesTable").append("<tr><td colspan='8'>Select a Tenant to get started.</td></tr>")
    }

    $('.dataTables_paginate').addClass("btn-group datatable-pagination");
    $('.dataTables_paginate > a').wrapInner('<span />');
});
