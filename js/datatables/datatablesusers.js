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
                        if ([2, 3, 4, 5].includes(column.index())) {

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
                            if (column.index() === 5) {
                                column.data().unique().sort().each(function (d, j) {
                                    select.append('<option value="' + d + '">' + d + '</option>')
                                });
                            } else if (column.index() === 2) {
                                select.append('<option value="guest">Guest</option><option value="member">Member</option>')
                            } else {
                                select.append('<option value="true">Enabled</option><option value="false">Disabled</option>')

                            }
                        }
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
                    { extend: 'copyHtml5', className: 'btn btn-primary btn-sm', exportOptions: { orthogonal: "export" } },
                    { extend: 'excelHtml5', className: 'btn btn-primary btn-sm', title: 'User List - ' + TenantID + " - " + todayDate, exportOptions: { columns: [0, 1, 2, 3, 4], orthogonal: "export" } },
                    { extend: 'csvHtml5', className: 'btn btn-primary btn-sm', title: 'User List - ' + TenantID + " - " + todayDate, exportOptions: { columns: [0, 1, 2, 3, 4], orthogonal: "export" } },
                    { extend: 'pdfHtml5', className: 'btn btn-primary btn-sm', orientation: 'landscape', title: 'User List - ' + TenantID + " - " + todayDate, exportOptions: { columns: [0, 1, 2, 3, 4], orthogonal: "export" } },
                ],
                "columns": [
                    { "data": "displayName" },
                    { "data": "mail" },
                    { "data": "userType" },
                    {
                        "data": "accountEnabled",
                        "render": function (data, type, row) {
                            if (type === "export" || type === "sort" || type === "filter") {
                                if (data === true) {
                                    return 'Account Enabled'
                                } else if (data === false) {
                                    return 'Account Disabled'
                                } else {
                                    return 'No Data'
                                }
                            }
                            if (data === true) {
                                return '<i class="fas fa-check-circle text-success" style="font-size:1.3rem;"></i>';
                            }
                            if (data === "") {
                                return '<h5><span class="badge bg-secondary" style="font-size:1.3rem;">No Data</span></h5>'
                            }
                            else {
                                return '<i class="fas fa-times-circle text-danger" style="font-size:1.3rem;"></i></a>';
                            }
                        }
                    },
                    {
                        "data": "onPremisesSyncEnabled",
                        "render": function (data, type, row) {
                            if (type === "export" || type === "sort" || type === "filter") {
                                if (data === true) {
                                    return 'On Premises Sync Enabled'
                                } else if (data === false) {
                                    return 'On Premises Sync Disabled'
                                } else {
                                    return 'No Data'
                                }
                            }
                            if (data === true) {
                                return '<i class="fas fa-check-circle text-success" style="font-size:1.3rem;"></i>';
                            }
                            if (data === "") {
                                return '<h5><span class="badge bg-secondary" style="font-size:1.3rem;">No Data</span></h5>'
                            }
                            else {
                                return '<i class="fas fa-times-circle text-muted" style="font-size:1.3rem;"></i></a>';
                            }
                        }
                    },
                    { "data": "LicJoined" },
                    {
                        "data": "id",
                        render: function (id, type, row) {
                            if (row.accountEnabled === false) { accountDisabledDD = ' disabled' } else { accountDisabledDD = '' };
                            if (row.mail === null) { mailDisabledDD = ' disabled' } else { mailDisabledDD = '' };
                            var tblmenu = `
                            <div class="dropdown">
                           
                                <i class="fas fa-bars dropdown-toggle text-primary" data-bs-toggle="dropdown" style="cursor:hand;"></i>
                                <ul class="dropdown-menu" style="min-width:260px;">
                                    <li><a class="dropdown-item" href=index.html?page=ViewUser&Tenantfilter=${TenantID}&UserID=${id}><i data-bs-toggle="tooltip" data-bs-placement="top" title="View User" class="fas fa-eye fa-fw"></i>View User</a></li>
                                    <li><a class="dropdown-item" href=index.html?page=EditUser&Tenantfilter=${TenantID}&UserID=${id}><i data-bs-toggle="tooltip" data-bs-placement="top" title="Edit User" class="fas fa-cog fa-fw"></i>Edit User</a></li>
                                    <li><a class="dropdown-item" href=index.html?page=BECview&Tenantfilter=${TenantID}&UserID=${id}><i data-bs-toggle="tooltip" data-bs-placement="top" title="Research Compromised Account" class="fas fa-search-location fa-fw"></i>Research Compromised Account</a></li>
                                    <nothing class="APILink">
                                    <li><a class="dropdown-item${accountDisabledDD}" actionname="send push for ${row.displayName}" href=api/ExecSendPush?TenantFilter=${TenantID}&UserEmail=${row.mail}><i data-bs-toggle="tooltip" data-bs-placement="top" title="Send MFA Push to User" class="fas fa-exchange-alt fa-fw"></i></i>Send MFA Push</a></li>
                                    <li><a class="dropdown-item${mailDisabledDD}" actionname="convert ${row.displayName} to a shared mailbox" href=api/ExecConvertToSharedMailbox?TenantFilter=${TenantID}&ID=${id}><i data-bs-toggle="tooltip" data-bs-placement="top" title="Convert to Shared" class="fas fa-share-alt fa-fw"></i>Convert to Shared Mailbox</a></li>
                                    <li><a class="dropdown-item${accountDisabledDD}" actionname="disable ${row.displayName}" href=api/ExecDisableUser?TenantFilter=${TenantID}&ID=${id}><i data-bs-toggle="tooltip" data-bs-placement="top" title="Block Sign in" class="fas fa-ban fa-fw"></i>Block Sign-In</a></li>
                                    <li><a class="dropdown-item" actionname="reset the password for ${row.displayName}" href=api/ExecResetPass?MustChange=true&TenantFilter=${TenantID}&ID=${id}><i data-bs-toggle="tooltip" data-bs-placement="top" title="Reset password" class="fas fa-key fa-fw"></i></i>Reset Password (Must change)</a></li>
                                    <li><a class="dropdown-item" actionname="reset the password for ${row.displayName}" href=api/ExecResetPass?MustChange=false&TenantFilter=${TenantID}&ID=${id}><i data-bs-toggle="tooltip" data-bs-placement="top" title="Reset password" class="fas fa-key fa-fw"></i></i>Reset Password</a></li>
                                    <li><a class="dropdown-item" actionname="Delete ${row.displayName}" href=api/RemoveUser?TenantFilter=${TenantID}&ID=${id}><i data-bs-toggle="tooltip" data-bs-placement="top" title="Delete user" class="fas fa-user-times fa-fw"></i></i>Delete User</a></nothing></li>
                                   </nothing>
                                    </ul>
                                    
                            </div>`
                            return tblmenu;
                        }
                    }
                ],
                'columnDefs': [
                    {
                        "targets": [2, 3, 4, 5, 6], // your case first column
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