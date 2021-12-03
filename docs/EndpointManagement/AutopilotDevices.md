# Adding Autopilot Devices

Adding autopilot devices can be done by following the Wizard using the standard Microsoft Partner APIs. These APIs allow you to add devices in three ways:
As a partner, you can register devices to Windows Autopilot using any one of these methods:
- Hardware Hash (available from OEM or on-device script)
- Combination of Manufacturer, Device Model, Device Serial Number
- Windows Product Key ID
# Current known issues / Limitations

The API cannot directly return errors currently, which means that generic errors might appear. We've listed some below.

# Known error list

400 - You've entered incorrect data, check the information and try again
500 - The application does not have access to the partner center