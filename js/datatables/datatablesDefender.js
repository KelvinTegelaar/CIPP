$(document).ready(function () {
    var todayDate = new Date().toISOString().slice(0, 10);
    let searchParams = new URLSearchParams(window.location.search)
    var TenantID = '';
    if (searchParams.has('Tenantfilter')) {
        TenantID = searchParams.get('Tenantfilter')
    }

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

                    "url": "/api/ListDefenderState?Tenantfilter=" + TenantID,
                    "dataSrc": "",
                },
                dom: 'fBlrtip',
                buttons: [
                    { extend: 'copyHtml5', className: 'btn btn-primary btn-sm', exportOptions: { orthogonal: "export" } },
                    { extend: 'excelHtml5', className: 'btn btn-primary btn-sm', title: 'Group List - ' + TenantID + " - " + todayDate, exportOptions: { columns: [0, 1, 2, 3, 4, 5], orthogonal: "export" } },
                    { extend: 'csvHtml5', className: 'btn btn-primary btn-sm', title: 'Group List - ' + TenantID + " - " + todayDate, exportOptions: { columns: [0, 1, 2, 3, 4, 5], orthogonal: "export" } },
                    { extend: 'pdfHtml5', className: 'btn btn-primary btn-sm', orientation: 'landscape', pageSize: 'A2', title: 'Group List - ' + TenantID + " - " + todayDate, exportOptions: { columns: [0, 1, 2, 3, 4, 5], orthogonal: "export" } },
                ],
                "columns": [
                    { "data": "managedDeviceName" },
                    {
                        "data": "malwareProtectionEnabled",
                        "render": function (data, type, row) {
                            if (type === "export" || type === "sort" || type === "filter") {
                                if (data === true) {
                                    return 'Enabled'
                                } else if (data === false) {
                                    return 'Disabled'
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
                    {
                        "data": "realTimeProtectionEnabled",
                        "render": function (data, type, row) {
                            if (type === "export" || type === "sort" || type === "filter") {
                                if (data === true) {
                                    return 'Enabled'
                                } else if (data === false) {
                                    return 'Disabled'
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
                    {
                        "data": "networkInspectionSystemEnabled",
                        "render": function (data, type, row) {
                            if (type === "export" || type === "sort" || type === "filter") {
                                if (data === true) {
                                    return 'Enabled'
                                } else if (data === false) {
                                    return 'Disabled'
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
                    {
                        "data": "managedDeviceHealthState",
                        "render": function (data, type, row) {
                            if (type === "export" || type === "sort" || type === "filter") {
                                if (data === true) {
                                    return 'Enabled'
                                } else if (data === false) {
                                    return 'Disabled'
                                } else {
                                    return 'No Data'
                                }
                            }
                            if (data === 'Clean') {
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
                    {
                        "data": "quickScanOverdue",
                        "render": function (data, type, row) {
                            if (type === "export" || type === "sort" || type === "filter") {
                                if (data === true) {
                                    return 'Enabled'
                                } else if (data === false) {
                                    return 'Disabled'
                                } else {
                                    return 'No Data'
                                }
                            }
                            if (data === 'false') {
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
                    {
                        "data": "fullScanOverdue",
                        "render": function (data, type, row) {
                            if (type === "export" || type === "sort" || type === "filter") {
                                if (data === true) {
                                    return 'Enabled'
                                } else if (data === false) {
                                    return 'Disabled'
                                } else {
                                    return 'No Data'
                                }
                            }
                            if (data === 'false') {
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
                    {
                        "data": "signatureUpdateOverdue",
                        "render": function (data, type, row) {
                            if (type === "export" || type === "sort" || type === "filter") {
                                if (data === true) {
                                    return 'Enabled'
                                } else if (data === false) {
                                    return 'Disabled'
                                } else {
                                    return 'No Data'
                                }
                            }
                            if (data === 'false') {
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
                    {
                        "data": "rebootRequired",
                        "render": function (data, type, row) {
                            if (type === "export" || type === "sort" || type === "filter") {
                                if (data === true) {
                                    return 'Enabled'
                                } else if (data === false) {
                                    return 'Disabled'
                                } else {
                                    return 'No Data'
                                }
                            }
                            if (data === 'false') {
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
                    {
                        "data": "attentionRequired",
                        "render": function (data, type, row) {
                            if (type === "export" || type === "sort" || type === "filter") {
                                if (data === true) {
                                    return 'Enabled'
                                } else if (data === false) {
                                    return 'Disabled'
                                } else {
                                    return 'No Data'
                                }
                            }
                            if (data === 'false') {
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
                    {
                        "data": "managedDeviceId",
                        render: function (id, type, row) {
                            var tblmenu = `
                            <div class="dropdown">
                                <i class="fas fa-bars dropdown-toggle text-primary" data-bs-toggle="dropdown" style="cursor:hand;"></i>
                                <ul class="dropdown-menu" style="min-width:260px;">
                                    <li><a class="dropdown-item" href=index.html?page=ViewUser&Tenantfilter=${TenantID}&UserID=${id}><i data-bs-toggle="tooltip" data-bs-placement="top" title="View Device" class="fas fa-eye fa-fw"></i>View Device</a></li>
                                    <nothing class="APILink">
                                    <li><a class="dropdown-item" actionname="send push for ${row.displayName}" href=api/ExecSendPush?TenantFilter=${TenantID}&UserEmail=${row.mail}><i data-bs-toggle="tooltip" data-bs-placement="top" title="Execute Quick Scan" class="fas fa-viruses fa-fw"></i></i>Execute Quick Scan</a></li>
                                    <li><a class="dropdown-item" actionname="convert ${row.displayName} to a shared mailbox" href=api/ExecConvertToSharedMailbox?TenantFilter=${TenantID}&ID=${id}><i data-bs-toggle="tooltip" data-bs-placement="top" title="Execute full scan" class="fas fa-virus-slash fa-fw"></i>Execute Full Scan</a></li>
                                    <li><a class="dropdown-item" actionname="disable ${row.displayName}" href=api/ExecDisableUser?TenantFilter=${TenantID}&ID=${id}><i data-bs-toggle="tooltip" data-bs-placement="top" title="Remote Wipe" class="fas fa-eraser fa-fw"></i>Remote wipe</a></li>
                                   </nothing>
                                    </ul>

                            </div>`
                            return tblmenu;
                        }
                    }

                ],
                'columnDefs': [
                    { "width": "15%", "targets": 0 },
                    {
                        "targets": '_all', // your case first column
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
