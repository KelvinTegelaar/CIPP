
# Beta Testing the New CIPP Interface

To assist users in beta testing the new version of CIPP by tracking the `interface-rewrite` branch for both the `CIPP` and `CIPP-API` repositories, please follow these steps:

## 1. Fork the Repositories (if you don't have one already)

- Navigate to the [CIPP repository](https://github.com/KelvinTegelaar/CIPP) and click the "Fork" button to create your own copy.
- Repeat this process for the [CIPP-API repository](https://github.com/KelvinTegelaar/CIPP-API).

## 2. Add the `interface-rewrite` Branch

- In your forked `CIPP` repository, go to the branches section and create a new branch named `interface-rewrite`.
- Set this branch to track the upstream `interface-rewrite` branch from KelvinTegelaar.
- Repeat these steps for your forked `CIPP-API` repository.

## 3. Update Deployment Workflows

### For the Frontend (`CIPP` Repository)

- In your forked `CIPP` repository, navigate to the `.github/workflows` directory.
- Locate the deployment workflow file (e.g., `deploy.yml`) and edit it to update the push action to target the `interface-rewrite` branch.
- Ensure that the Azure Static Web Apps action is configured to deploy the `out` directory instead of the root.

**Example Workflow Configuration**:

```yaml
name: Azure Static Web Apps CI/CD

on:
  push:
    branches:
      - interface-rewrite

jobs:
  build_and_deploy_job:
    if: github.event_name == 'push' || (github.event_name == 'pull_request' && github.event.action != 'closed')
    runs-on: ubuntu-latest
    name: Build and Deploy Job
    steps:
      - uses: actions/checkout@v2
        with:
          submodules: true
      - name: Build And Deploy
        id: builddeploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }} # Used for GitHub integrations (i.e., PR comments)
          action: "upload"
          app_location: "/" # App source code path
          api_location: "" # Api source code path - optional
          output_location: "/out" # Built app content directory

  close_pull_request_job:
    if: github.event_name == 'pull_request' && github.event.action == 'closed'
    runs-on: ubuntu-latest
    name: Close Pull Request Job
    steps:
      - name: Close Pull Request
        id: closepullrequest
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          action: "close"
```

### For the Backend (`CIPP-API` Repository)

- In your forked `CIPP-API` repository, navigate to the `.github/workflows` directory.
- Locate the deployment workflow file (e.g., `deploy.yml`) and edit it to update the push action to target the `interface-rewrite` branch.
- Ensure that the Azure Functions action is configured correctly for deployment.

**Example Workflow Configuration**:

```yaml
name: Build and deploy PowerShell project to Azure Function App - cippyourinstance

on:
  push:
    branches:
      - interface-rewrite
  workflow_dispatch:

env:
  AZURE_FUNCTIONAPP_PACKAGE_PATH: '.' # Set this to the path to your function app project, defaults to the repository root

jobs:
  deploy:
    runs-on: windows-latest

    steps:
      - name: 'Checkout GitHub Action'
        uses: actions/checkout@v4

      - name: 'Run Azure Functions Action'
        uses: Azure/functions-action@v1
        id: fa
        with:
          app-name: 'cippyourinstance' # Replace with your Azure Function App name
          slot-name: 'Production'
          package: ${{ env.AZURE_FUNCTIONAPP_PACKAGE_PATH }}
          publish-profile: ${{ secrets.AZUREAPPSERVICE_PUBLISHPROFILE }}
```

## 4. Deploy and Test

- After updating the workflows, push the changes to your forked repositories.
- Monitor the deployment process to ensure that the applications are deployed correctly from the `interface-rewrite` branch.
- Begin testing the new interface and functionality as per the beta testing guidelines.

## Additional Resources

- **Community Support**: For further assistance, join the [Discord Server](https://discord.gg/cyberdrain) and check out #cipp-community-help or the #cipp-beta-temp channels.

By following these steps, users can effectively set up their environments to beta test the new version of CIPP with the updated interface.
