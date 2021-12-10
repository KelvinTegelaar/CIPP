$(document).ready(function () {
    let searchParams = new URLSearchParams(window.location.search)
    var TenantID = '';
    var UserID = '';
    GroupID = searchParams.get('GroupID')
    TenantID = searchParams.get('Tenantfilter')

    $.ajax({
        'async': true,
        'global': false,
        'url': 'api/ListTeams?Type=Team&Tenantfilter=' + TenantID + '&ID=' + GroupID,
        'dataType': "json",
        'contentType': "application/json",
        'success': function (data) {
            $('#loader').html(`<i class="fas fa-check-circle text-success fa-2x"></i><br>`)
            if (data.Results) { $("#UserDetails").html('<i class="fas fa-times-circle text-danger fa-2x"></i>Error - could not retrieve information from API.') }
            data[0].TeamInfo.forEach(function (item) {
                $('#TeamDetails').append(`<table class="table">
                  <tr><td>Display Name</td><td>${item.displayName}</td></tr>
                  <tr><td>Description</td><td>${item.description}</td></tr>
                  <tr><td>Archived</td><td>${item.isArchived}</td></tr>
                  <tr><td>Creation Date</td><td>${item.createdDateTime}</td></tr>
                  <tr><td>Visibility</td><td>${item.visibility}</td></tr>
                 <tr><td>Direct URL</td><td><a href=${item.webUrl}>URL</a></td></tr></table>`);

                $('#MemberPolicies').append(`<table class="table">
                  <tr><td>Can edit and remove Apps</td><td>${item.memberSettings.allowAddRemoveApps}</td></tr>
                  <tr><td>Can create private Channels</td><td>${item.memberSettings.allowCreatePrivateChannels}</td></tr>
                 <tr><td>Can create and edit Channels</td><td>${item.memberSettings.allowCreateUpdateChannels}</td></tr>
                  <tr><td>Can delete channels</td><td>${item.memberSettings.allowDeleteChannels}</td></tr>
                <tr><td>Can create and edit Connectors</td><td>${item.memberSettings.allowCreateUpdateRemoveConnectors}</td></tr>
                <tr><td>Can create and edit Tabs</td><td>${item.memberSettings.allowCreateUpdateRemoveTabs}</td></tr></table>`);

                $('#MessageSettings').append(`<table class="table">
                  <tr><td>Allow @Channel Mentions</td><td>${item.messagingSettings.allowChannelMentions}</td></tr>
                        <tr><td>Allow @Team mentions</td><td>${item.messagingSettings.allowTeamMentions}</td></tr>
                  <tr><td>Allow owners to delete messages</td><td>${item.messagingSettings.allowOwnerDeleteMessages}</td></tr>
           
                  <tr><td>Allow users to delete messages</td><td>${item.messagingSettings.allowUserDeleteMessages}</td></tr>
                <tr><td>Allow users to edit messages</td><td>${item.messagingSettings.allowUserEditMessages}</td></tr>
                <tr><td>Allow custom memes</td><td>${item.funSettings.allowCustomMemes}</td></tr>
                <tr><td>Allow GIFs</td><td>${item.funSettings.allowGiphy}</td></tr>
                <tr><td>Allow Stickers and Memes</td><td>${item.funSettings.allowStickersAndMemes}</td></tr>
                <tr><td>GIF Content Rating</td><td>${item.funSettings.giphyContentRating}</td></tr></table>`);

                $('#Policies').append(`<table class="table">
                  <tr><td>Guests Create Channels</td><td>${item.guestSettings.allowCreateUpdateChannels}</td></tr>
                  <tr><td>Guests Delete Channels</td><td>${item.guestSettings.allowDeleteChannels}</td></tr></table>`);


            })

            data[0].Owners.forEach(function (item) {
                $('#TeamOwners').append(`<tr><td>${item.displayName}</td><td>${item.email}</td></tr>`);
            })
            data[0].Members.forEach(function (item) {
                $('#TeamUsers').append(`<tr><td>${item.displayName}</td><td>${item.email}</td></tr>`);

            })
            data[0].ChannelInfo.forEach(function (item) {
                if (item.description === null) { item.description = "None" }
                if (item.isFavoriteByDefault === null) { item.isFavoriteByDefault = "Not set" }
                if (item.email === "") { item.email = "Not set" }
                $('#Channels').append(`<tr>
                <td>${item.displayName}</td>
                <td>${item.description}</td>
                <td>${item.createdDateTime}</td>
                <td>${item.isFavoriteByDefault}</td>
                <td>${item.membershipType}</td>
                <td><a href="${item.webUrl}">URL</a></td>
                <td>${item.email}</td>
                </tr>`);

            })

            data[0].InstalledApps.forEach(function (item) {
                if (item.teamsAppDefinition.description === null) { item.teamsAppDefinition.description = "None" }
                if (item.teamsAppDefinition.createdBy === null) { item.teamsAppDefinition.createdBy = "Unknown" }
                $('#Apps').append(`<tr>
                <td>${item.teamsAppDefinition.displayName}</td>
                <td>${item.teamsAppDefinition.description}</td>
                <td>${item.teamsAppDefinition.version}</td>
                <td>${item.teamsAppDefinition.createdBy}</td>
                </tr>`);

            })
        },
        'error': function (xhr, ajaxOptions, thrownError) {
            $("#loader").html('<i class="fas fa-times-circle text-danger fa-2x"></i>Error - could not retrieve information for this team.')
        }
    });
})
