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

                    "url": "/api/ListGroups?Tenantfilter=" + TenantID,
                    "dataSrc": "",
                },
                dom: 'fBlrtip',
                buttons: [
                    { extend: 'copyHtml5', className: 'btn btn-primary btn-sm', exportOptions: { orthogonal: "export"} },
                    { extend: 'excelHtml5', className: 'btn btn-primary btn-sm', title: 'Group List - ' + TenantID + " - " + todayDate, exportOptions: { columns: [0, 1, 2, 3, 4, 5], orthogonal: "export" } },
                    { extend: 'csvHtml5', className: 'btn btn-primary btn-sm', title: 'Group List - ' + TenantID + " - " + todayDate, exportOptions: { columns: [0, 1, 2, 3, 4, 5], orthogonal: "export" } },
                    { extend: 'pdfHtml5', className: 'btn btn-primary btn-sm', orientation: 'landscape', pageSize: 'A2', title: 'Group List - ' + TenantID + " - " + todayDate, exportOptions: { columns: [0, 1, 2, 3, 4, 5], orthogonal: "export" } },
                ],
                "columns": [
                    { "data": "displayName" },
                    { "data": "calculatedGroupType" },
                    {
                        "data": "dynamicGroupBool",
                        "render": function (data, type, row) {
                            if (type === "export" || type === "sort" || type === "filter") {
                                if (data === true) {
                                    return 'Dynamic Group'
                                } else if (data === false) {
                                    return 'Not a Dynamic Group'
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
                        "data": "teamsEnabled",
                        "render": function (data, type, row) {
                            if (type === "export" || type === "sort" || type === "filter") {
                                if (data === true) {
                                    return 'Teams Enabled'
                                } else if (data === false) {
                                    return 'Not Teams Enabled'
                                } else {
                                    return 'No Data'
                                }
                            }
                            if (data === true) {
                                return '<img src="assets/img/logos/ms_teams_logo.png" />';
                            }
                            if (data === false) {
                                return '<img src="assets/img/logos/ms_teams_logo_muted.png" />';
                            } else {
                                return '<i class="fas fa-times-circle text-danger fa-2x"></i></a>';
                            }
                        }
                    },
                    {
                        "data": "onPremisesSyncEnabled",
                        "render": function (data, type, row) {
                            if (type === "export" || type === "sort" || type === "filter") {
                                if (data === true) {
                                    return 'On-Premises Sync Enabled'
                                } else if (data === false) {
                                    return 'On-Premises Sync Disabled'
                                } else {
                                    return 'No Data'
                                }
                            }
                            if (data === true) {
                                return '<i class="fas fa-check-circle text-success" style="font-size:1.3rem;"></i>';
                            }
                            if (data === "") {
                                return '<i class="fas fa-times-circle text-muted" style="font-size:1.3rem;"></i>'
                            }
                            else {
                                return '<i class="fas fa-times-circle text-muted" style="font-size:1.3rem;"></i>';
                            }
                        }
                    },
                    { "data": "mail" },
                    {
                        "data": "id",
                        render: function (id, type, row) { return '<a href=index.html?page=EditGroup&GroupID=' + id + '&Tenantfilter=' + TenantID + '><i class="fas fa-cog fa-fw"></i></a>'; }
                    }
                ],
                'columnDefs': [
                    {
                        "targets": [1, 2, 3, 4, 6], // your case first column
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