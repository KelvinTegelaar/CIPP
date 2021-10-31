$(document).ready(function () {
    var todayDate = new Date().toISOString().slice(0, 10);
    let searchParams = new URLSearchParams(window.location.search)
    var TenantID = '';
    if (searchParams.has('Tenantfilter')) {
        TenantID = searchParams.get('Tenantfilter');
    }

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
                    { "width": "10%", "targets": -1 }

                ],
                "deferRender": true,
                "pageLength": 25,
                responsive: true,
                "ajax": {

                    "url": "/api/ListContacts?TenantFilter=" + TenantID,
                    "dataSrc": "",
                },
                dom: 'fBlrtip',
                buttons: [
                    { extend: 'copyHtml5', className: 'btn btn-primary btn-sm' },
                    { extend: 'excelHtml5', className: 'btn btn-primary btn-sm', title: 'Contact List - ' + TenantID + " - " + todayDate, exportOptions: { columns: [0, 1, 2, 3] } },
                    { extend: 'csvHtml5', className: 'btn btn-primary btn-sm', title: 'Contact List - ' + TenantID + " - " + todayDate, exportOptions: { columns: [0, 1, 2, 3] } },
                    { extend: 'pdfHtml5', className: 'btn btn-primary btn-sm', orientation: 'landscape', title: 'Contact List - ' + TenantID + " - " + todayDate, exportOptions: { columns: [0, 1, 2, 3] } },
                ],
                "columns": [
                    { "data": "displayName" },
                    { "data": "mail" },
                    { "data": "companyName" },
                    { "data": "onPremisesSyncEnabled" },
                    {
                        "data": "id",
                        render: function (id, type, row) {
                            return '<a target="_blank" href=' + row.editURL + '><i data-bs-toggle="tooltip" data-bs-placement="top" title="Edit Contact" class="fas fa-cog fa-fw"></i></a><nothing class="APILink">';
                            ;
                        }
                    }
                ],
                "order": [[0, "asc"]],
            }
        );
    }
    else {
        $("#AccountTable").append("<tr><td colspan='8'>Select a Tenant to get started.</td></tr>")
    }

    $('.dataTables_paginate').addClass("btn-group datatable-pagination");
    $('.dataTables_paginate > a').wrapInner('<span />');
});