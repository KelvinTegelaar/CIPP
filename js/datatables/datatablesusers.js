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
                initComplete: function () {
                    this.api().columns().every(function () {
                        var column = this;
                        var select = $('<select class="form-in-datatable"><option value=""></option></select>')
                            .appendTo($(column.footer()).empty())
                            .on('change', function () {
                                var val = $.fn.dataTable.util.escapeRegex(
                                    $(this).val()
                                );

                                column
                                    .search(val ? '^' + val + '$' : '', true, false)
                                    .draw();
                            });

                        column.data().unique().sort().each(function (d, j) {
                            select.append('<option value="' + d + '">' + d + '</option>')
                        });
                    });
                },
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
                    { extend: 'copyHtml5', className: 'btn btn-primary btn-sm' },
                    { extend: 'excelHtml5', className: 'btn btn-primary btn-sm', title: 'User List - ' + TenantID + " - " + todayDate, exportOptions: { columns: [0, 1, 2, 3, 4] } },
                    { extend: 'csvHtml5', className: 'btn btn-primary btn-sm', title: 'User List - ' + TenantID + " - " + todayDate, exportOptions: { columns: [0, 1, 2, 3, 4] } },
                    { extend: 'pdfHtml5', className: 'btn btn-primary btn-sm', orientation: 'landscape', title: 'User List - ' + TenantID + " - " + todayDate, exportOptions: { columns: [0, 1, 2, 3, 4] } },
                ],
                "columns": [
                    { "data": "displayName" },
                    { "data": "mail" },
                    { "data": "userType" },
                    { "data": "accountEnabled" },
                    { "data": "onPremisesSyncEnabled" },
                    { "data": "LicJoined" },
                    {
                        "data": "id",
                        render: function (id, type, row) {
                            return '<a href=index.html?page=EditUser&Tenantfilter=' + TenantID + '&UserID=' + id + '><i data-bs-toggle="tooltip" data-bs-placement="top" title="Edit User" class="fas fa-cog fa-fw"></i></a><nothing class="APILink">' +
                                '<a actionname="send push for ' + row.displayName + '" href=api/ExecSendPush?TenantFilter=' + TenantID + '&UserEmail=' + row.mail + '><i data-bs-toggle="tooltip" data-bs-placement="top" title="Send MFA Push to User" class="fas fa-exchange-alt fa-fw"></i></i></a>' +
                                '<a actionname="convert ' + row.displayName + ' to a shared mailbox" href=api/ExecConvertToSharedMailbox?TenantFilter=' + TenantID + '&ID=' + id + '><i data-bs-toggle="tooltip" data-bs-placement="top" title="Convert to Shared" class="fas fa-share-alt fa-fw"></i></a>' +
                                '<a actionname="disable ' + row.displayName + '" href=api/ExecDisableUser?TenantFilter=' + TenantID + '&ID=' + id + '><i data-bs-toggle="tooltip" data-bs-placement="top" title="Block Sign in" class="fas fa-ban fa-fw"></i></a>' +
                                '<a actionname="reset the password for ' + row.displayName + '" href=api/ExecResetPass?TenantFilter=' + TenantID + '&ID=' + id + '><i data-bs-toggle="tooltip" data-bs-placement="top" title="Reset password" class="fas fa-key fa-fw"></i></i></a>' +
                                '<a actionname="Delete ' + row.displayName + '" href=api/RemoveUser?TenantFilter=' + TenantID + '&ID=' + id + '><i data-bs-toggle="tooltip" data-bs-placement="top" title="Delete user" class="fas fa-user-times fa-fw"></i></i></a></nothing>';
                            ;
                        }
                    }
                ],
                'columnDefs': [
                    {
                        "targets": [2, 3, 4, 5], // your case first column
                        "className": "text-center align-middle"
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