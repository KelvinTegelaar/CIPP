# Add Job

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
### Set Start Date

Use the calandar button in the field to select the date and time the task should begin running.
{% endstep %}

{% step %}
### Select Recurrence

Use the dropdown to set the recurrence for the task.
{% endstep %}

{% step %}
### Configure Post Execution Actions

Select how you would like to be notified once the task has completed, if any
{% endstep %}

{% step %}
### Save

Click `Add Schedule` button.
{% endstep %}
{% endstepper %}
