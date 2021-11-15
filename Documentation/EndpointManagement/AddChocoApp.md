# Adding a Chocolatey App

You can add a Chocolatey app by executing this wizard. The wizard will guide you through the steps. If you have a personal repository you can enter the URL for this repo too.

Adding the Chocolatey App is done asynchronously. This means that the wizard will make sure everything is setup, and start the process after you've hit the deploy button. The status of the deployment can be traced through the logs page.

The application we upload is [this](https://github.com/KelvinTegelaar/CIPP-API/master/AddChocoApp/Intunepackage.Intunewin) prepared intunewin file with two scripts included - Install.ps1 and uninstall.ps1. Both these scripts install Chocolatey, and run an install or uninstall command.

If you are unsure or don't trust the intunewin file, you can always replace this with your own in your fork, you can also download and test, and view the contents of this intunewin file.

# Current known issues / Limitations

None. This should work as expected. If you have any issues. Please report this as a bug.