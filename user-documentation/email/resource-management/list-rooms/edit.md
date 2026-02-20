# Edit Room

Opened from the per-row actions on the List Rooms page, this page will allow you to edit the details of the selected room.

{% hint style="info" %}
There is a refresh button in the top right corner that will allow you to update the page with the most up to date settings from Exchange.
{% endhint %}

## Basic Information

| Field                     | Description                                                                         |
| ------------------------- | ----------------------------------------------------------------------------------- |
| Display Name              | Edit the display name of the field as desired                                       |
| Hidden from Address Lists | Toggle this setting to set the Boolean value for the room's address list visibility |

## Booking Settings

| Field                              | Description                                                                                                                                                                                                                                                  |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Room Capacity                      | Set the integer for the capacity of the room either by typing over the number or using the up and down arrows                                                                                                                                                |
| Maximum Booking Duration (Minutes) | The maximum allowable duration of a meeting                                                                                                                                                                                                                  |
| Booking Window (Days)              | The maximum number of days in the future a meeting can be scheduled                                                                                                                                                                                          |
| Booking Process                    | Options for how the owner of the Bookings site will treat the calendar invites they receive are `None - no processing`(Invite will not be accepted or denied by the Room), `AutoAccept - Accept/Decline but not delete` and `AutoAccept - Accept and delete` |
| Allow Recurring Meetings           | A Boolean that will determine if the room accepts recurring meeting invites                                                                                                                                                                                  |
| Allow Double-Booking               | A Boolean that will determine if the room accepts meetings that double book the room                                                                                                                                                                         |
| Process External Meetings          | A Boolean that will determine if the room processes invites from external users                                                                                                                                                                              |
| Enforce Room Capacity              | A Boolean that will determine if the room mailbox caps meeting attendees to the capacity set above                                                                                                                                                           |
| Forward to Delegates               | A Boolean that will set whether meeting invites are automatically forwarded to those with delegated access to the room mailbox                                                                                                                               |
| Add Organizer to Subject           | A Boolean that will set if meeting subjects are appended with the name of the user who created the meeting                                                                                                                                                   |
| Delete Subject                     | A Boolean that will remove the meeting subject from the room mailbox calendar                                                                                                                                                                                |
| Remove Canceled Meetings           | A Boolean that will determine if the room mailbox removes canceled meetings from its calendar                                                                                                                                                                |

## Working Hours

| Field                           | Description                                                                                              |
| ------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Schedule Only During Work Hours | A Boolean that determines if the room will only accept meetings during work hours                        |
| Working Days                    | A multi-select drop down that will let you determine which days are included in the room's working hours |
| Timezone                        | Select the dropdown for the time zone the room is located in                                             |

## Room Facilities & Equipment

| Field                 | Description                                                                                                                                                                                     |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Wheelchair Accessible | Toggle this setting to set the Boolean value for the room's wheelchair accessibility                                                                                                            |
| Phone                 | A text field for the phone number of the room                                                                                                                                                   |
| Audio Device          | A text field to describe the audio device(s) available in the room                                                                                                                              |
| Video Device          | A text field to describe the video device(s) available in the room                                                                                                                              |
| Display Device        | A text field to describe the display device(s) available in the room                                                                                                                            |
| Tags                  | A multi-select field to add or remove tags from the room. Tags are used to identify features of the room. To add a tag, type the text of the tag in the box and click "Add option: \<tag text>" |

## Location Information

| Field          | Description                                                                            |
| -------------- | -------------------------------------------------------------------------------------- |
| Building       | The text for desired building name for where the room is located                       |
| Floor          | The integer value for the floor the room is located on                                 |
| Floor Label    | The text label for the floor the room is located on                                    |
| Street Address | The text for the street address of the building where the room is located              |
| City           | The text city of the building where the room is located                                |
| State/Province | The text for the state where the building is located                                   |
| Postal Code    | The postal code of the building where the room is located                              |
| Country/Region | A dropdown box to select the country/region for the building where the room is located |

***

{% include "../../../../.gitbook/includes/feature-request.md" %}
