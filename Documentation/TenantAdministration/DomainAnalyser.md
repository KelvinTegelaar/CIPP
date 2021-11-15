<p align="center"><a href="https://cyberdrain.com" target="_blank" rel="noopener noreferrer"><img src="../assets/img/CyberDrain.png" alt="CyberDrain Logo"></a></p>

# Domain Analyser

The domain analyser is a series of best practice checks that run against all email enabled domains that can been found in your delegated 365 tenants. It analyses the DNS records that are available and assesses SPF, DMARC, DKIM and DNSSEC. Please note - clicking **More** at the end of each row will give you extended information about the problems identified.
## Current known issues / Limitations

You may get odd results if you have different records setup for subdomains. As it stands at the moment you will only get DKIM results where the domains are utilising 365 or Google e-mail.
## How do I get started?

In the left hand menu, navigate to **Tenant Administration > Standards > Domain Analyser**. If this is your first ever run you may see an error initially because there is no data; this is expected.
## How do I refresh or generate the data?

At the top of the page there is button called **Force Refresh All Data**. You only need to click this once.

---

# Interpreting Results
The reporting here generally follows a standard colour theming.
Red is bad and generally not something that should be happening on your tenant.
Orange is either a warning or subjective. It does not necessarily indicate something is wrong.
Green means there are no issues or the setting is set in a manner that is generally agreed as Best Practice.

## Security Score
This is a custom security score with weightings that has been put together to help you determine which domains you should look at first.

## SPF Pass Test
This is looking primarily for two conditions; that you are using the recommended SPF record that Microsoft suggests. It also looks to ensure that your domains are set to hard fail as opposed to soft fail.

## MX Pass Test
This is looking to ensure that your MX record is set correctly based on what Microsoft thinks it should be. Where this is failing you likely have a domain in your 365 tenant that is using e-mail elsewhere, or has a misconfigured MX record.

## DMARC Present
This is the first of a number of tests that we are performing on the DMARC record. First we are making sure one exists; your domains absolutely should have a properly configured DMARC or you are putting this domain at risk of being spoofed.

## DMARC Action Policy
Your DMARC record is only as good as the action set on it. If you have never added a DMARC record before, you'll want to start by creating a record in reporting only, and utilising a service like report-uri.com to assess reports. The ideal setting for this is Reject.

## DMARC % Pass
It is possible to configure your DMARC to only pay attention to a certain percent of mail. This test makes sure it is assessing 100% of it.

## DNSSEC
DNSSEC is the "Domain Name System Security Extensions) and is a feature of DNS that authenticates responses to domain name lookups, prenving attackers from manipulating or poisoning the responses to DNS requests. This test is a simple enable/disable test.

## DKIM Enabled
DKIM (DomainKeys Identified Mail) is an email security standard designed to make sure messages aren't altered in transit between the sending and recipient servers. It uses public-key cryptography to sign email with a private key as it leaves a sending server. This is a simple enabled/disabled test.

# I am having Problems
The adding of this feature requires a new permission granting in your delegated permissions - Domain.Read.All. Please ensure that you have given adequate time for the Domain Analyser to run. In an environment with 100 tenants this takes on average 2 minutes. Please ensure that your permissions are correct by going in to **CIPP Settings > Configuration Settings > Run Permission Check**. Make sure your CIPP-API and CIPP modules are both fully up-to-date. There is extensive logging in the log file in the root of the CIPP-API Function App.

# I have something to add or an idea for Domain Analyser
Excellent! Please add them to the Github Issues as a feature request



