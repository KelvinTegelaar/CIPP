# Edit Tenant Group

Tenant groups let you organise your tenants into named collections that can be targeted elsewhere in CIPP. The Edit Tenant Group page is where you create a new group or change an existing one. Every group is one of two types: **Static**, where you choose the member tenants by hand, or **Dynamic**, where membership is resolved automatically from rules you define. The Group Type you select controls which settings appear on the rest of the page.

## Properties

These settings apply to every group, regardless of type.

| Setting           | Description                                                                                                                                  |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Group Name        | The name for the group. Required, and must be at least two characters long.                                                                  |
| Group Description | An optional description recording the purpose of the group.                                                                                  |
| Group Type        | Choose Static to pick member tenants by hand, or Dynamic to build membership from rules. This choice determines which settings appear below. |

## Static Group Members

Shown when Group Type is set to Static.

Select one or more tenants from the picker to make up the group. A static group contains exactly the tenants you choose here and does not change until you edit it.

## Dynamic Group Rules

Shown when Group Type is set to Dynamic. A dynamic group has no fixed member list; instead, CIPP evaluates the rules you define and includes every tenant that matches.

| Setting                                | Description                                                                                                                                                                                                                     |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Exclude Partner Tenant from this group | When enabled, your own partner tenant is kept out of the group even if it would otherwise match the rules.                                                                                                                      |
| Rule Logic                             | Determines how multiple rules combine. AND requires a tenant to match every rule to be included; OR includes a tenant that matches any single rule.                                                                             |
| Rules                                  | Each rule is made up of a Property, an Operator, and a Value. Add as many rules as you need and remove any you no longer want. The operators and the type of value input available change depending on the property you select. |

## Rule Properties

The following properties can be used to build dynamic membership rules. The value input and the operators available depend on the property selected.

| Property                     | Description                                                                                                           | Value Input                                                              | Available Operators                                                                    |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| Available License            | Matches tenants that have the selected license available.                                                             | License dropdown                                                         | Equals, Not Equals, In, Not In                                                         |
| Available Service Plan       | Matches tenants that have the selected service plan available.                                                        | Service plan dropdown                                                    | Equals, Not Equals, In, Not In                                                         |
| Delegated Access Status      | Matches tenants by how you have access to them.                                                                       | Dropdown: Granular Delegated Admin Privileges or Direct Tenant           | Equals, Not Equals                                                                     |
| Member of Tenant Group       | Matches tenants that belong, or do not belong, to another tenant group, letting you compose groups from other groups. | Dropdown of existing tenant groups (dynamic groups are labelled as such) | In, Not In                                                                             |
| Custom Variable              | Matches tenants by the value of a custom variable.                                                                    | Variable Name and Expected Value fields                                  | Equals, Not Equals, Contains, Does Not Contain                                         |
| GDAP Relationship Age (days) | Matches tenants by how many days old their GDAP relationship is.                                                      | Number of days                                                           | Greater Than, Greater Than or Equal, Less Than, Less Than or Equal, Equals, Not Equals |

## How Dynamic Membership Is Evaluated

CIPP re-evaluates dynamic groups on a schedule and updates their membership automatically. When it does:

* Rules are combined using the Rule Logic setting (AND or OR).
* GDAP Relationship Age is measured from the activation date of the tenant's oldest active GDAP relationship, so the age does not reset when a newer or replacement relationship is later accepted. Terminated and expired relationships are ignored. Tenants with no active GDAP relationship are never matched by an age rule, so direct tenants will not fall into a "younger than" group.
* Member of Tenant Group rules are resolved against current group membership, so a group can build on the results of another group.

## Saving

Select Save to write your changes. For a static group this stores the member list you selected; for a dynamic group it stores the rule set and logic, and membership is resolved automatically from that point forward.

***

{% include "../../../../../.gitbook/includes/feature-request.md" %}
