$(document).ready(function () {
    //gets the current Tenantfilter
    let searchParams = new URLSearchParams(window.location.search)
    var TenantID = '';
    if (searchParams.has('Tenantfilter')) {
        TenantID = searchParams.get('Tenantfilter')
    }
    //checks if the default location has been set, and if so, use that again.

    //checks if a userid is present, and if so, we prefill the form.
    if (searchParams.has('UserID')) {
        var UserID = searchParams.get('UserID')
        $('#userID').val(UserID)
        $('#tenantID').val(TenantID)
        $.ajax({
            'async': true,
            'global': false,
            'url': 'api/ListUsers?TenantFilter=' + TenantID + '&UserID=' + UserID,
            'dataType': "json",
            'success': function (data) {
                document.getElementById("UserName").innerHTML = data[0].displayName
                document.getElementById("UserDetails").innerHTML = '<table class="table">' +
                    "<tr><td>First Name</td><td>" + data[0].givenName + "</td></tr>" +
                    "<tr><td>Last Name</td><td>" + data[0].surname + "</td></tr>" +
                    "<tr><td>Alias</td><td>" + data[0].mailNickname + "</td></tr>" +
                    "<tr><td>Primary Domain</td><td>" + data[0].primDomain + "</td></tr>" +
                    "<tr><td>Usage Location</td><td>" + data[0].usageLocation + "</td></tr>" +
                    "<tr><td>Street Address</td><td>" + data[0].streetAddress + "</td></tr>" +
                    "<tr><td>City</td><td>" + data[0].city + "</td></tr>" +
                    "<tr><td>Postcode</td><td>" + data[0].postalCode + "</td></tr>" +
                    "<tr><td>Country</td><td>" + data[0].country + "</td></tr>" +
                    "<tr><td>Company Name</td><td>" + data[0].companyName + "</td></tr>" +
                    "<tr><td>Department</td><td>" + data[0].department + "</td></tr>" +
                    "<tr><td>Postal Code</td><td>" + data[0].postalCode + "</td></tr>" +
                    "<tr><td>Mobile Phone</td><td>" + data[0].mobilePhone + "</td></tr>" +
                    "<tr><td>Business Phone</td><td>" + data[0].businessPhones + "</td></tr></table>"

                    var loginDetails = `<table class="table">
                    <tr><td>Last Signin Date</td><td>${data[0].LastSigninDate}</td></tr>
                    <tr><td>Last Signin Application</td><td>${data[0].LastSigninApplication}</td></tr>
                    <tr><td>Last Signin Status</td><td>${data[0].LastSigninStatus}</td></tr>
                    <tr><td>Last Signin Result</td><td>${data[0].LastSigninResult}</td></tr>
                    <tr><td>Last Signin Failure Reason</td><td>${data[0].LastSigninFailureReason}</td></tr>
                    </table>`
                    $("#LastLoginDetails").append(loginDetails);
                //"<tr><td>Raw</td><td>" +  JSON.stringify(data, null, 2) + "</td></tr></table>"
            }
        }
        ),
            $.ajax({
                'async': true,
                'global': false,
                'url': 'api/ListUserConditionalAccessPolicies?TenantFilter=' + TenantID + '&UserID=' + UserID,
                'dataType': "json",
                'success': function (data) {
                    var table = $('<table class="table"><tbody>');
                    $.each(data, function (index, value) {
                        var TableRow = "<tr>";
                        TableRow += "<td>" + value.displayName + "</td>";
                        TableRow += "</tr>";
                        $(table).append(TableRow);
                    });
                    $(table).appendTo("#ConditionalAccessDetails");
                }
            }
            ),
            $.ajax({
                'async': true,
                'global': false,
                'url': 'api/ListUserDevices?TenantFilter=' + TenantID + '&UserID=' + UserID,
                'dataType': "json",
                'success': function (data) {
                    var tbl_body = document.createElement("tbody");
                    $.each(data, function (index, value) {
                        var accountEnabled;
                        if (value.accountEnabled === true) {
                            accountEnabled = '<td><i class="fas fa-check-circle text-success fa-2x"></i></td>';
                        } else {
                            accountEnabled =  '<td><i class="fas fa-times-circle text-danger fa-2x"></i></a></td>';
                        }

                        var isCompliant;
                        if (value.isCompliant === true) {
                            isCompliant = '<td><i class="fas fa-check-circle text-success fa-2x"></i></td>';
                        } else {
                            isCompliant = '<td><i class="fas fa-times-circle text-danger fa-2x"></i></a></td>';
                        }

                        var onPremisesSyncEnabled;
                        if (value.onPremisesSyncEnabled === true) {
                            onPremisesSyncEnabled = '<td><i class="fas fa-check-circle text-success fa-2x"></i></td>';
                        } else {
                            onPremisesSyncEnabled = '<td><i class="fas fa-times-circle text-danger fa-2x"></i></a></td>';
                        }

                        var tbl_row =`<tr><td>${value.displayName}</td>
                        ${accountEnabled}
                        ${isCompliant}
                        <td>${value.manufacturer}</td>
                        <td>${value.model}</td>
                        <td>${value.operatingSystem}</td>
                        <td>${value.operatingSystemVersion}</td>
                        <td>${value.createdDateTime}</td>
                        <td>${value.approximateLastSignInDateTime}</td>
                        <td>${value.deviceOwnership}</td>
                        <td>${value.enrollmentType}</td>
                        <td>${value.managementType}</td>
                        ${onPremisesSyncEnabled}
                        <td>${value.trustType}</td></tr>`
                                        
                        $(tbl_body).append(tbl_row);
                    });
                    $("#UserDevices").append(tbl_body);
                }
            }
            ),
            $.ajax({
                'async': true,
                'global': false,
                'url': 'api/ListUserSigninLogs?TenantFilter=' + TenantID + '&UserID=' + UserID,
                'dataType': "json",
                'success': function (data, type, row) {
                    var tbl_body = document.createElement("tbody");
                    $.each(data, function (index, value) {
                        var tbl_row =`<tr><td>${value.Date}</td>
                        <td>${value.Application}</td>
                        <td>${value.LoginStatus}</td>
                        <td>${value.ConditionalAccessStatus}</td>
                        <td>${value.OverallLoginStatus}</td>
                        <td>${value.IPAddress}</td>
                        <td>${value.Town}</td>
                        <td>${value.State}</td>
                        <td>${value.Country}</td>
                        <td>${value.Device}</td>
                        <td>${value.DeviceCompliant}</td>
                        <td>${value.OS}</td>
                        <td>${value.Browser}</td>
                        <td>
                        <button type="button" class="btn btn-secondary btn-sm" data-bs-toggle="modal" data-bs-target=#"${row.GUID}MoreInfo">More</button>
                        <!-- Modal -->
                        <div class="modal fade" id="${row.GUID}MoreInfo" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                            <div class="modal-dialog modal-lg">
                                <div class="modal-content">
                                    <div class="modal-header">
                                        <h5 class="modal-title" id="exampleModalLabel">More Information</h5>
                                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                    </div>
                                    <div class="modal-body">
                                        <h3>Conditional Access Policies Applied</h3><br /><br />
                                    </div>
                                    <div class="modal-footer">
                                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        </td></tr>`
                                        
                        $(tbl_body).append(tbl_row);
                    });
                    $("#UserSignIn").append(tbl_body);
                }
            }
            )
    }
    //only shows input when needed
    $('input[type="checkbox"]').click(function () {
        var inputValue = $(this).attr("switches");
        $("#" + inputValue).toggle();
    });
    //only shows license list when needed
    $('input[type="radio"]').click(function () {
        var inputValue = $(this).attr("switches");
        $("#" + inputValue).toggle();
    });
    //fills the usage location array from a local json for speed.
    var UsageLocationList = document.getElementById('UsageLocationList');
    $.getJSON("js/countrylist.json", function (data) {
        data.forEach(function (item) {
            var option = document.createElement('option');
            option.value = item.Code
            option.text = item.Name;
            UsageLocationList.appendChild(option);
        });
        var LastLocation = localStorage.getItem('DefaultLocation')
        if (LastLocation) {
            $('#LocationDataList').val(LastLocation)
        }
    }).fail(function () {
        console.log("An error has occurred.");
    });

    //Creates licenses checkboxes

    (function () {
        $.ajax({
            'async': true,
            'global': false,
            'url': 'api/ListLicenses?TenantFilter=' + TenantID,
            'dataType': "json",
            'success': function (data) {
                if (Array.isArray(data)) {
                    // Loop over the JSON array.
                    data.forEach(function (item) {
                        var html = '<div class="form-check"><input class="form-check-input" id="' + item.skuId + '" name="License_' + item.skuId + '" type="checkbox" value="' + item.skuId + '" /><label class="form-check-label" for="' + item.skuId + '">' + item.skuPartNumber + ' (' + item.availableUnits + ' available)</label></div>';
                        $('#LicenseList').append(html)
                    });
                } else {
                    var html = '<div class="form-check"><input class="form-check-input" id="' + data.skuId + '" name="License_' + data.skuId + '" type="checkbox" value="' + data.skuId + '" /><label class="form-check-label" for="' + data.skuId + '">' + data.skuPartNumber + ' (' + data.availableUnits + ' available)</label></div>';
                    $('#LicenseList').append(html)
                }
            }
        });
    })();

    var DomainOption = document.getElementById('DomainOption');
    (function () {
        $.ajax({
            'async': true,
            'global': false,
            'url': 'api/ListDomains?TenantFilter=' + TenantID,
            'dataType': "json",
            'success': function (data) {
                if (Array.isArray(data)) {
                    // Loop over the JSON array.
                    data.forEach(function (item) {
                        var option = document.createElement('option');
                        option.value = item.id
                        option.text = item.id;
                        DomainOption.appendChild(option);

                    });
                } else {
                    var option = document.createElement('option');
                    option.value = data.id
                    option.text = data.id;
                    DomainOption.appendChild(option);
                }
            }
        });
    })();

    //append tenant in back to users
    if (TenantID !== '') {
        var href = $(".back-to-users").attr("href");
        $(".back-to-users").attr("href", href + "&Tenantfilter=" + TenantID);
    }
    //checks if a user location has been filled in, and if so, add it as the default 
    $("#LocationDataList").change(function () {
        localStorage.setItem('DefaultLocation', $(this).val())
    });
});