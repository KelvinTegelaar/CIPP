
$(document).ready(function () {

    var oTable = $('.datatable-1').dataTable(
        {
            language: {
                paginate: {
                    next: '<i class="fas fa-arrow-right"></i>',
                    previous: '<i class="fas fa-arrow-left"></i>'
                }
            },
            "deferRender": true,
            "pageLength": 10,
            "ajax": {

                "url": "/api/ListTenants",
                "dataSrc": "",
            },
            columnDefs: [{
                orderable: false,
                className: 'select-checkbox',
                targets: 0
            }],
            "columns": [
                {
                    "data": "defaultDomainName",
                    render: function (id, type, row) { return '<input class="form-check-input" id="Select_' + id + '" name="Select_' + id + '" value="' + id + '" type="checkbox" />'; }
                },
                { "data": "displayName" },
                { "data": "defaultDomainName" }

            ],
            "order": [[0, "asc"]],

        }).api();
    $('.dataTables_paginate').addClass("btn-group datatable-pagination");
    $('.dataTables_paginate > a').wrapInner('<span />');
    $("#selectAll").on("click", function (e) {
        if ($(this).is(":checked")) {
            $('input:checkbox').not(this).prop('checked', this.checked);
        } else {
            $('input:checkbox').not(this).prop('checked', false);
        }
      });
});
