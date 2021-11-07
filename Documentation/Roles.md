<p align="center"><a href="https://cyberdrain.com" target="_blank" rel="noopener noreferrer"><img src="../assets/img/CyberDrain.png" alt="CyberDrain Logo"></a></p>

# Role management

With version 1.3: Gin. We've introduced a new role management system. These roles are as follows;

- readonly - a user that is only allowed to read and list items, and send push messages to users.
- editor - a user that is allowed to perform everything, except editing tenant exclusions and standards.
- admin - a user that is allowed to perform everything.

Adding these roles is done using the invite system of the Static Web App. You can find this at the following location:

- Go to the Azure Portal
- Go to your CIPP Resource Group
- Click on CIPP-SWA-XXXX
- Click on Role Management (Not IAM. Role Management.)
- Click invite user
- Add the roles for the user. 


# Current known issues / Limitations

None. This should work as expected. If you have any issues. Please report this as a bug.