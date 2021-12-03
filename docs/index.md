# What is this?

The CyberDrain Improved Partner Portal is a portal to help manage administration for Microsoft Partners. The current Microsoft partner landscape makes it fairly hard to manage multi tenant situations, with loads of manual work. Microsoft Lighthouse might resolve this in the future but development of this is lagging far behind development of the current market for Microsoft Partners.

This project is a way to help you with administration, with user management, and deploying your own preferred standards. It's not a replacement for security tools, or a way to cut costs on specific subscriptions. The tool should assist you in removing the gripes with standard partner management and save you several hours per engineer per month.

# Deployment and Getting Started

If you want to self-host, check out the [installation manual](https://kelvintegelaar.github.io/CIPP/GettingStarted/Installation.html). You will need some knowledge of Static Web Apps, Azure Functions, and Azure KeyVault

# Why are you making this?

I'm kind of done waiting for vendors to catch up to what we actually need. All RMM vendors are dramaticaly slow adopting cloud management. Microsoft themselves don't understand the Managed services markets, there are vendors that have tried jumping into the gap but either have unreasonable fees, weird constructions, require Global Admins without MFA, or just don't innovate at a pace that is required of cloud services right now.

I'm also annoyed the untransparant behaviour that many companies in our market are showing. Most are claiming that working with the Microsoft Partner APIs is difficult, and requires a very heavy development team. I'm a guy that had no webdesign knowledge before this and created the first release of this app in 3 weekends. Vendors that claim high difficulty or issues with integration are simply not giving this *any* priority. This is also why the [changelog](https://kelvintegelaar.github.io/CIPP/GettingStarted/Changelog.html) contains how many hours I've spend to built each release. These hours are directly taken from my VSCode Extensions. 

I was recently on a call with one of my friends and he said he was changing the world. That insipred me to change the world just a little bit too. :) I'm hoping that this is one of the tools that make you smile.

# What's the pricing?

This project is **FREE** but we do have a **Sponsorware** component. The sponsorware structure for this project is pretty simple; the code is available to everyone and free to use. You will need some technical know-how to put it all together. Sponsors receive the following benefits

### For users of the project that sponsor:

- The project will be hosted for you.
- The hosted version will always be the latest release and automatically updated.
- You'll also receive a staging environment with the latest (nightly/beta) build, to see new features before anyone else.
- You will receive priority on support issues reported on Github.
- You will be able to make 1 priortized feature request per month.

Sponsorship allows me to sink some more time into this project and keep it free, so please consider it. :)

### For company sponsors, depending on sponsor level you can get the following benefits;

- Your company logo will be featured on this readme page at the top.
- Your company logo will be featured on https://cyberdrain.com
- A small version of your company logo with a link to your homepage will be on the footer, each user will see this on each page.

# What is the functionality?

The current build functionality is described below, also check out our Changelog in the documentation folder. Any unmarked items are in development.

## General
  - [x] Allow adding/removing tenants to skip
  - [X] Create two user levels for access to settings: User and Admin, Admin can add exclusions/remove exclusions/access complete logs.
  - [ ] Allow export of logs to SIEM/External SOC

## Applications    
- [x] List all applications in tenants
- [x] List installation status of a specific application per device
- [ ] Add/Remove custom applications via win32(intunewin) to multiple tenants
- [X] Add Office Apps to multiple tenants
- [X] Add/Remove Chocolatey Apps to multiple tenants
- [ ] Add/Remove Ninite Pro Apps to multiple tenants
- [X] Assign Apps to All Devices or All Users
- [ ] Report on installation status
- [ ] Assign apps to specific groups

## Devices
- [X] Add autopilot configuration
- [X] Add Enrollment Status Pages
- [X] Add Autopilot Devices
- [X] Add Administrative templates / Policies

## Users
- [X] List all administered users with tenant filtering options
- [X] Convert user to shared mailbox
- [X] View/edit licenses
- [X] List users
- [X] Add/Remove users to groups
- [ ] User alerting

## Tenant Administration
- [X] Deploy any custom graph command
- [X] Set selected defaults across selected tenants
- [X] Monitor defaults across tenants.
- [ ] Tenant Alerting

# Security
Authentication is handled by Azure AD using static web apps security. This means the API is only reachable for authenticated users you've invited. For most of the security info related to that check out our staticwebapp.config.json and/or the doc pages on static web apps. Do you see something that might be a security risk, even the smallest? report it and we will handle it asap. Check out our [security reporting options](\GettingStarted\Security.md)

# Contributions

Feel free to send pull requests or fill out issues when you encounter them, sponsors get a priority on issues and bugs. I'm also completely open to adding direct maintainers/contributors and working together.

If you decide to contribute; remember that keeping the portal fast is a key component. CIPP is supposed to go brrrrr, any improvements that help with speed are welcomed.

## Welcomed changes/contributions in no particular order
- the code quality and repetive code on the functions can use some work
- HTML and JQuery definitely needs consolidation and improvement, as I am not a web developer I did what I could... :)
- Spelling and grammar check, both of APIs and the actual text.

## Special thanks

I'd like to give special thanks to the people that made this project possible;

- [Kyle Hansloven](https://huntress.com) 
- [Ray Orsini](https://oit.co)
- The Team at [MSP.zone/MSP'R'Us](https://msp.zone)
- Gavin Stone at [MSPGeek](https://mspgeek.org)
- MSP2.0 for helping with some visual input.
- Scott, Chris, Jon, and others that helped me with some of the internals of the app.
