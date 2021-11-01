$(document).ready(function () {
    let searchParams = new URLSearchParams(window.location.search)
    var TenantID = '';
    if (searchParams.has('Tenantfilter')) {
        TenantID = searchParams.get('Tenantfilter')
    }

    var todayDate = new Date().toISOString().slice(0, 10);
    $('.datatable-1').dataTable(
        {
            "scrollX": true,
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
            "pageLength": 50,
            responsive: true,
            "ajax": {

                "url": "/api/BestPracticeAnalyser_List",
                "dataSrc": ""
            },
            dom: 'fBlrtip',
            buttons: [
                { extend: 'copyHtml5', className: 'btn btn-primary btn-sm' },
                { extend: 'excelHtml5', className: 'btn btn-primary btn-sm', title: 'Best Practice Analyser - ' + todayDate, exportOptions: { orthogonal: "export" } },
                { extend: 'csvHtml5', className: 'btn btn-primary btn-sm', title: 'Best Practice Analyser - ' + todayDate, exportOptions: { orthogonal: "export" } },
                { extend: 'pdfHtml5', className: 'btn btn-primary btn-sm', pageSize: 'A2', orientation: 'landscape', title: 'Best Practice Analyser - ' + todayDate, exportOptions: { columns: [0, 1, 2, 4, 5, 6, 7, 8, 9, 10, 11], orthogonal: "export" } },
                {
                    text: 'Force Refresh All Data',
                    className: 'btn btn-primary btn-sm',
                    action: function (e, dt, button, config) {
                        $('#APIContent').html('<center><label class="form-check-label" >Are you sure you want to force the Best Practice Analysis to run? This will slow down normal usage considerably. Please note: this runs at midnight automatically every day. <br /><br /></label><br><nothing class="APIConfirmed"><a href="/api/BestPracticeAnalyser_OrchestrationStarter"><button id="Confirmed" class="btn btn-primary APIConfirmed">Yes</button></a></nothing><nothing class="APIDenied">  <button data-bs-dismiss="modal" class="btn btn-primary APIDenied">No</button></center>');

                        document.getElementById("PopModal").click();
                    }
                }
            ],
            "columns": [
                { "data": "Tenant" },
                { "data": "LastRefresh" },
                {
                    "data": "UnifiedAuditLog",
                    "render": function (data, type, row) {
                        if (type === "export" || type === "sort" || type === "filter") {
                            return data;
                        }
                        if (data === true) {
                            return '<i class="fas fa-check-circle text-success fa-2x"></i>';
                        }
                        if (data === "") {
                            return '<h5><span class="badge bg-secondary">No Data</span></h5>'
                        }
                        else {
                            return '<i class="fas fa-times-circle text-danger fa-2x"></i></a>';
                        }
                    }
                },
                {
                    "data": "SecureDefaultState",
                    "render": function (data, type, row) {
                        if (type === "export" || type === "sort" || type === "filter") {
                            return data;
                        }
                        if (data === true) {
                            return '<i class="fas fa-check-circle text-success fa-2x"></i>';
                        }
                        if (data === "") {
                            return '<h5><span class="badge bg-secondary">No Data</span></h5>'
                        } else {
                            return '<i class="fas fa-exclamation-triangle text-warning fa-2x"></i></a>';
                        }
                    }
                },
                {
                    "data": "MessageCopyForSend",
                    "render": function (data, type, row) {
                        if (type === "export" || type === "sort" || type === "filter") {
                            return data;
                        }
                        if (data === "PASS") {
                            return '<h5><span class="badge bg-success">On All Users</span></h5>';
                        }
                        if (data === "FAIL") {
                            return '<button type="button" class="btn btn-warning btn-sm" data-bs-toggle="modal" data-bs-target="#' + row.GUID + 'SendAs">' + row.MessageCopyForSendAsCount + ' Users Off</button><!-- Modal --><div class="modal fade" id="' + row.GUID + 'SendAs" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><h5 class="modal-title" id="exampleModalLabel">Mailboxes where Message Copy to Send As Not On</h5><button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button></div><div class="modal-body"> ' + row.MessageCopyForSendList + '</div><div class="modal-footer"><button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button></div></div></div></div>'
                        }
                        else {
                            return '<h5><span class="badge bg-secondary">No Data</span></h5>'
                        }
                    }
                },
                {
                    "data": "AdminConsentForApplications",
                    "render": function (data, type, row) {
                        if (type === "export" || type === "sort" || type === "filter") {
                            return data;
                        }
                        if (data === true) {
                            return '<i class="fas fa-times-circle text-danger fa-2x"></i>';
                        }
                        if (data === "") {
                            return '<h5><span class="badge bg-secondary">No Data</span></h5>'
                        } else {
                            return '<i class="fas fa-check-circle text-success fa-2x"></i></a>';
                        }
                    }
                },
                {
                    "data": "DoNotExpirePasswords",
                    "render": function (data, type, row) {
                        if (type === "export" || type === "sort" || type === "filter") {
                            return data;
                        }
                        if (data === true) {
                            return '<i class="fas fa-check-circle text-success fa-2x"></i>';
                        }
                        if (data === "") {
                            return '<h5><span class="badge bg-secondary">No Data</span></h5>'
                        } else {
                            return '<i class="fas fa-times-circle text-danger fa-2x"></i></a>';
                        }
                    }
                },
                {
                    "data": "PrivacyEnabled",
                    "render": function (data, type, row) {
                        if (type === "export" || type === "sort" || type === "filter") {
                            return data;
                        }
                        if (data === true) {
                            return '<i class="fas fa-exclamation-triangle text-warning fa-2x"></i>';
                        }
                        if (data === "") {
                            return '<h5><span class="badge bg-secondary">No Data</span></h5>'
                        } else {
                            return '<i class="fas fa-check-circle text-success fa-2x"></i></a>';
                        }
                    }
                },
                {
                    "data": "SelfServicePasswordReset",
                    "render": function (data, type, row) {
                        if (type === "export" || type === "sort" || type === "filter") {
                            return data;
                        }
                        if (data === "Off") {
                            return '<h5><span class="badge bg-warning text-dark">Off All Users</span><h5>';
                        }
                        if (data === "On") {
                            return '<h5><span class="badge bg-success">On All Users</span></h5>';
                        }
                        if (data === "Specific Users") {
                            return '<h5><span class="badge bg-secondary">On Specific Users</span></h5>';
                        }
                        else {
                            return '<h5><span class="badge bg-secondary">No Data</span></h5>'
                        }
                    }
                },
                {
                    "data": "EnableModernAuth",
                    "render": function (data, type, row) {
                        if (type === "export" || type === "sort" || type === "filter") {
                            return data;
                        }
                        if (data === true) {
                            return '<i class="fas fa-check-circle text-success fa-2x"></i>';
                        }
                        if (data === "") {
                            return '<h5><span class="badge bg-secondary">No Data</span></h5>'
                        } else {
                            return '<i class="fas fa-times-circle text-danger fa-2x"></i></a>';
                        }
                    }
                },
                {
                    "data": "DisabledSharedMailboxLoginsCount",
                    "render": function (data, type, row) {
                        if (type === "export" || type === "sort" || type === "filter") {
                            return data;
                        }
                        if (data > 0) {
                            //return '<h5><span class="badge bg-danger">' + data + ' Users Enabled</span></h5>'
                            return '<button type="button" class="btn btn-danger btn-sm" data-bs-toggle="modal" data-bs-target="#' + row.GUID + 'SharedMailbox">' + row.DisabledSharedMailboxLoginsCount + ' Users Enabled</button><!-- Modal --><div class="modal fade" id="' + row.GUID + 'SharedMailbox" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><h5 class="modal-title" id="exampleModalLabel">Shared Mailboxes with Enabled User Accounts</h5><button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button></div><div class="modal-body"> ' + row.DisabledSharedMailboxLogins + '</div><div class="modal-footer"><button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button></div></div></div></div>'
                        }
                        if (data === 0) {
                            return '<h5><span class="badge bg-success">None Enabled</span></h5>';
                        }
                        else {
                            return '<h5><span class="badge bg-secondary">No Data</span></h5>'
                        }
                    }
                },
                {
                    "data": "UnusedLicensesResult",
                    "render": function (data, type, row) {
                        if (type === "export" || type === "sort" || type === "filter") {
                            return data;
                        }
                        if (data === "FAIL") {
                            return '<button type="button" class="btn btn-danger btn-sm" data-bs-toggle="modal" data-bs-target="#' + row.GUID + 'UnusedLicenses">' + row.UnusedLicensesCount + ' SKUs Unassigned Licenses</button><!-- Modal --><div class="modal fade" id="' + row.GUID + 'UnusedLicenses" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><h5 class="modal-title" id="exampleModalLabel">SKUs with Unassigned Licenses</h5><button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button></div><div class="modal-body"> ' + row.UnusedLicenseList + '</div><div class="modal-footer"><button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button></div></div></div></div>'
                        }
                        if (data === "PASS") {
                            return '<h5><span class="badge bg-success">No Unused Licenses</span></h5>';
                        }
                        else {
                            return '<h5><span class="badge bg-secondary">No Data</span></h5>'
                        }
                    }
                }
            ],
            'columnDefs': [
                {
                    "targets": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], // your case first column
                    "className": "text-center align-middle"
                }
            ],
            "order": [[0, "asc"]],
        }
    );


    $('.dataTables_paginate').addClass("btn-group datatable-pagination");
    $('.dataTables_paginate > a').wrapInner('<span />');
});
