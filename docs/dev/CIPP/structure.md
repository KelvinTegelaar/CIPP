---
id: structure
title: CIPP UI project structure.
description: An overview of the various files / folders of note in the CIPP UI project.
slug: /cipp/structure
---

So you've got two repositories now (assuming you followed the [setting up](../../settingup/) guide.) let's take a look at what's in the `CIPP` folder so we know where to look once we start coding.

## The Root

In the `CIPP` directory itself we have a number of files and folders, we're going to highlight the important ones here:

* **public** holds static files used when CIPP is assembled (built) for use. Mostly images and a little `HTML` scaffolding.
* **src** holds the code that powers CIPP, this is where you'll spend most of your time when developing CIPP.
* **package.json** this is an npm package file - this tells npm what other libraries/resources we use when developing for CIPP.
* **package-lock.json** this is another npm package file this one contains the exact version numbers/packages we want installed for a stable, repeatable build.
* **version_latest.txt** this is our version file. This gets incremented just before `dev` is merged into `main` for a new release.

## The Source

We're going to descend into the `src` directory an get an overview of what's in there:

* **assets/images** holds image files used when building the app which don't need to be, or can't be static.
* **components** holds our custom, and customised [React components](https://reactjs.org/docs/components-and-props.html) used throughout CIPP.
* **data** holds static data files (at the time of writing just `countryList.json` - kinda self-explanatory) used in CIPP.
* **hooks** holds our custom, and customised [React hooks](https://reactjs.org/docs/hooks-intro.html) used throughout CIPP.
* **layout** holds the main layout file that handles setting up the overall layout of the CIPP user interface.
* **scss** holds the [scss](https://sass-lang.com/) files which control the look and feel of the CIPP user interface.
* **store** holds our various API interfaces, app feature functional code and middleware to drive CIPP's functionality.
* **views** holds the pages which make up the CIPP user interface.

of the remaining files in the `src` directory the following are noteworthy:

* **_nav.js** which holds the items for the navigation menu.
* **adminRoutes.js** which holds admin-privileged route definitions.
* **routes.js** which holds the rest of the route definitions.
