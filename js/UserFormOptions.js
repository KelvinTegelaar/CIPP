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
                //basic fields
                $('#inputFirstName').val(data[0].givenName)
                $('#inputLastName').val(data[0].surname)
                $('#inputEmailAddress').val(data[0].displayName)
                $('#Username').val(data[0].mailNickname)
                $('#Domain').val(data[0].primDomain)
                $('#LocationDataList').val(data[0].usageLocation)
                //extended fields
                $('#streetAddress').val(data[0].streetAddress)
                $('#City').val(data[0].city)
                $('#Country').val(data[0].country)
                $('#CompanyName').val(data[0].companyName)
                $('#Department').val(data[0].department)
                $('#PostalCode').val(data[0].postalCode)
                $('#MobilePhone').val(data[0].mobilePhone)
                $('#BusinessPhone').val(data[0].businessPhones)
                // list raw information
                $('#RawJson').text(JSON.stringify(data, null, 2))

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

    $('#inputFirstName, #inputLastName').on('input', function () {
        $('#inputEmailAddress').val($('#inputFirstName').val() + ' ' + $('#inputLastName').val())

    });

});