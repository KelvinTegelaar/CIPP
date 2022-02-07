<!-- markdownlint-disable-next-line MD041 -->
## Deployment and Getting Started

If you want to self-host, check out the [installation manual](/docs/user/installation/). You will need some knowledge of Static Web Apps, Azure Functions, and Azure KeyVault

## Why are you making this?

I'm kind of done waiting for vendors to catch up to what we actually need. All RMM vendors are proving slow to embrace cloud management features. Microsoft themselves don't understand the Managed Services market, there are vendors that have tried jumping into the gap but either have unreasonable fees, weird constructions, require Global Admins without MFA, or just don't innovate at a pace that is required of cloud services right now.

I'm also annoyed the opaque behaviour that many companies in our market are showing. Most are claiming that working with the Microsoft Partner APIs is difficult, and requires significant development effort. I'm a guy that had no web design knowledge before this and created the first release of this app in 3 weekends. Vendors that claim high difficulty or issues with integration are simply not giving this *any* priority.

I was recently on a call with one of my friends and he said he was changing the world. That inspired me to change the world just a little bit too. :) I'm hoping that this is one of the tools that make you smile.

## What's the pricing?

This project is **FREE** but we do have a **Sponsor-ware** component. The sponsor-ware structure for this project is pretty simple; the code is available to everyone and free to use. You will need some technical know-how to put it all together. Sponsors receive the following benefits

### For users of the project that sponsor

* The project will be hosted for you.
* The hosted version will always be the latest release and automatically updated.
* You'll also receive a staging environment with the latest (nightly/beta) build, to see new features before they go live.
* You will receive priority on support issues reported on GitHub.
* You will be able to make 1 prioritized feature request per month.

Sponsorship allows me to put some more time into this project and keep it free, so please consider it. :)

### For company sponsors, depending on sponsor level you can get the following benefits

* Your company logo will be featured on the [CIPP website](https://cipp.app).
* Your company logo will be featured on the [CIPP repository's README](https://github.com/KelvinTegelaar/CIPP) at the top.
* Your company logo will be featured on the [CyberDrain website](https://cyberdrain.com).
* A small version of your company logo with a link to your homepage will be on the footer, each user will see this on each page.

## What is the functionality?

Your best bet is to dive into the [User Guide](/docs/user/) to see what features CIPP currently offers.

## Security

Authentication is handled by Azure AD using static web apps security. This means the API is only reachable for authenticated users you've invited. For most of the security info related to that check out our `staticwebapp.config.json` and/or the doc pages on static web apps. Do you see something that might be a security risk, even the smallest? report it and we will handle it asap. Check out our [security reporting options](/docs/user/security/).

## Special thanks

I'd like to give special thanks to the people that made this project possible;

* [Kyle Hansloven](https://huntress.com)
* [Ray Orsini](https://oit.co)
* The Team at [MSP.zone/MSP'R'Us](https://msp.zone)
* Gavin Stone at [MSPGeek](https://mspgeek.org)
* MSP2.0 for helping with some visual input.
* Scott, Chris, Jon, and others that helped me with some of the internals of the app.
