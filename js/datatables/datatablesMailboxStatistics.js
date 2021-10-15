$(document).ready(function () {
    let searchParams = new URLSearchParams(window.location.search)
    if (searchParams.has('page')) {
        var TenantID = searchParams.get('Tenantfilter')
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
                { "className": "dt-center", "targets": [-1] },

            ],
            "deferRender": true,
            "pageLength": 25,
            responsive: true,
            "ajax": {

                "url": "/api/ListMailboxStatistics?Tenantfilter=" + TenantID,
                "dataSrc": "",
            },
            dom: 'fBlrtip',
            buttons: [
                { extend: 'copyHtml5', className: 'btn btn-primary' },
                { extend: 'excelHtml5', className: 'btn btn-primary' },
                { extend: 'csvHtml5', className: 'btn btn-primary' },
                { extend: 'pdfHtml5', className: 'btn btn-primary' },
            ],
            "columns": [
                { "data": "UPN" },
                { "data": "displayName" },
                { "data": "LastActive" },                
                { "data": "UsedGB" },
                { "data": "ItemCount" },
                { "data": "HasArchive" },
            ],
            "order": [[0, "asc"]],
        });
    $('.dataTables_paginate').addClass("btn-group datatable-pagination");
    $('.dataTables_paginate > a').wrapInner('<span />');
});
