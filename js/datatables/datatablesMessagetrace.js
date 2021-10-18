$(document).ready(function () {
    let searchParams = new URLSearchParams(window.location.search)
    if (searchParams.has('confirmation')) {
        var TenantID = searchParams.get('Tenantfilter')
        var days = searchParams.get('Days')
        var recipient = searchParams.get('Recipient')
        var sender = searchParams.get('Sender')
        $('#days').val(days)
        $('#Recipient').val(recipient)
        $('#Sender').val(sender)


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
                    { "width": "10%", "targets": 0 }

                ],
                "deferRender": true,
                "pageLength": 25,
                responsive: true,
                "ajax": {

                    "url": "/api/ListMessagetrace?Tenantfilter=" + TenantID + '&days=' + days + '&recipient=' + recipient + '&sender=' + sender,
                    "dataSrc": "",
                },
                dom: 'fBlrtip',
                buttons: [
                    { extend: 'copyHtml5', className: 'btn btn-primary btn-sm' },
                    { extend: 'excelHtml5', className: 'btn btn-primary btn-sm', title: 'Mailbox Statistics - ' + TenantID + " - " + todayDate },
                    { extend: 'csvHtml5', className: 'btn btn-primary btn-sm', title: 'Mailbox Statistics - ' + TenantID + " - " + todayDate },
                    { extend: 'pdfHtml5', className: 'btn btn-primary btn-sm', orientation: 'landscape', title: 'Mailbox Statistics - ' + TenantID + " - " + todayDate },
                ],
                "columns": [
                    { "data": "Date" },
                    { "data": "RecipientAddress" },
                    { "data": "SenderAddress" },
                    { "data": "Subject" },
                    { "data": "Status" }
                ],
                "order": [[0, "desc"]],
            });
        $('.dataTables_paginate').addClass("btn-group datatable-pagination");
        $('.dataTables_paginate > a').wrapInner('<span />');
    }
});



