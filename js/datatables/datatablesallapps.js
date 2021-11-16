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
                "deferRender": true,
                "pageLength": 25,
                responsive: true,
                "ajax": {

                    "url": "/api/Listapps?TenantFilter=" + TenantID,
                    "dataSrc": "",
                },
                dom: 'fBlrtip',
                buttons: [
                    { extend: 'copyHtml5', className: 'btn btn-primary btn-sm' },
                    { extend: 'excelHtml5', className: 'btn btn-primary btn-sm', title: 'Application List - ' + TenantID + " - " + todayDate, exportOptions: { columns: [0, 1, 2, 3] } },
                    { extend: 'csvHtml5', className: 'btn btn-primary btn-sm', title: 'Application List - ' + TenantID + " - " + todayDate, exportOptions: { columns: [0, 1, 2, 3] } },
                    { extend: 'pdfHtml5', className: 'btn btn-primary btn-sm', orientation: 'landscape', title: 'Application List - ' + TenantID + " - " + todayDate, exportOptions: { columns: [0, 1, 2, 3] } },
                ],
                "columns": [
                    { "data": "displayName" },
                    { "data": "publishingState" },
                    { "data": "installCommandLine" },
                    { "data": "uninstallCommandLine" },
                    {
                        "data": "id",
                        render: function (id, type, row) {
                            var tblmenu = `
                            <div class="dropdown">
                            
                                <i class="fas fa-bars dropdown-toggle text-primary" data-bs-toggle="dropdown" style="cursor:hand;"></i>
                                <ul class="dropdown-menu" style="min-width:260px;">
                                    <li><a class="dropdown-item" href=index.html?page=EditApp&TenantFilter=${TenantID}&ID=${id}><i data-bs-toggle="tooltip" data-bs-placement="top" title="Edit App" class="fas fa-cog fa-fw"></i>Edit Application</a></li>
                                    <nothing class="APILink">
                                    <li><a class="dropdown-item" actionname="assign ${row.displayName} to all users" href=api/ExecAssignApp?AssignTo=AllUsers&TenantFilter=${TenantID}&ID=${id}><i data-bs-toggle="tooltip" data-bs-placement="top" title="Assign to all users" class="fas fa-user-friends fa-fw"></i>Assign to all Users</a></li>
                                    <li><a class="dropdown-item"actionname="assign ${row.displayName} to all devices" href=api/ExecAssignApp?AssignTo=AllDevices&TenantFilter=${TenantID}&ID=${id}><i data-bs-toggle="tooltip" data-bs-placement="top" title="Assign to all devices" class="fas fa-laptop fa-fw"></i>Assign to all Devices</a></li>
                                    <li><a class="dropdown-item" actionname="assign ${row.displayName} to all users and devices" href=api/ExecAssignApp?AssignTo=Both&TenantFilter=${TenantID}&ID=${id}><i data-bs-toggle="tooltip" data-bs-placement="top" title="Assign globally(All devices, all Users)" class="fas fa-globe fa-fw"></i></i>Assign Globally(All devices, All users)</a></li>
                                    </nothing>
                                    </ul>
                                    
                            </div>`
                            return tblmenu;
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