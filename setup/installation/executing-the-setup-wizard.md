# Executing the Setup Wizard

This guide walks you through the process of executing the Setup Wizard inside CIPP for the first time. The Setup Wizard presents you with multiple options, if this is your first setup, choose the "First Setup" option.

### Getting Started with the CIPP Setup Wizard

The **First Setup** option is designed for initial configuration. It guides you through essential steps to prepare CIPP and connect your tenants.

1. **Begin Setup**\
   Click on **"First Setup"** to start the configuration process.
2. **Application Registration**\
   On this page, you’ll create the necessary Application Registration in your Microsoft 365 environment. This application is used to manage tenant connections.
   * Click **Authenticate** and follow the on-screen instructions to register the application.
   * **Important:** Use the dedicated CIPP service account created during the preparation steps.
3. **Tenant Configuration**\
   Choose how you want to connect your tenants. Even if you’re not a Microsoft Partner, we strongly recommend selecting **"Connect to Partner Tenant"** first. This allows CIPP to manage credentials and application permissions effectively.
   * You can also add tenants individually, outside your partner relationship. These tenants show up in the table directly below, and can be removed if you accidentally authenticated the wrong tenant.
   * For these separate tenants, use a service account with equivalent permissions as the partner tenant. More information on these roles can be found under [recommended-roles.md](recommended-roles.md "mention")
4. **Select Baselines**\
   Choose from a list of available configuration baselines. These presets help you quickly apply best practices and policies.
   * We recommend selecting the **CyberDrain Templates** for the most optimized standard configurations, and receiving templates and examples on how to utilize standards.
5. **Configure Notifications**\
   Set up email notifications on the next page.
   * Ensure your service account has a mailbox enabled to support email alerts. This can either be a shared mailbox
   * You can test notification delivery directly from this screen.
6. **Optional Features**\
   The final step presents a list of optional features you can enable to further enhance CIPP’s functionality. Review and configure these as needed.



