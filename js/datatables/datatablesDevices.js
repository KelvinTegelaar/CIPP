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

                    "url": "/api/ListDevices?Tenantfilter=" + TenantID,
                    "dataSrc": ""
                },
                dom: 'fBlrtip',
                "columns": [
                    { "data": "displayName" },
                    {
                        "data": "accountEnabled",
                        "render": function (data, type, row) {
                            if (type === "export" || type === "sort" || type === "filter") {
                                return data;
                            }
                            if (data === true) {
                                return '<i class="fas fa-check-circle text-success fa-2x"></i>';
                            } else {
                                return '<i class="fas fa-times-circle text-danger fa-2x"></i></a>';
                            }
                        }
                    },
                    {
                        "data": "isCompliant",
                        "render": function (data, type, row) {
                            if (type === "export" || type === "sort" || type === "filter") {
                                return data;
                            }
                            if (data === true) {
                                return '<i class="fas fa-check-circle text-success fa-2x"></i>';
                            } else {
                                return '<i class="fas fa-times-circle text-danger fa-2x"></i></a>';
                            }
                        }
                    },
                    { "data": "manufacturer" },
                    { "data": "model" },
                    { "data": "operatingSystem" },
                    { "data": "operatingSystemVersion" },
                    { "data": "createdDateTime" },
                    { "data": "approximateLastSignInDateTime" },
                    { "data": "deviceOwnership" },
                    { "data": "enrollmentType" },
                    { "data": "managementType" },
                    {
                        "data": "onPremisesSyncEnabled",
                        "render": function (data, type, row) {
                            if (type === "export" || type === "sort" || type === "filter") {
                                return data;
                            }
                            if (data === true) {
                                return '<i class="fas fa-check-circle text-success fa-2x"></i>';
                            } else {
                                return '<i class="fas fa-times-circle text-danger fa-2x"></i></a>';
                            }
                        }
                    },
                    { "data": "trustType" }
                ],
                'columnDefs': [
                    {
                        "targets": [1, 2, 3, 4, 5, 9, 11, 12, 13], // your case first column
                        "className": "text-center"
                    }
                ],
                buttons: [
                    { extend: 'copyHtml5', className: 'btn btn-primary btn-sm' },
                    { extend: 'excelHtml5', className: 'btn btn-primary btn-sm', title: 'Device List - ' + TenantID + " - " + todayDate, exportOptions: {orthogonal: "export"} },
                    { extend: 'csvHtml5', className: 'btn btn-primary btn-sm', title: 'Device List - ' + TenantID + " - " + todayDate, exportOptions: {orthogonal: "export"} },
                    { extend: 'pdfHtml5', className: 'btn btn-primary btn-sm', pageSize: 'A2', orientation: 'landscape', title: 'Device List - ' + TenantID + " - " + todayDate, exportOptions: { columns: [0, 1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], orthogonal: "export" } },
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
