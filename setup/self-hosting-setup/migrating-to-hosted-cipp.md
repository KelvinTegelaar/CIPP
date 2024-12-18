# Migrating to Hosted CIPP

When starting a CIPP sponsorship you have the option to self-host and receive support for this self-hosted instance, or use the version of CIPP hosted by CyberDrain. To migrate from self-hosted CIPP to hosted CIPP you can follow these instructions.

* Log into your **self-hosted** instance and go to Application Settings. Click the button Run Backup, download this backup and store this securely.
* Go to our [Management Portal](https://management.cipp.app) and login.&#x20;
* Deploy your hosted instance by filling in all information, and accept the initial invite to log into your hosted instance.
* Go to your **self-hosted** instance, and go to Application Settings -> Backend. Click on "Go to Keyvault". Keep this screen open.
* On **your hosted instance** go to SAM Setup Wizard. Click on "I have an existing application and would like to manually enter my tokens"
* Copy all the information from the Keyvault, into the now available fields. Finally click next and finish the setup.
* Restore your backup in your **hosted** instance by clicking on Application Settings -> Restore Backup.
* If you used a custom domain in the self-hosted instance, remove this custom domain and add it via the management portal.
