$(document).ready(function () {
    let searchParams = new URLSearchParams(window.location.search)
    var TenantID = '';
    if (searchParams.has('Tenantfilter')) {
        TenantID = searchParams.get('Tenantfilter')
    }

    var todayDate = new Date().toISOString().slice(0, 10);
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

                ],
                "deferRender": true,
                "pageLength": 25,
                responsive: true,
                "ajax": {

                    "url": "/api/ListMailboxes?Tenantfilter=" + TenantID,
                    "dataSrc": ""
                },
                dom: 'fBlrtip',
                buttons: [
                    { extend: 'copyHtml5', className: 'btn btn-primary btn-sm' },
                    { extend: 'excelHtml5', className: 'btn btn-primary btn-sm', title: 'Mailbox List - ' + TenantID + " - " + todayDate },
                    { extend: 'csvHtml5', className: 'btn btn-primary btn-sm', title: 'Mailbox List - ' + TenantID + " - " + todayDate },
                    { extend: 'pdfHtml5', className: 'btn btn-primary btn-sm', pageSize: 'A2', orientation: 'landscape', title: 'Mailbox List - ' + TenantID + " - " + todayDate, exportOptions: { columns: [0, 1, 2, 4, 5] } },
                ],
                "columns": [
                    { "data": "UPN" },
                    { "data": "displayName" },
                    { "data": "primarySmtpAddress" },
                    { "data": "recipientType" },
                    { "data": "recipientTypeDetails" },
                    { "data": "AdditionalEmailAddresses" },
                    {
                        "data": "UPN",
                        render: function (id, type, row) {
                            if (row.recipientTypeDetails === 'SharedMailbox') { SharedMailbox = ' disabled' } else { SharedMailbox = '' };
                            if (row.recipientTypeDetails === 'UserMailbox') { Usermailbox = ' disabled' } else { Usermailbox = '' };
                            var tblmenu = `
                            <div class="dropdown">
                           
                                <i class="fas fa-bars dropdown-toggle text-primary" data-bs-toggle="dropdown" style="cursor:hand;"></i>
                                <ul class="dropdown-menu" style="min-width:260px;">
                                    <li><a class="dropdown-item" href=index.html?page=ViewUser&Tenantfilter=${TenantID}&UserID=${id}><i data-bs-toggle="tooltip" data-bs-placement="top" title="View User" class="fas fa-eye fa-fw"></i>View User</a></li>
                                    <li><a class="dropdown-item" href=index.html?page=EditMailboxPermissions&Tenantfilter=${TenantID}&UserID=${id}><i data-bs-toggle="tooltip" data-bs-placement="top" title="Edit User" class="fas fa-cog fa-fw"></i>Edit mailbox permissions</a></li>
                                    <li><a class="dropdown-item" href=index.html?page=MailboxMobileDevices&Tenantfilter=${TenantID}&UserID=${id}><i data-bs-toggle="tooltip" data-bs-placement="top" title="View Mobile Devices" class="fas fa-mobile-alt fa-fw"></i>View Mobile Devices</a></li>
                                    <nothing class="APILink">
                                    <li><a class="dropdown-item${SharedMailbox}" actionname="convert ${row.displayName} to a shared mailbox" href=api/ExecConvertToSharedMailbox?TenantFilter=${TenantID}&ID=${id}><i data-bs-toggle="tooltip" data-bs-placement="top" title="Convert to Shared" class="fas fa-share-alt fa-fw"></i>Convert to Shared Mailbox</a></li>
                                    <li><a class="dropdown-item${Usermailbox}" actionname="convert ${row.displayName} to a user mailbox" href=api/ExecConvertToSharedMailbox?TenantFilter=${TenantID}&ID=${id}&ConvertToUser=true><i data-bs-toggle="tooltip" data-bs-placement="top" title="Convert to user mailbox" class="fas fa-share-alt fa-fw"></i>Convert to User mailbox</a></li>
                                   </nothing>
                                    </ul>
                                    
                            </div>`

                            return tblmenu
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
