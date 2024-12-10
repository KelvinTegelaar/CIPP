---
hidden: true
---

# CIPP New Interface Kickoff: Alpha Brief

Thank you for testing our new front end! Since most of you already have a working development environment for the current setup, transitioning to the new interface should be relatively seamless with some adjustments. Let’s dive into what you need to know.&#x20;

## Overview&#x20;

The new front-end rewrite, built with [Material UI](https://mui.com/material-ui/getting-started/) and React, introduces significant enhancements in design, performance, and usability. This alpha testing phase focuses on familiarizing yourself with the new UI navigation, exploring changes and identifying standout issues or features, with detailed bug reporting deferred to later phases.&#x20;

## What’s New?&#x20;

1. Modernized Framework: Uses Material UI for a cleaner, more consistent design.&#x20;
2. Performance Improvements: Faster load times locally and online.&#x20;
3. Updated Development Workflow: Minor changes to setup and dependencies.&#x20;

## Key Changes&#x20;

#### 1. Framework and Tooling&#x20;

* Old Frontend: Built with Vite and CoreUI.&#x20;
* New Frontend: Migrates to Next.js and Material-UI.&#x20;
* State Management: Introduces React Query for server-side state.&#x20;

#### 2. Package Manager&#x20;

* Switch from npm to Yarn for dependency management. Yarn ensures consistent installs and faster builds.&#x20;

#### 3. Routing&#x20;

* Old: react-router-dom for client-side routing.&#x20;
* New: Next.js file-based routing, simplifying the creation of pages.&#x20;

## Known Issues&#x20;

1. Tooltips and Sorting:  UI quirks like misplaced tooltips or inconsistent sorting behavior.&#x20;
2. Customizable Filters:  Planned for future iterations.&#x20;
3. AAD Login Redirect: Temporarily disabled for easier debugging during development.&#x20;

## Next Steps&#x20;

1. Set Up Your Environment: &#x20;
2. Follow the instructions in the "Transition from Current Development Environment" section.&#x20;
3. Explore the Interface: &#x20;
4. Note differences from the current setup.&#x20;
5. Focus on navigation, new features, and overall usability.&#x20;
6. Engage in Discussions: &#x20;
7. Use the #cipp-dev channel to share observations or ask questions.&#x20;
8. Avoid focusing on detailed bug fixes for now.&#x20;

## Transition from Current Development Environment&#x20;

#### Step 1: Switch Branches&#x20;

* Change both your frontend and backend repositories to the interface-rewrite branch.&#x20;
* Run git pull to ensure you’re on the latest commit.&#x20;

#### Step 2: Reinstall Dependencies&#x20;

* When switching to the new interface, to ensure compatibility, run:&#x20;
* yarn install&#x20;
* If switching back to the old frontend, run:&#x20;
* npm install&#x20;

#### Step 3: Launch the Environment&#x20;

To start the new CIPP frontend and API, use the Launch in Windows Terminal shortcut from the VSCode debug menu.&#x20;

1. Open the CIPP project in Visual Studio Code.&#x20;
2. Go to the Run and Debug tab (Ctrl+Shift+D or the play icon in the sidebar).&#x20;
3. Select the task Launch in Windows Terminal from the dropdown menu.&#x20;
4. Click the green Start Debugging button or press F5.&#x20;

**What it does:** This task runs both the frontend and API in a separate Windows Terminal instance, avoiding the potential performance issues caused by running both within VSCode itself.&#x20;

## New Setup for Local Development&#x20;

### Prerequisites&#x20;

Install the following tools:&#x20;

* V**SCode:** winget install --exact vscode&#x20;
* **VSCode Extensions:** ESLint, Prettier, Stylelint, Azure Functions, npm Intellisense.&#x20;
* **Node.js v18.x LTS:** winget install --exact OpenJS.NodeJS.LTS --version 18.20.4&#x20;
* **Yarn:** npm install -g yarn&#x20;
* **Azure Static Web Apps CLI:** npm install --global @azure/static-web-apps-cli&#x20;
* **Azurite:** npm install --global azurite&#x20;
* **Azure Functions Core Tools:** npm install --global azure-functions-core-tools@4 --unsafe-perms true&#x20;

We appreciate your collaboration and look forward to your feedback. Happy testing! 😊&#x20;
