var tenants = [];
$(document).ready(function () {
  let searchParams = new URLSearchParams(window.location.search)
  var TenantID = '';
  if (searchParams.has('Tenantfilter')) {
    TenantID = searchParams.get('Tenantfilter')
  }

  var todayDate = new Date().toISOString().slice(0, 10);
  if (TenantID !== '') {
    $(".datatable-1").dataTable({
      language: {
        paginate: {
          next: '<i class="fas fa-arrow-right"></i>',
          previous: '<i class="fas fa-arrow-left"></i>',
        },
      },
      columnDefs: [{ className: "dt-center", targets: [-1] }],
      deferRender: true,
      pageLength: 25,
      responsive: true,
      ajax: {
        url: "/api/ListBasicAuth?Tenantfilter=" + TenantID,
        dataSrc: "",
      },
      dom: "fBlrtip",
      buttons: [
        { extend: "copyHtml5", className: "btn btn-primary" },
        {
          extend: "excelHtml5",
          className: "btn btn-primary",
          title: "Basic Auth - " + TenantID + " - " + todayDate,
        },
        {
          extend: "csvHtml5",
          className: "btn btn-primary",
          title: "Basic Auth - " + TenantID + " - " + todayDate,
        },
        {
          extend: "pdfHtml5",
          className: "btn btn-primary",
          orientation: "landscape",
          title: "Basic Auth - " + TenantID + " - " + todayDate,
        },
      ],
      columns: [{ data: "UPN" }, { data: "BasicAuth" }],
      order: [[0, "asc"]],
    });
    $(".dataTables_paginate").addClass("btn-group datatable-pagination");
    $(".dataTables_paginate > a").wrapInner("<span />");
  }
});
