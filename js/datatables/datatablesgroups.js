$(document).ready(function () {
    var todayDate = new Date().toISOString().slice(0, 10);
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

                "url": "/api/ListGroups?Tenantfilter=" + TenantID,
                "dataSrc": "",
            },
            dom: 'fBlrtip',
            buttons: [
                { extend: 'copyHtml5', className: 'btn btn-primary btn-sm' },
                { extend: 'excelHtml5', className: 'btn btn-primary btn-sm', title: 'Group List - ' + TenantID + " - " + todayDate, exportOptions: {columns: [ 0,1,2,3 ]}   },
                { extend: 'csvHtml5', className: 'btn btn-primary btn-sm', title: 'Group List - ' + TenantID + " - " + todayDate, exportOptions: {columns: [ 0,1,2,3 ]}  },
                { extend: 'pdfHtml5', className: 'btn btn-primary btn-sm', orientation: 'landscape', title: 'Group List - ' + TenantID + " - " + todayDate, exportOptions: {columns: [ 0,1,2,3 ]} },
            ],
            "columns": [
                { "data": "displayName" },
                { "data": "groupTypes" },
                { "data": "securityEnabled" },
                { "data": "mail" },
                {
                    "data": "id",
                    render: function (id, type, row) { return '<a href=index.html?page=EditGroup&GroupID=' + id + '&Tenantfilter=' + TenantID + '><i class="fas fa-cog fa-fw"></i></a>'; }
                }
            ],
            "order": [[0, "asc"]],
        });
    $('.dataTables_paginate').addClass("btn-group datatable-pagination");
    $('.dataTables_paginate > a').wrapInner('<span />');
});