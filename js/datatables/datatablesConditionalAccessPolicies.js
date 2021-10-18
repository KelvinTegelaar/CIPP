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
                    { "className": "dt-center", "targets": [3,4,5,6,7,8,9,10,11,12,13,14,15] },
    
                ],
                "deferRender": true,
                "pageLength": 25,
                responsive: true,
                "ajax": {
    
                    "url": "/api/ListConditionalAccessPolicies?Tenantfilter=" + TenantID,
                    "dataSrc": ""
                },
                dom: 'fBlrtip',
                buttons: [
                    { extend: 'copyHtml5', className: 'btn btn-primary btn-sm' },
                    { extend: 'excelHtml5', className: 'btn btn-primary btn-sm', title: 'Conditional Access Report - ' + TenantID + " - " + todayDate },
                    { extend: 'csvHtml5', className: 'btn btn-primary btn-sm', title: 'Conditional Access Report - ' + TenantID + " - " + todayDate },                    
                    { extend: 'pdfHtml5', className: 'btn btn-primary btn-sm', orientation: 'landscape', pageSize: 'A2', title: 'Conditional Access Report - ' + TenantID + " - " + todayDate },
                ],
                "scrollX": true,
                "columns": [
                    { "data": "displayName" },
                    { "data": "state" },
                    { "data": "modifiedDateTime" },                
                    { "data": "clientAppTypes" },
                    { "data": "includePlatforms" },
                    { "data": "excludePlatforms" },
                    { "data": "includeLocations" },
                    { "data": "excludeLocations" },
                    { "data": "includeUsers" },
                    { "data": "excludeUsers" },
                    { "data": "includeGroups" },
                    { "data": "excludeGroups" },
                    { "data": "includeApplications" },
                    { "data": "excludeApplications" },
                    { "data": "grantControlsOperator" },
                    { "data": "builtInControls" }
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
