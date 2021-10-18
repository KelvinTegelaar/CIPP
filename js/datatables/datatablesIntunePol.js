$(document).ready(function () {
    let searchParams = new URLSearchParams(window.location.search)
    var TenantID = '';
    if (searchParams.has('Tenantfilter')) {
        TenantID = searchParams.get('Tenantfilter')
    }

    var todayDate = new Date().toISOString().slice(0, 10);
    if(TenantID !== '') {
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
    
                    "url": "/api/ListIntunePolicy?type=ESP&Tenantfilter=" + TenantID,
                    "dataSrc": "",
                },
                dom: 'fBlrtip',
                buttons: [
                    { extend: 'copyHtml5', className: 'btn btn-primary btn-sm' },
                    { extend: 'excelHtml5', className: 'btn btn-primary btn-sm', title: 'Intune Policy List - ' + TenantID + " - " + todayDate, exportOptions: {columns: [ 0,1 ]}   },
                    { extend: 'csvHtml5', className: 'btn btn-primary btn-sm', title: 'Intune Policy List - ' + TenantID + " - " + todayDate, exportOptions: {columns: [ 0,1 ]}  },
                    { extend: 'pdfHtml5', className: 'btn btn-primary btn-sm', orientation: 'landscape', title: 'Intune Policy List - ' + TenantID + " - " + todayDate, exportOptions: {columns: [ 0,1 ]} },
                ],
                "columns": [
                    { "data": "displayName" },
                    { "data": "PolicyTypeName" },
                    {
                        "data": "id",
                        render: function (id, type, row) { return '<a href=index.html?page=EditPolicy&Config&ID=' + id + '&Tenantfilter=' + TenantID + '><i class="fas fa-cog fa-fw"></i></a>'; }
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
