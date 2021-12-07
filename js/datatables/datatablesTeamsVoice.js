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

                    "url": "/api/ListTeamsVoice?&Tenantfilter=" + TenantID,
                    "dataSrc": "",
                },
                dom: 'fBlrtip',
                buttons: [
                    { extend: 'copyHtml5', className: 'btn btn-primary btn-sm' },
                    { extend: 'excelHtml5', className: 'btn btn-primary btn-sm', title: 'Teams List - ' + TenantID + " - " + todayDate, exportOptions: { columns: [0, 1, 2, 3] } },
                    { extend: 'csvHtml5', className: 'btn btn-primary btn-sm', title: 'Teams List - ' + TenantID + " - " + todayDate, exportOptions: { columns: [0, 1, 2, 3] } },
                    { extend: 'pdfHtml5', className: 'btn btn-primary btn-sm', orientation: 'landscape', title: 'Teams List - ' + TenantID + " - " + todayDate, exportOptions: { columns: [0, 1, 2, 3] } },
                ],
                "columns": [
                    { "data": "AssignedTo" },
                    { "data": "TelephoneNumber" },
                    { "data": "NumberType" },
                    { "data": "IsoCountryCode" },
                    { "data": "PlaceName" },
                    { "data": "ActivationState" },
                    { "data": "IsOperatorConnect" },
                    { "data": "AcquisitionDate" },
                    {
                        "data": "id",
                        render: function (id, type, row) {
                            var tblmenu = `
                            <div class="dropdown">
                                <i class="fas fa-bars dropdown-toggle text-primary" data-bs-toggle="dropdown" style="cursor:hand;"></i>
                                <ul class="dropdown-menu" style="min-width:260px;">
                                    <li><a class="dropdown-item disabled"  href=index.html?page=ViewTeam&Tenantfilter=${TenantID}&GroupID=${id}><i data-bs-toggle="tooltip" data-bs-placement="top" title="View Team settings" class="fas fa-eye fa-fw"></i>No Actions Available</a></li>
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
