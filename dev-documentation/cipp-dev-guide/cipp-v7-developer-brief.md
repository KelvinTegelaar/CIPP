# CIPP v7 Developer Brief

If you already have a working development environment for the previous v6 setup, transitioning to the new interface should be relatively seamless with some adjustments. Let’s dive into what you need to know.&#x20;

***

## Overview&#x20;

CIPPs new v7 front-end introduces significant enhancements in design, performance, and usability.

1. **Modernized Framework: B**uilt with [Material UI](https://mui.com/material-ui/getting-started/) and React for a cleaner, more consistent design.&#x20;
2. **Performance Improvements:** Faster load times locally and online.&#x20;
3. **Updated Development Workflow:** Minor changes to setup and dependencies.&#x20;

***

## Key Changes&#x20;

#### 1. Framework and Tooling&#x20;

* **Old pre-v7 Frontend:** Built with Vite and CoreUI.&#x20;
* **New v7 Frontend**: Migrates to Next.js and Material-UI.&#x20;
* **State Management**: Introduces React Query for server-side state.&#x20;

#### 2. Package Manager&#x20;

* Switch from `npm` to `Yarn` for dependency management. Yarn ensures consistent installs and faster builds.&#x20;
* Use `yarn install --network-timeout 500000` to avoid timeout errors when downloading dependencies.

#### 3. Routing&#x20;

* **Old**: Used `react-router-dom` for client-side routing.&#x20;
* **New**: Uses `Next.js` file-based routing, simplifying the creation of pages.&#x20;

***

## **Next Steps**

1. **Set Up Your Environment**:
   * Follow the instructions in the section below.
2. **Explore the Interface**:
   * Note differences from the current setup.
3. **Engage in Discussions**:
   * Join us in the `#cipp-dev` channel to share observations or ask questions.

***

## **Transition from Current Development Environment**

### **Step 1: Check for Merge Conflicts**

Before proceeding with the installation of dependencies, ensure there are no merge conflicts if you are upgrading from an older version of CIPP on your development fork. For more information on this step, refer to the official GitHub documentation on [resolving merge conflicts](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/addressing-merge-conflicts/resolving-a-merge-conflict-on-github). Once everything’s merged cleanly, you’re ready for the rest of the setup.

### **Step 2: Reinstall Dependencies**

For the new interface:

```bash
yarn install --network-timeout 500000
```

### **Step 3: Launch the Environment**

To start the new CIPP frontend and API, use the **Launch in Windows Terminal** shortcut from the VSCode debug menu. This task runs both the frontend and API in a separate Windows Terminal instance, avoiding the potential performance issues caused by running both within VSCode itself.

1. Open the CIPP project in **Visual Studio Code**.
2. Go to the **Run and Debug** tab (`Ctrl+Shift+D` or the play icon in the sidebar).
3. Select the task **Launch in Windows Terminal** from the dropdown menu.
4. Click the green **Start Debugging** button or press `F5`.

**Tip for Linux Users**: If "Launch in Windows Terminal" is unavailable, use your terminal or VSCode's integrated terminal to run the frontend and API.

***

## **New Setup for Local Development**

### **Prerequisites**

Install the following tools:

*   **VSCode**:

    ```bash
    winget install --exact vscode
    ```
* **VSCode Extensions**: ESLint, Prettier, Stylelint, Azure Functions, npm Intellisense.
*   **Node.js v18.x LTS**:

    ```bash
    winget install --exact OpenJS.NodeJS.LTS --version 18.20.4
    ```
*   **Yarn**:

    ```bash
    npm install -g yarn
    ```
*   **Azure Static Web Apps CLI**:

    ```bash
    npm install --global @azure/static-web-apps-cli
    ```
*   **Azurite**:

    ```bash
    npm install --global azurite
    ```
*   **Azure Functions Core Tools**:

    ```bash
    npm install --global azure-functions-core-tools@4 --unsafe-perms true
    ```

## **Tips for Development**

* **GitHub Fork Issues**:
  * Use **`git fetch --all`** or ensure your fork is updated with Kelvin’s repo.
* If you prefer GUI tools, you can use **GitHub Desktop** to manage branches and fetch remotes. Ensure you fetch all remotes to see the latest branches.

## **Known Issues**

* **AAD Login Redirect**: Disabled for debugging.
* **"Launch in Windows Terminal" Compatibility**:
  * **Issue**: Not compatible with **Linux** or **macOS** as it relies on Windows Terminal.
  *   **Workaround**: Use a terminal or VSCode's integrated terminal:

      ```bash
      yarn start
      ```
  * **Linux**: **Kitty** terminal may work but lacks split window/tab features.
* **Prettier Formatting Errors**:
  * **Issue**: Conflicts with `.editorconfig`, causing formatting errors.
  * **Solution**:
    1. Ensure `.editorconfig` enforces:
       * **LF** for frontend files.
       * **CRLF** for backend scripts.
    2.  Set Prettier as default in VSCode:

        ```json
        "editor.defaultFormatter": "esbenp.prettier-vscode"
        ```
    3. Add `.prettierrc.json` file if missing.
* **Dependency Install Times**:
  *   To avoid timeouts, use:

      ```bash
      yarn install --network-timeout 500000
      ```

***

#### **Tips for Linux and MacOS Users**

* **Launching the Environment**:
  *   Start frontend and API manually if unavailable:

      ```bash
      yarn start
      ```
  * Run API in another terminal instance.
* **Linux-Specific Tools**:
  * **Kitty Terminal** can assist but has limitations.

***

We appreciate your collaboration and look forward to your feedback. Happy testing! 😊
