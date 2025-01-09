---
description: Performs administrative tasks to maintain the CIPP function app.
---

# Maintenance

View diagnostic information about the background tasks in CIPP, also known as [Durable Functions](https://learn.microsoft.com/en-us/azure/azure-functions/durable/durable-functions-overview).

### Troubleshooting

This section allows for clearing the Durable Queues or purging all Orchestrator history. If you are experiencing performance issues, it's possible that the function app was upgraded or restarted while a durable function was executing. This can cause the function to loop indefinitely. It's recommended to clear the durable queue following the restart. See below for details about each action.

* Clear Durable Queues
  * This action will loop through each Azure Queue and clear all of the pending messages. Orchestrators that are listed as running will be changed to Failed to prevent re-execution.
* Purge Orchestrators
  * This action will drop both the Instances and History tables as well as the largemessages blob container from Azure storage.

***

### Feature Requests / Ideas

We value your feedback and ideas. Please raise any [feature requests](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=\&labels=enhancement%2Cno-priority\&projects=\&template=feature.yml\&title=%5BFeature+Request%5D%3A+) on GitHub.
