# Mail Test

The Mail Testing Tool is a powerful utility that allows you to read messages in an inbox and extract important information from the headers. It specifically focuses on processing DKIM, DMARC, and SPF results, providing you with valuable insights into the email authentication mechanisms used by the sender.

## Requirements

* The CIPP service account has a mailbox
* The **Mail.Read** Delegated permission has been added to the Microsoft Graph API permissions.

## Usage

1. Send an email to the CIPP Service Account from an external sender (customer, 3rd party mailing service, etc).
2. Wait until the email arrives in the inbox.
3. Click on the details in the table to see email authentication information.

