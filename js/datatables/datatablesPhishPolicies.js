$(document).ready(function () {
    let searchParams = new URLSearchParams(window.location.search)
    var TenantID = '';
    if (searchParams.has('Tenantfilter')) {
        TenantID = searchParams.get('Tenantfilter')
    }

    var todayDate = new Date().toISOString().slice(0, 10);
    if(TenantID !== '') {
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
    
                    "url": "/api/ListPhishPolicies?Tenantfilter=" + TenantID,
                    "dataSrc": ""
                },
                dom: 'fBlrtip',
                buttons: [
                    { extend: 'copyHtml5', className: 'btn btn-primary btn-sm' },
                    { extend: 'excelHtml5', className: 'btn btn-primary btn-sm', title: 'Phishing Policies - ' + TenantID + " - " + todayDate },
                    { extend: 'csvHtml5', className: 'btn btn-primary btn-sm', title: 'Phishing Policies - ' + TenantID + " - " + todayDate },
                    { extend: 'pdfHtml5', className: 'btn btn-primary btn-sm', pageSize: 'A2', orientation: 'landscape', title: 'Phishing Policies - ' + TenantID + " - " + todayDate, exportOptions: {columns: [ 0,1,2,4,5 ]} },
                ],
                "columns": [
                    { "data": "Name" },
                    { "data": "PhishThresholdLevel" },
                    {
                        "data": "Enabled",
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
                            if (data === false) {                                
                                return '<i class="fas fa-times-circle text-danger" style="font-size:1.3rem;"></i></a>';
                            }
                            else {
                                return '<h5><span class="badge bg-secondary" style="font-size:1.3rem;">No Data</span></h5>';
                            }
                        }
                    },
                    {
                        "data": "Priority",
                        "render": function (data, type, row) {
                            if (data === null) {
                                return 'Default (Lowest)';
                            }
                            else
                            {
                                return data;
                            }
                        }
                    },
                    {
                        "data": "ExcludedDomainCount",
                        "render": function (data, type, row) {
                            if (type === "export" || type === "sort" || type === "filter") {
                                if (data > 0) {
                                    return data + ' Excluded Domains - ' + row.ExcludedDomains
                                } else if (data === 0) {
                                    return 'No Excluded Domains'
                                } else {
                                    return 'No Data'
                                }
                            }
                            if (data > 0) {
                                //return '<h5><span class="badge bg-danger">' + data + ' Users Enabled</span></h5>'
                                return '<button type="button" class="btn btn-warning btn-sm" data-bs-toggle="modal" data-bs-target="#' + row.GUID + 'PhishPolicy">' + row.ExcludedDomainCount + ' Users</button><!-- Modal --><div class="modal fade" id="' + row.GUID + 'PhishPolicy" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><h5 class="modal-title" id="exampleModalLabel">Excluded Domains in Policy</h5><button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button></div><div class="modal-body"> ' + row.ExcludedDomains + '</div><div class="modal-footer"><button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button></div></div></div></div>'
                            }
                            if (data === 0) {
                                return '<h5><span class="badge bg-success">None</span></h5>';
                            }
                            else {
                                return '<h5><span class="badge bg-secondary">No Data</span></h5>'
                            }
                        }
                    },
                    {
                        "data": "ExcludedSenderCount",
                        "render": function (data, type, row) {
                            if (type === "export" || type === "sort" || type === "filter") {
                                if (data > 0) {
                                    return data + ' Excluded Senders - ' + row.ExcludedSenders
                                } else if (data === 0) {
                                    return 'No Excluded Senders'
                                } else {
                                    return 'No Data'
                                }
                            }
                            if (data > 0) {
                                //return '<h5><span class="badge bg-danger">' + data + ' Users Enabled</span></h5>'
                                return '<button type="button" class="btn btn-warning btn-sm" data-bs-toggle="modal" data-bs-target="#' + row.GUID + 'PhishPolicy2">' + row.ExcludedSenderCount + ' Users</button><!-- Modal --><div class="modal fade" id="' + row.GUID + 'PhishPolicy2" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><h5 class="modal-title" id="exampleModalLabel">Excluded Senders in Policy</h5><button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button></div><div class="modal-body"> ' + row.ExcludedSenders + '</div><div class="modal-footer"><button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button></div></div></div></div>'
                            }
                            if (data === 0) {
                                return '<h5><span class="badge bg-success">None</span></h5>';
                            }
                            else {
                                return '<h5><span class="badge bg-secondary">No Data</span></h5>'
                            }
                        }
                    },
                    { "data": "WhenChangedUTC" },
                ],
                "order": [[0, "asc"]],
                'columnDefs': [
                    {
                        "targets": [1, 2, 3, 4, 5], // your case first column
                        "className": "text-center align-middle"
                    }
                ],
            }
        );
    }
    else {
        $("#AccountTable").append("<tr><td colspan='8'>Select a Tenant to get started.</td></tr>")
    }
    
    $('.dataTables_paginate').addClass("btn-group datatable-pagination");
    $('.dataTables_paginate > a').wrapInner('<span />');
});
