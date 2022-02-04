<!-- markdownlint-disable-next-line MD041 -->
You have questions? That's okay! We're here to help, you'll find the answer to some common questions about CIPP below and answers to more technical or specific questions in the [FAQ](/docs/user/faq/).

<details><summary>Who are the developers?</summary>

We almost all work for Managed Service Providers (MSPs) who develop CIPP on a voluntary basis though some contributors may be paid to work on specific features or projects. The development team is led by:

* [Kelvin Tegelaar](https://www.cyberdrain.com)
* [Gavin Stone](https://www.gavsto.com)

You'll find details about other contributors [on GitHub](https://github.com/KelvinTegelaar/CIPP/graphs/contributors)

</details>

<details><summary>How much does it cost?</summary>

CIPP is free, open-source software and is available under the [AGPLv3 license](/docs/dev/licensing#agplv3). You need to provide your own hosting using Azure Static Web Apps and Azure Functions in order to run CIPP. Hosting on your own servers or using anything other than Azure is not supported.

You can, if you wish, donate to support CIPP [on GitHub](https://github.com/sponsors/KelvinTegelaar/), sponsors at certain levels can have CIPP hosted for them by Kelvin.

</details>

<details><summary>Is this secure?</summary>

CIPP is built from the ground up with security in mind. It is built with [Azure Functions](https://docs.microsoft.com/en-us/azure/azure-functions/functions-overview) and [Azure Static Web Apps](https://docs.microsoft.com/en-us/azure/static-web-apps/overview) and relies on the security provided by Azure Static Web Apps to handle authorization and authentication.

CIPP uses several automated code scanning tools to check for vulnerabilities and ensure that the code is as safe and secure as we can make it. You are free to audit the code (which you'll find in the GitHub repositories linked in the NavBar above) and report any issues you find.

Paid code security audits will be undertaken as funding allows. If you think you've found a security issue please see our [security policy](docs/user/security/) for information on how to let us know.

</details>

<details><summary>How is CIPP funded?</summary>

CIPP is funded by donations and time from our [sponsors](/sponsors) and [contributors](/contributors).

</details>
