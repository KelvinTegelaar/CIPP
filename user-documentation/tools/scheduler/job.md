# Add Task

{% stepper %}
{% step %}
### Select a tenant

Use the tenant drop down to select the tenant you wish to run this job against.
{% endstep %}

{% step %}
### Set task name

Enter the name of the task
{% endstep %}

{% step %}
### Configure Post Execution Actions

Select how you would like to be notified once the task has completed, if any
{% endstep %}

{% step %}
### Scheduled Task vs Triggered Task

Select if this is a scheduled task or a triggered task

#### Scheduled Task Settings

* Select start date
* Select recurrence

#### Triggered Task Settings

* Select trigger type
* Based on trigger type selection there will be additional options to fill in
{% endstep %}

{% step %}
### Select Command

Select the task command from the available drop down
{% endstep %}

{% step %}
### Enter Parameters

Depending on the chosen command, various parameter fields will appear if they are required for the command.

{% hint style="info" %}
Optionally, you can toggle on `Advanced Parameters (JSON Input)` which will allow you greater control over the structure of the parameters sent with the command.
{% endhint %}
{% endstep %}

{% step %}
### Save

Click `Add Schedule` button.
{% endstep %}
{% endstepper %}
