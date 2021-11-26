$(document).ready(function () {
    let searchParams = new URLSearchParams(window.location.search)
    if (searchParams.has('page')) {
        var TenantID = escapeHTML(searchParams.get('Tenantfilter'))
        var Mailbox = escapeHTML(searchParams.get('Mailbox'))
    }
    
    document.getElementById('replaceTitle').innerHTML = 'Mobile Devices Report for ' + Mailbox;
    document.getElementById('breadcrumbReplace').innerHTML = '<a href=index.html?page=MailboxList&Tenantfilter=' + TenantID + '>Mailbox List</a> > Mobile Devices Report ';
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

                "url": "/api/ListMailboxMobileDevices?Tenantfilter=" + TenantID + "&Mailbox=" + Mailbox,
                "dataSrc": "",
            },
            dom: 'fBlrtip',
            buttons: [
                { extend: 'copyHtml5', className: 'btn btn-primary btn-sm' },
                { extend: 'excelHtml5', className: 'btn btn-primary btn-sm', title: 'Mobile Device Report - ' + TenantID + " - " + todayDate, exportOptions: {columns: [ 0,1,2,3,4,5,6,7,8,9,10 ]}   },
                { extend: 'csvHtml5', className: 'btn btn-primary btn-sm', title: 'Mobile Device Report - ' + TenantID + " - " + todayDate, exportOptions: {columns: [ 0,1,2,3,4,5,6,7,8,9,10 ]}  },
                { extend: 'pdfHtml5', className: 'btn btn-primary btn-sm', orientation: 'landscape', title: 'Mobile Device Report - ' + TenantID + " - " + todayDate, exportOptions: {columns: [ 0,1,2,3,4,5,6,7,8,9,10 ]} },
            ],
            "columns": [
                { "data": "clientType" },
                { "data": "clientVersion" },
                { "data": "deviceAccessState" },
                { "data": "deviceFriendlyName" },
                { "data": "deviceModel" },
                { "data": "deviceOS" },
                { "data": "deviceType" },
                { "data": "firstSync" },
                { "data": "lastSyncAttempt" },
                { "data": "lastSuccessSync" },
                { "data": "status" }
            ],
            "order": [[0, "asc"]],
        });
    $('.dataTables_paginate').addClass("btn-group datatable-pagination");
    $('.dataTables_paginate > a').wrapInner('<span />');
});
