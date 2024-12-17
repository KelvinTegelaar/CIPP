---
hidden: true
---

# CIPP New Interface Release Candidate Beta

**Welcome to the CIPP New Interface Beta Program! 🚀**

We’re excited to have you on board for the **CIPP New Interface Release Candidate Beta**! You’ve successfully enabled beta access via the management portal, and this page provides all the important details you need to ensure a smooth experience.

***

### **What You Need to Know**

#### **Feedback and Reporting**

Your feedback is critical in helping us improve the new interface. Here’s how to share your thoughts and experiences:

* **Primary Channel**: Use [Discord](https://discord.gg/9avVA2Hs) for all beta-related feedback, discussions, and questions.
  * By giving us your Discord username you will have been already added to the dedicated beta feedback channel here: [**#new-ui-beta**](https://discord.com/channels/905453405936447518/1318251404846043176)
* **GitHub**: Avoid creating GitHub issues unless you are an existing contributor. This keeps GitHub focused on actionable tasks for the dev team.

***

#### **Important Beta Warnings**

The beta version is a **work in progress**, so unexpected issues may occur. Please keep the following in mind:

1. **No Official Support**:
   * Beta support is limited to **community discussions** in Discord.
   * While we’ll monitor feedback closely, official support for beta-related issues is not provided at this time.
2. **Potential Issues**:
   * Loss of previous settings or configurations.
   * Login errors or disruptions to system access.
   * Alerts, monitoring tools, or other automated tasks may stop functioning.
3. **Backup & Rollback**:
   * You are responsible for creating a backup **before enabling the beta**. This includes user profiles, personal settings, alerts, and other configurations.
   * If needed, you can **roll back** to the previous version using the management portal, but this requires **restoring from a backup you created prior to migration.**
4. **No Documentation Yet**:
   * Documentation for the new interface is still under development and not yet available.

***

### **What to Expect**

By enabling the beta, your **live environment** has been switched to the new interface and its features.

* **Irreversible Change**: Rolling back requires a full restore from the backup you created prior to enabling the beta.
* **Exclusively for Hosted Users**: The beta program is currently available only for **hosted CIPP sponsors**. Self-hosted availability will be announced at a later date.

***

### **Next Steps**

1. **Explore the New Interface**:
   * Familiarize yourself with the updated navigation, new features, and performance improvements.
2. **Share Your Feedback**:
   * Jump into the [**#new-ui-beta**](https://discord.com/channels/905453405936447518/1318251404846043176) Discord channel to:
     * Share what you love and what you’d like improved.
     * Report issues or quirks you encounter.
     * Collaborate with fellow beta testers for insights and ideas.
3. **Monitor Known Issues**:
   * Stay updated on common quirks and fixes reported in the beta channel.



***

### **Known Issues and Workarounds**

Below is a list of identified issues and their current status as reported in Discord. Follow up there with any questions or for further discussion on any issues.

***

1. **Error:** `"(intermediate value).some is not a function"`
   * **Scenario 1: Standards Migration Dropdown Error**
     * **Cause**: During migration, if only one **Action** was selected, it was saved as an object instead of an array.
     * **Status**: A fix has been applied to enforce the correct format during migration. This issue should no longer occur. If you still encounter this, report it in Discord.
   * **Scenario 2: Offboarding Wizard Dropdown Error**
     * **Cause**: Old user defaults (e.g., saved users) conflict with the new version.
     * **Workaround**:
       1. Go to **Profile → Settings**.
       2. Refresh the page, toggle any checkbox, and save.
       3. Refresh the entire page again.
       4. If the issue persists, **clear cookies and local storage** to reset settings.
2. **Dashboard Error:** Partner Tenant Issues
   * **Issue**: Selecting the **partner tenant** or viewing dashboards with all tenants causes 500 errors.
   * **Status**: Being investigated. If you encounter this, report it in Discord.

#### **General Advice**

* Clear cookies and local storage to resolve lingering UI conflicts.
* Report unresolved issues with detailed steps, screenshots, and error messages in the [**#new-ui-beta**](https://discord.com/channels/905453405936447518/1318251404846043176) Discord channel.

***

### **Thank You for Being Part of the Beta!**

Your collaboration and feedback are invaluable in helping us make CIPP even better. If you encounter unexpected issues, stay calm and leverage the backup and rollback process outlined above.

We look forward to hearing your thoughts and seeing the new interface in action!
