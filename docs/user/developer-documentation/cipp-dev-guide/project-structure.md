# Project Structure

So you've got two repositories now (assuming you followed the setting up guide.) this page looks at what's in the `CIPP` folder so you know where to look when you start coding.

### The Root

In the `CIPP` directory itself there are a number of files and folders, the table below highlights the important ones:

| Item                 | Description                                                                                                    |
| -------------------- | -------------------------------------------------------------------------------------------------------------- |
| `public`             | Holds static files used when compiling CIPP (building) for use. Mostly images and a little `HTML` scaffolding. |
| `src`                | Holds the code that powers CIPP, this is where most CIPP development takes place.                              |
| `package.json`       | An npm package file - this tells npm what other libraries/resources to use when building CIPP.                 |
| `package-lock.json`  | An npm package file - this tells npm exact version numbers/packages to use for repeatable builds.              |
| `version_latest.txt` | Our version file. This gets incremented just before `dev` gets merged into `main` for a new release.           |

### The Source

The table below goes into detail on the contents of the `src` directory:

| Item            | Description                                                                                                |
| --------------- | ---------------------------------------------------------------------------------------------------------- |
| `assets/images` | Holds image files used when building the app.                                                              |
| `components`    | Holds custom [React components](https://reactjs.org/docs/components-and-props.html) used throughout CIPP.  |
| `data`          | Holds static data files used throughout CIPP. At the time of writing the only one is `countryList.json`.   |
| `hooks`         | Holds custom [React hooks](https://reactjs.org/docs/hooks-reference.html) used throughout CIPP.            |
| `layout`        | Holds the main layout file which handles setting up the overall layout of the CIPP user interface.         |
| `scss`          | Holds the [SCSS](https://sass-lang.com/) files which control the look and feel of the CIPP user interface. |
| `store`         | Holds the various API interfaces, app feature functional code and middle-ware to drive CIPP functionality. |
| `views`         | Holds the pages which make up the CIPP user interface.                                                     |

of the remaining files in the `src` directory the following are noteworthy:

| Item             | Description                                                           |
| ---------------- | --------------------------------------------------------------------- |
| `_nav.js`        | Holds the navigation items displayed in the left hand navigation bar. |
| `adminRoutes.js` | Holds information on admin-privileged routes.                         |
| `routes.js`      | Holds information on routes.                                          |
