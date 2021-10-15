<p align="center"><a href="https://cyberdrain.com" target="_blank" rel="noopener noreferrer"><img src="../assets/img/CyberDrain.png" alt="CyberDrain Logo"></a></p>

# Deploying policies

To create a policy an get it's raw JSON information you'll have to go to the [endpoint.microsoft.com](https://endpoint.microsoft.com) portal.

- Go to Devices -> Configuration Profiles
- Create a new configuration profile
- Choose "Windows 10 and later" as a platform
- Choose "Templates" and then "Administrative Templates"
- Select all the settings you want, remember that there are both computer policies and user policies.
- at Review and Create, do not click on the "Create" button but press F12 on your keyboard to open the developer tools.
- Now click on "Create" and look for the "UpdateDefiniationValues" post request. 
- Click on "Headers" and scroll down to "request payload". this is the raw JSON paylow. To easily copy it, click on "view source" and copy the entire text string.
- You can now use CIPP to deploy this policy to all tenants.



# Current known issues / Limitations

Only "Administrative Templates" are supported, others might work too but have not been tested.