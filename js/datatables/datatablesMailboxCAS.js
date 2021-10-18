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

                "url": "/api/ListMailboxCAS?Tenantfilter=" + TenantID,
                "dataSrc": "",
            },
            dom: 'fBlrtip',
            buttons: [
                { extend: 'copyHtml5', className: 'btn btn-primary btn-sm' },
                { extend: 'excelHtml5', className: 'btn btn-primary btn-sm', title: 'Mailbox CAS Settings - ' + TenantID + " - " + todayDate },
                { extend: 'csvHtml5', className: 'btn btn-primary btn-sm', title: 'Mailbox CAS Settings - ' + TenantID + " - " + todayDate },
                { extend: 'pdfHtml5', className: 'btn btn-primary btn-sm', orientation: 'landscape', title: 'Mailbox CAS Settings - ' + TenantID + " - " + todayDate},
            ],
            "columns": [
                { "data": "displayName" },
                { "data": "primarySmtpAddress" },                
                { "data": "ecpenabled" },
                { "data": "owaenabled" },
                { "data": "imapenabled" },
                { "data": "popenabled" },
                { "data": "mapienabled" },
                { "data": "ewsenabled" },
                { "data": "activesyncenabled" },
            ],
            'columnDefs': [
                {
                    "targets": [2,3,4,5,6,7,8], // your case first column
                    "className": "text-center"
               }
             ],
            "order": [[0, "asc"]],
        });
    $('.dataTables_paginate').addClass("btn-group datatable-pagination");
    $('.dataTables_paginate > a').wrapInner('<span />');
});
