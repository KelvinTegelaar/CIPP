// block default form and execute API call instead
$(document).ready(function () {
  $('#DomainForm').submit(function (e) {
    e.preventDefault();
    ExecuteDomainAPICall();
  });
});

function ExecuteDomainAPICall() {
  var form = $('#DomainForm');
  var postdata = getFormData(form); //ThisCreatesANiceSpinnerWhileWeWait
  var loaderspinelement = document.getElementById("loaderspin");
  loaderspinelement.classList.remove("invisible");
  $.ajax({
    'async': true,
    'global': false,
    'url': "api/ListDomainTests",
    'type': "post",
    'data': JSON.stringify(postdata),
    'contentType': "application/json",
    'success': function (data) {

      var loaderspinelement = document.getElementById("loaderspin");
      loaderspinelement.classList.add("invisible");

      // Clear existing data
      ClearExistingClasses();

      // Get the Background Colour for SPF
      GenerateHTMLColour('spfCard', data[0].SPFFinalState)

      // Get the Background Colour for SPF Indicator
      GenerateHTMLColour('spfindicator', data[0].SPFFinalState)

      // Get the Background Font Colour for SPF
      GenerateHTMLHeaderColour('spfHeader', data[0].SPFFinalState)

      // Link the arrays with a break
      var arrSPFFails = data[0].SPFResults.ValidationFails.join("<br />");
      var arrSPFWarns = data[0].SPFResults.ValidationWarns.join("<br />");
      var arrSPFPasses = data[0].SPFResults.ValidationPasses.join("<br />");

      // Set the HTML for the SPF Records
      $('#domainResultsSPFRecord').html(data[0].SPFResults.Record);
      $('#domainResultsSPFPasses').html(GenerateHTMLResult(arrSPFPasses));
      $('#domainResultsSPFWarns').html(GenerateHTMLResult(arrSPFWarns));
      $('#domainResultsSPFFails').html(GenerateHTMLResult(arrSPFFails));

      // Get the Background Colour for DMARC
      GenerateHTMLColour('dmarcCard', data[0].DMARCFinalState)

      // Get the Background Colour for DMARC Indicator
      GenerateHTMLColour('dmarcindicator', data[0].DMARCFinalState)

      // Get the Background Font Colour for DMARC
      console.log(data[0].DMARCFinalState)
      GenerateHTMLHeaderColour('dmarcHeader', data[0].DMARCFinalState)

      var arrDMARCFails = data[0].DMARCResults.ValidationFails.join("<br />");
      var arrDMARCWarns = data[0].DMARCResults.ValidationWarns.join("<br />");
      var arrDMARCPasses = data[0].DMARCResults.ValidationPasses.join("<br />");

      $('#domainResultsDMARCRecord').html(data[0].DMARCResults.Record);
      $('#domainResultsDMARCPasses').html(GenerateHTMLResult(arrDMARCPasses));
      $('#domainResultsDMARCWarns').html(GenerateHTMLResult(arrDMARCWarns));
      $('#domainResultsDMARCFails').html(GenerateHTMLResult(arrDMARCFails));

      // Get the Background Colour for MX
      GenerateHTMLColour('mxCard', data[0].MXFinalState)

      // Get the Background Colour for MX Indicator
      GenerateHTMLColour('mxindicator', data[0].MXFinalState)

      // Get the Background Font Colour for MX
      console.log(data[0].MXFinalState)
      GenerateHTMLHeaderColour('mxHeader', data[0].MXFinalState)

      var arrMXFails = data[0].MXResults.ValidationFails.join("<br />");
      var arrMXWarns = data[0].MXResults.ValidationWarns.join("<br />");
      var arrMXPasses = data[0].MXResults.ValidationPasses.join("<br />");

      console.log(data[0]);
      $('#domainResultsMXRecord').html(data[0].MXResults.Records.Hostname);
      $('#domainResultsMXRecordPasses').html(GenerateHTMLResult(arrMXPasses));
      $('#domainResultsMXRecordFails').html(GenerateHTMLResult(arrMXFails));
      $('#domainResultsMXRecordWarns').html(GenerateHTMLResult(arrMXWarns));
      $('#domainResultsMXMailProvider').html('<h4><span class="badge bg-primary">Mail Provider: ' + data[0].MXResults.MailProvider.Name + '</span></h4>');



      // Get the Background Colour for DNSSEC
      GenerateHTMLColour('dnssecCard', data[0].DNSSECFinalState)

      // Get the Background Colour for DNSSEC Indicator
      GenerateHTMLColour('dnssecindicator', data[0].DNSSECFinalState)

      // Get the Background Font Colour for DNSSEC
      console.log(data[0].DNSSECFinalState)
      GenerateHTMLHeaderColour('dnssecHeader', data[0].DNSSECFinalState)

      var arrDNSSECFails = data[0].DNSSECResults.ValidationFails.join("<br />");
      var arrDNSSECWarns = data[0].DNSSECResults.ValidationWarns.join("<br />");
      var arrDNSSECPasses = data[0].DNSSECResults.ValidationPasses.join("<br />");
      var arrDNSSECKeys = data[0].DNSSECResults.Keys.join("<br />");

      console.log(data[0]);
      $('#domainResultsDNSSECRecord').html(arrDNSSECKeys);
      $('#domainResultsDNSSECRecordPasses').html(GenerateHTMLResult(arrDNSSECPasses));
      $('#domainResultsDNSSECRecordFails').html(GenerateHTMLResult(arrDNSSECFails));
      $('#domainResultsDNSSECRecordWarns').html(GenerateHTMLResult(arrDNSSECWarns));



      // Get the Background Colour for DKIM
      GenerateHTMLColour('dkimCard', data[0].DKIMFinalState)

      // Get the Background Colour for DKIM Indicator
      GenerateHTMLColour('dkimindicator', data[0].DKIMFinalState)

      // Get the Background Font Colour for DKIM
      console.log(data[0].DKIMFinalState)
      GenerateHTMLHeaderColour('dkimHeader', data[0].DNSSECFinalState)

      var arrDKIMFails = data[0].DKIMResults.ValidationFails.join("<br />");
      var arrDKIMWarns = data[0].DKIMResults.ValidationWarns.join("<br />");
      var arrDKIMPasses = data[0].DKIMResults.ValidationPasses.join("<br />");

      $('#domainResultsDKIMRecord').html(data[0].DKIMResults.Records[0].Record);
      $('#domainResultsDKIMRecordPasses').html(GenerateHTMLResult(arrDKIMPasses));
      $('#domainResultsDKIMRecordFails').html(GenerateHTMLResult(arrDKIMFails));
      $('#domainResultsDKIMRecordWarns').html(GenerateHTMLResult(arrDKIMWarns));

    },
    'error': function (xhr, ajaxOptions, thrownError) {
      $('#domainResultsDiv').html('Failed to connect to API: ' + thrownError);
    }
  });
}
function GenerateHTMLResult(result) {
  if (result.includes('PASS')) {
    var final = result.replace(/PASS:/g, '<i class="fas fa-check-circle text-success" style="font-size:1.3rem;"></i>')
    return final
  }
  if (result.includes('WARN')) {
    var final = result.replace(/WARN:/g, '<i class="fas fa-exclamation-circle text-warning" style="font-size:1.3rem;"></i>')
    return final
  }
  if (result.includes('FAIL')) {
    var final = result.replace(/FAIL:/g, '<i class="fas fa-times-circle text-danger" style="font-size:1.3rem;"></i>')
    return final
  }
}

function ClearExistingClasses() {
  // SPF Clear
  $('#domainResultsSPFRecord').html('');
  $('#domainResultsSPFPasses').html('');
  $('#domainResultsSPFWarns').html('');
  $('#domainResultsSPFFails').html('');
  var spfelement = document.getElementById("spfCard");
  spfelement.classList.remove("bg-success", "bg-warning", "bg-danger");

  var spfindicator = document.getElementById("spfindicator");
  spfindicator.classList.remove("bg-success", "bg-warning", "bg-danger", "bg-dark");

  // DMARC Clear
  $('#domainResultsDMARCRecord').html('');
  $('#domainResultsDMARCPasses').html('');
  $('#domainResultsDMARCWarns').html('');
  $('#domainResultsDMARCFails').html('');
  var dmarcelement = document.getElementById("dmarcCard");
  dmarcelement.classList.remove("bg-success", "bg-warning", "bg-danger");

  var dmarcindicator = document.getElementById("dmarcindicator");
  dmarcindicator.classList.remove("bg-success", "bg-warning", "bg-danger", "bg-dark");

  // MX Clear
  $('#domainResultsMXRecord').html('');
  $('#domainResultsMXRecordPasses').html('');
  $('#domainResultsMXRecordFails').html('');
  $('#domainResultsMXRecordWarns').html('');
  $('#domainResultsMXMailProvider').html('');
  var mxelement = document.getElementById("mxCard");
  mxelement.classList.remove("bg-success", "bg-warning", "bg-danger");

  var mxindicator = document.getElementById("mxindicator");
  mxindicator.classList.remove("bg-success", "bg-warning", "bg-danger", "bg-dark");

  // DNSSEC Clear
  $('#domainResultsDNSSECRecord').html('');
  $('#domainResultsDNSSECRecordPasses').html('');
  $('#domainResultsDNSSECRecordFails').html('');
  $('#domainResultsDNSSECRecordWarns').html('');
  var dnssecelement = document.getElementById("dnssecCard");
  dnssecelement.classList.remove("bg-success", "bg-warning", "bg-danger");

  var dnssecindicator = document.getElementById("dnssecindicator");
  dnssecindicator.classList.remove("bg-success", "bg-warning", "bg-danger", "bg-dark");

  // DKIM Clear
  $('#domainResultsDKIMRecord').html('');
  $('#domainResultsDKIMRecordPasses').html('');
  $('#domainResultsDKIMRecordFails').html('');
  $('#domainResultsDKIMRecordWarns').html('');
  var dkimelement = document.getElementById("dkimCard");
  dkimelement.classList.remove("bg-success", "bg-warning", "bg-danger");

  var dkimindicator = document.getElementById("dkimindicator");
  dkimindicator.classList.remove("bg-success", "bg-warning", "bg-danger", "bg-dark");
}

function GenerateHTMLColour(id, data) {
  var element = document.getElementById(id);
  if (data === 'Fail') {
    element.classList.add("bg-danger");
  }
  if (data === 'Pass') {
    element.classList.add("bg-success");
  }
  if (data === 'Warn') {
    element.classList.add("bg-warning");
  }
}

function GenerateHTMLHeaderColour(id, data) {
  var element = document.getElementById(id);
  if (data === 'Fail') {
    element.classList.add("text-white");
  }
  if (data === 'Pass') {
    element.classList.add("text-white");
  }
  if (data === 'Warn') {
    element.classList.add("text-dark");
  }
}

