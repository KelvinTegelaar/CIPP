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

                "url": "/api/DomainAnalyser_List",
                "dataSrc": ""
            },
            dom: 'fBlrtip',
            buttons: [
                { extend: 'copyHtml5', className: 'btn btn-primary btn-sm' },
                { extend: 'excelHtml5', className: 'btn btn-primary btn-sm', title: 'Domain Analyser - ' + todayDate, exportOptions: { orthogonal: "export" } },
                { extend: 'csvHtml5', className: 'btn btn-primary btn-sm', title: 'Domain Analyser - ' + todayDate, exportOptions: { orthogonal: "export" } },
                { extend: 'pdfHtml5', className: 'btn btn-primary btn-sm', pageSize: 'A2', orientation: 'landscape', title: 'Domain Analyser - ' + todayDate, exportOptions: { columns: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], orthogonal: "export" } },
                {
                    text: 'Force Refresh All Data',
                    className: 'btn btn-primary btn-sm',
                    action: function (e, dt, button, config) {
                        $('#APIContent').html('<center><label class="form-check-label" >Are you sure you want to force the Domain Analysis to run? This will slow down normal usage considerably. Please note: this runs at midnight automatically every day. <br /><br /></label><br><nothing class="APIConfirmed"><a href="/api/DomainAnalyser_OrchestrationStarter"><button id="Confirmed" class="btn btn-primary APIConfirmed">Yes</button></a></nothing><nothing class="APIDenied">  <button data-bs-dismiss="modal" class="btn btn-primary APIDenied">No</button></center>');

                        document.getElementById("PopModal").click();
                    }
                }
            ],
            "columns": [
                { "data": "Domain" },
                { "data": "Tenant" },
                {
                    "data": "Score",
                    "render": function (data, type, row) {
                        if (type === "export") {
                            return data + ' / ' + row.MaximumScore;
                        }
                        if (type === "sort" || type === "filter") {
                            return row.ScorePercentage;
                        }
                        if (data === "") { return '<h5><span class="badge bg-secondary">No Data</span></h5>' }
                        if (row.ScorePercentage <= 40) { var colourCalculation = "bg-danger" }
                        if (row.ScorePercentage > 40 && row.ScorePercentage <= 75) { var colourCalculation = "bg-warning" }
                        if (row.ScorePercentage > 75) { var colourCalculation = "bg-success" }
                        return '<div class="progress"><div class="progress-bar ' + colourCalculation + '" role="progressbar" style="width: ' + row.ScorePercentage + '%" aria-valuenow="' + data + '" aria-valuemin="0" aria-valuemax="' + row.MaximumScore + '">' + row.ScorePercentage + '%</div></div>'
                    }
                },
                { "data": "MailProvider" },
                {
                    "data": "SPFPassTest",
                    "render": function (data, type, row) {
                        if (type === "export" || type === "sort" || type === "filter") {
                            if (data === true) {
                                return 'PASS: SPF Present'
                            } else if (data === false) {
                                return 'FAIL: SPF Missing or Misconfigured'
                            } else {
                                return 'No Data'
                            }
                        }
                        if (data === true) {
                            if (row.SPFPassAll === true) {
                                return '<h5><span class="badge bg-success">SPF Pass</span></h5>';
                            }
                            else {
                                return '<h5><span class="badge bg-danger">SPF Soft Fail</span></h5>';
                            }
                        }
                        if (data === false) {
                            return '<h5><span class="badge bg-danger">SPF Fail</span></h5>';
                        } else {
                            return '<h5><span class="badge bg-secondary">No Data</span></h5>'
                        }
                    }
                },
                {
                    "data": "MXPassTest",
                    "render": function (data, type, row) {
                        if (type === "export" || type === "sort" || type === "filter") {
                            if (data === true) {
                                return 'PASS: MX Match Present'
                            } else if (data === false) {
                                return 'FAIL: MX Not Matching MS Recommendations'
                            } else {
                                return 'No Data'
                            }
                        }
                        if (data === true) {
                            return '<h5><span class="badge bg-success">MX Pass</span></h5>';
                        }
                        if (data === false) {
                            return '<h5><span class="badge bg-danger">MX Fail</span></h5>';
                        } else {
                            return '<h5><span class="badge bg-secondary">No Data</span></h5>'
                        }
                    }
                },
                {
                    "data": "DMARCPresent",
                    "render": function (data, type, row) {
                        if (type === "export" || type === "sort" || type === "filter") {
                            if (data === true) {
                                if (row.DMARCReportingActive === true) {
                                    return 'PASS: DMARC Record Present'
                                }
                                if (row.DMARCReportingActive === false) {
                                    return 'WARN: DMARC Present Reporting Not Configured'
                                }

                            } else if (data === false) {
                                return 'FAIL: DMARC Not Present'
                            } else {
                                return 'No Data'
                            }
                        }
                        if (data === true) {
                            if (row.DMARCReportingActive === true) {
                                return '<h5><span class="badge bg-success">DMARC Present</span></h5>';
                            }
                            if (row.DMARCReportingActive === false) {
                                return '<h5><span class="badge bg-warning">DMARC Present No Reporting</span></h5>';
                            }
                            if (!row.DMARCReportingActive) {
                                return '<h5><span class="badge bg-danger">DMARC Present No Reporting Data</span></h5>';
                            }
                        }
                        if (data === false) {
                            return '<h5><span class="badge bg-danger">DMARC Missing</span></h5>';
                        } else {
                            return '<h5><span class="badge bg-secondary">No Data</span></h5>'
                        }
                    }
                },
                {
                    "data": "DMARCActionPolicy",
                    "render": function (data, type, row) {
                        if (type === "export" || type === "sort" || type === "filter") {
                            if (data === "Reject") {
                                return 'PASS: DMARC Set to Reject'
                            } else if (data === "Quarantine") {
                                return 'WARN: DMARC Quarantining Only'
                            } else if (data === "None") {
                                return 'FAIL: DMARC Reporting Only'
                            } else {
                                return 'No DMARC'
                            }
                        }
                        if (data === "Reject") {
                            return '<h5><span class="badge bg-success">Reject</span></h5>'
                        } else if (data === "Quarantine") {
                            return '<h5><span class="badge bg-warning">Quarantine Only</span></h5>'
                        } else if (data === "None") {
                            return '<h5><span class="badge bg-danger">Report Only</span></h5>'
                        } else {
                            return '<h5><span class="badge bg-danger">No DMARC</span></h5>'
                        }
                    }
                },
                {
                    "data": "DMARCPercentagePass",
                    "render": function (data, type, row) {
                        if (type === "export" || type === "sort" || type === "filter") {
                            if (data === true) {
                                return 'PASS: DMARC All Mail Fully Reported'
                            } else if (data === false) {
                                return 'FAIL: DMARC All Mail Not Considered'
                            } else {
                                return 'No DMARC'
                            }
                        }
                        if (data === true) {
                            return '<h5><span class="badge bg-success">All Mail Analysed</span></h5>';
                        }
                        if (data === false) {
                            return '<h5><span class="badge bg-danger">Partial or None Analysed</span></h5>';
                        } else {
                            return '<h5><span class="badge bg-danger">No DMARC</span></h5>'
                        }
                    }
                },
                {
                    "data": "DNSSECPresent",
                    "render": function (data, type, row) {
                        if (type === "export" || type === "sort" || type === "filter") {
                            if (data === true) {
                                return 'PASS: DNSSEC Present'
                            } else if (data === false) {
                                return 'FAIL: DNSSEC Not Enabled or Configured'
                            } else {
                                return 'No Data'
                            }
                        }
                        if (data === true) {
                            return '<h5><span class="badge bg-success">DNSSEC Enabled</span></h5>';
                        }
                        if (data === false) {
                            return '<h5><span class="badge bg-danger">DNSSEC Disabled</span></h5>';
                        } else {
                            return '<h5><span class="badge bg-secondary">No Data</span></h5>'
                        }
                    }
                },
                {
                    "data": "DKIMEnabled",
                    "render": function (data, type, row) {
                        if (type === "export" || type === "sort" || type === "filter") {
                            if (data === true) {
                                return 'PASS: DKIM Enabled'
                            } else if (data === false) {
                                return 'FAIL: DKIM not Present'
                            } else {
                                return 'No Data'
                            }
                        }
                        if (data === true) {
                            return '<h5><span class="badge bg-success">DKIM Enabled</span></h5>';
                        }
                        if (data === false) {
                            return '<h5><span class="badge bg-danger">DKIM Disabled</span></h5>';
                        } else {
                            return '<h5><span class="badge bg-warning">No Data</span></h5>'
                        }
                    }
                },
                {
                    "data": "ActualMXRecord",
                    "render": function (data, type, row) {
                        if (type === "export" || type === "sort" || type === "filter") {
                            return 'No Data'
                        }
                        return '<button type="button" class="btn btn-secondary btn-sm" data-bs-toggle="modal" data-bs-target="#' + row.GUID + 'MoreInfo">More</button><!-- Modal --><div class="modal fade" id="' + row.GUID + 'MoreInfo" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true"><div class="modal-dialog modal-lg"><div class="modal-content"><div class="modal-header"><h5 class="modal-title" id="exampleModalLabel">More Information</h5><button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button></div><div class="modal-body"><h3>Tenant: ' + row.Tenant + '</h3><br /><br /><strong>Score Explanation: </strong>' + row.ScoreExplanation + '<br /><br /><strong>Expected SPF Record: </strong> ' + row.ExpectedSPFRecord + '<br /><strong>Actual SPF Record: </strong>' + row.ActualSPFRecord + '<br /><br /><strong>DMARC Full Policy: </strong>' + row.DMARCFullPolicy + '<br /><br /><strong>Expected MX Record: </strong>' + row.ExpectedMXRecord + '<br /><strong>Actual MX Record: </strong>' + row.ActualMXRecord + '<br /><br /><strong>Supported Services: </strong>' + row.SupportedServices + '<br /><strong>Is Default Domain: </strong>' + row.IsDefault + '<br /><strong>Data Last Refreshed:</strong>' + row.LastRefresh + '</div><div class="modal-footer"><button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button></div></div></div></div>'
                    }
                }
            ],
            'columnDefs': [
                {
                    "targets": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], // your case first column
                    "className": "text-center align-middle"
                },
                {
                  "targets": [ 1 ],
                  "visible": false
                }
            ],
            "order": [[0, "asc"]],
        }
    );


    $('.dataTables_paginate').addClass("btn-group datatable-pagination");
    $('.dataTables_paginate > a').wrapInner('<span />');
});
