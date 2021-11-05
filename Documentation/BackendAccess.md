<p align="center"><a href="https://cyberdrain.com" target="_blank" rel="noopener noreferrer"><img src="../assets/img/CyberDrain.png" alt="CyberDrain Logo"></a></p>

# Backend access

You can gain access to the Azure backend by browsing to your Azure Portal. We also include an easy way to jump to the correct locations via the configuration settings -> Security page. Clicking on "Get backend URLS" gives you all the important URLs for your specific environment.

## Resource group

This is the location of all your resources.

## Key vault

This is your password storage, if you want to change your keys manually this can be done here. CIPP rotates these keys automatically each Sunday.

## Function application

The overview page alows you to stop the API, or restart it. 
The configuration page allows you to change settings. If you want to set the timezone, check out [this](https://daniel.mcloughlin.cloud/set-azure-function-timezone) URL.
The deployment center allows you to sync the API to the latest version

## Static webapp

Custom domains brings you to the location where you can change the custom domains
Role management allows you to invite users, and set the roles for users.