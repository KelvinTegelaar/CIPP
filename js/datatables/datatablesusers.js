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
                { "className": "dt-center", "targets": [-1] },
                { "width": "10%", "targets": -1 }

            ],
            "deferRender": true,
            "pageLength": 25,
            responsive: true,
            "ajax": {

                "url": "/api/ListUsers?TenantFilter=" + TenantID,
                "dataSrc": "",
            },
            dom: 'fBlrtip',
            buttons: [
                { extend: 'copyHtml5', className: 'btn btn-primary' },
                { extend: 'excelHtml5', className: 'btn btn-primary', title: 'User List - ' + TenantID + " - " + todayDate, exportOptions: {columns: [ 0,1,2,3,4 ]}   },
                { extend: 'csvHtml5', className: 'btn btn-primary', title: 'User List - ' + TenantID + " - " + todayDate, exportOptions: {columns: [ 0,1,2,3,4 ]}  },
                { extend: 'pdfHtml5', className: 'btn btn-primary', orientation: 'landscape', title: 'User List - ' + TenantID + " - " + todayDate, exportOptions: {columns: [ 0,1,2,3,4 ]} },
            ],
            "columns": [
                { "data": "displayName" },
                { "data": "mail" },
                { "data": "userType" },
                { "data": "accountEnabled" },
                { "data": "LicJoined" },
                {
                    "data": "id",
                    render: function (id, type, row) { return '<a href=index?page=EditUser&Tenantfilter=' + TenantID + '&UserID=' + id + '><i data-bs-toggle="tooltip" data-bs-placement="top" title="Edit User" class="fas fa-cog fa-fw"></i></a><nothing class="APILink">' + '<a href=api/ConvertToSharedMailbox?TenantFilter=' + TenantID + '&ID=' + id + '><i data-bs-toggle="tooltip" data-bs-placement="top" title="Convert to Shared" class="fas fa-share-alt fa-fw"></i></a>' + '<a href=api/DisableUser?TenantFilter=' + TenantID + '&ID=' + id + '><i data-bs-toggle="tooltip" data-bs-placement="top" title="Disable User" class="fas fa-ban fa-fw"></i></a>' + '<a href=api/ResetPass?TenantFilter=' + TenantID + '&ID=' + id + '><i data-bs-toggle="tooltip" data-bs-placement="top" title="Reset password" class="fas fa-key fa-fw"></i></i></a></nothing>'; }
                }
            ],
            "order": [[0, "asc"]],
        });
    $('.dataTables_paginate').addClass("btn-group datatable-pagination");
    $('.dataTables_paginate > a').wrapInner('<span />');


});