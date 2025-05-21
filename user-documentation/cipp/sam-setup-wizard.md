# SAM Setup Wizard

The SAM setup wizard is the keys to the engine that allows CIPP to manage your client tenants.

{% stepper %}
{% step %}
### **Onboarding**

Here you will be presented with options for how you want to run the wizard.

| Option                                              | Description                                                                                                                           |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Create application for me and connect to my tenants | Especially useful for first time setup, this option will create a new CIPP-SAM application in your partner tenant.                    |
| Refresh Tokens for existing application             | This will be used to refresh the token or replace the account used to authenticate the application.                                   |
| Manually enter credentials                          | This is for advanced use cases such as a migration from self-hosted to CyberDrain hosted or if you want to bring your own application |
{% endstep %}

{% step %}
### Configuration

This page will present you with the appropriate options for your selection in Step 1. Complete all actions before you can proceed.
{% endstep %}

{% step %}
### Confirmation

Once completed, you will see a completion message
{% endstep %}
{% endstepper %}

***

### Feature Requests / Ideas

We value your feedback and ideas. Please raise any [feature requests](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=\&labels=enhancement%2Cno-priority\&projects=\&template=feature.yml\&title=%5BFeature+Request%5D%3A+) on GitHub.
