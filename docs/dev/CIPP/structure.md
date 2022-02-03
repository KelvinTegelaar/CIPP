---
id: structure
title: CIPP UI project structure.
description: An overview of the various files / folders of note in the CIPP UI project.
slug: /cipp/structure
---

So you've got two repositories now (assuming you followed the [setting up](../../settingup/) guide.) let's take a look at what's in the `CIPP` folder so we know where to look once we start coding.

## The Root

In the `CIPP` directory itself we have a number of files and folders, we're going to highlight the important ones here:

| Item               | Description                                                                                                         |
| ------------------ | ------------------------------------------------------------------------------------------------------------------- |
| public             | Holds static files used when CIPP is assembled (built) for use. Mostly images and a little `HTML` scaffolding.      |
| src                | Holds the code that powers CIPP, this is where you'll spend most of your time when developing CIPP.                 |
| package.json       | An npm package file - this tells npm what other libraries/resources we use when developing for CIPP.                |
| package-lock.json  | An npm package file - this tells npm exact version numbers/packages we want installed for repeatable builds.        |
| version_latest.txt | Our version file. This gets incremented just before `dev` is merged into `main` for a new release.                  |

## The Source

We're going to descend into the `src` directory an get an overview of what's in there:

| Item               | Description                                                                                                         |
| ------------------ | ------------------------------------------------------------------------------------------------------------------- |
| assets/images      | Holds image files used when building the app which don't need to be, or can't be static.                            |
| components         | Holds custom [React components](https://reactjs.org/docs/components-and-props.html) used throughout CIPP.           |
| data               | Holds static data files used throughout CIPP. At the time of writing this only contains `countryList.json`.         |
| hooks              | Holds custom [React hooks](https://reactjs.org/docs/hooks-reference.html) used throughout CIPP.                     |
| layout             | Holds the main layout file which handles setting up the overall layout of the CIPP user interface.                  |
| scss               | Holds the [SCSS](https://sass-lang.com/) files which control the look and feel of the CIPP user interface.          |
| store              | Holds the various API interfaces, app feature functional code and middleware to drive CIPP's functionality.         |
| views              | Holds the pages which make up the CIPP user interface.                                                              |

of the remaining files in the `src` directory the following are noteworthy:

| Item               | Description                                                                                                         |
| ------------------ | ------------------------------------------------------------------------------------------------------------------- |
| _nav.js            | Holds the navigation items displayed in the left hand navigation bar.                                               |
| adminRoutes.js     | Holds information on admin-privileged routes.                                                                       |
| routes.js          | Holds information on routes.                                                                                        |
