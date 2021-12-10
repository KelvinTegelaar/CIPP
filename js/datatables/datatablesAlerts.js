$(document).ready(function () {
  var todayDate = new Date().toISOString().slice(0, 10);

  dataFin = $.ajax({
    'async': true,
    'global': false,
    'url': 'api/ExecAlertsList',
    'dataType': "json",
    'contentType': "application/json",
    'success': function (GUID) {
      //when succesfull, we get a GUID as a return. We use the GUID to get the actual data instead.
      GetAPIData("api/ExecAlertsList", GUID.GUID).then((data) => {
        // Hide the spinners
        $("#newalertsloadingspinner").hide();
        $("#inprogressalertsloadingspinner").hide();
        $("#highseverityalertsloadingspinner").hide();
        $("#mediumseverityalertsloadingspinner").hide();
        $("#lowseverityalertsloadingspinner").hide();
        $("#informationalalertsloadingspinner").hide();
        $("#pageloadwarning").remove();

        $("#NewAlerts").html(data.NewAlertsCount);
        $("#InProgressAlerts").html(data.InProgressAlertsCount);
        $("#HighSeverityAlerts").html(data.SeverityHighAlertsCount);
        $("#MediumSeverityAlerts").html(data.SeverityMediumAlertsCount);
        $("#LowSeverityAlerts").html(data.SeverityLowAlertsCount);
        $("#InformationalSeverityAlerts").html(data.SeverityInformationalCount);
        var table = $('.datatable-1').dataTable(
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
            data: data.MSResults,
            dom: 'flrtip',
            "columns": [
              { "data": "Tenant" },
              { "data": "Id" },
              { "data": "Title" },
              { "data": "Category" },
              { "data": "EventDateTime" },
              { "data": "Severity" },
              { "data": "Status" },
              {
                "data": "RawResult",
                "render": function (data, type, row) {
                  if (type === "export" || type === "sort" || type === "filter") {
                    return 'No Data'
                  }
                  var prettyResult = JSON.stringify(row.RawResult, null,2)
                  var modalStuff = `
                    <button type="button" class="btn btn-secondary btn-sm" data-bs-toggle="modal" data-bs-target="#${row.GUID}MoreInfo">More</button>
                    <!-- Modal -->
                    <div class="modal fade" id="${row.GUID}MoreInfo" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                        <div class="modal-dialog modal-lg">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h5 class="modal-title" id="exampleModalLabel">More Information</h5>
                                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                </div>
                                <div class="modal-body">
                                <div class="card">
                                  <div class="card-body">
                                  <pre id="rawJSON">
                                    ${prettyResult}
                                  </pre>
                                  </div>
                                </div>
                                </div>
                                <div class="modal-footer"><button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button></div>
                            </div>
                        </div>
                    </div>
                    `
                  return modalStuff;
                }
              }
            ],
            "order": [[4, "desc"]],
          }
        );


      })
    },
    'error': function (xhr, ajaxOptions, thrownError) {
      $("#loader").html('<i class="fas fa-times-circle text-danger fa-2x"></i>Error - could not retrieve information from API.')
    }
  });


  $('.dataTables_paginate').addClass("btn-group datatable-pagination");
  $('.dataTables_paginate > a').wrapInner('<span />');
});
