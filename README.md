# Getting Started with the SnaprKit HTML App

## Contents

- Overview

- Other Docs
  * API Docs
  * JS → Native Overview

- Key Libraries
 * jQuery Mobile
 * Backbone.js
 * Require.js
 * Less CSS

- Other Libraries
 * Underscore.js
 * Photoswipe.js
 * iScroll 4
 * Google Maps

- Creating an OAuth Client

- Setup / Config
 * Add app group
 * Add client / secret
 * Environments
 * Other config

- Browser testing

- Styling the App

- Editing the App
 * Adding and Removing Views
 * Hash-URL Routing
 * initial_view
 * Overriding Templates
 * Overriding Views
 * Overriding Urls
 * Extra Options
 * Adding new page views

- Deploying SnaprKit
 * Mobile Web 
 * Publish as a Native App
 * Include SnaprKit in an existing app



## Overview

The core of the SnaprKit app is contained within the `app` folder. You should not edit these files except to apply updates to SnaprKit.

Customize SnaprKit by editing the files within the `theme` folder.

The `theme` folder contains your app config, custom CSS, fonts, graphics sprites, language files, and can also contain customized versions of the core HTML templates and extensions to the core Javascript.

The `index.html` file in the root directory includes only the most basic setup for your project - the name of your active theme, and a link to your themes compiled css.



## Other Docs

### API Docs

[Documentation for the Snapr API](http://developers.sna.pr/docs/)

### JS → Native Overview

The SnaprKit HTML app can be published within SnaprKit wrapper apps for iOS and Android.

Documentation for how native behaviors such as the camera and upload queue are handled can be found in the `docs` folder for this app - `docs/js-native.md`.



## Key Libraries

You should familiarize yourself with these projects before editing styles or templates:

- *jQuery Mobile* - The app uses [jQuery Mobile](http://jquerymobile.com/) as a UI framework.

- *Less CSS* - The theme for the app is written using [Less CSS](http://lesscss.org/). We recommend using an app/script to compile your styles as you work( such as [less](http://incident57.com/less/) ).

Familiarize yourself with these projects before customizing JavaScript:

- *Backbone.js* - [backbone.js](http://documentcloud.github.com/backbone/) is used for #hash url navigation and data handling.

- *Require.js* - [require.js](http://requirejs.org/) is used to load necessary Javscript in a modular fashion.



## Other Libraries

These libraries are also used in the project, here are the links if you need to look them up:

- *Underscore.js* - [underscore.js](http://documentcloud.github.com/underscore/) is used for templating, required by backbone.js.

- *Photoswipe.js* - [photoswipe.js](http://www.photoswipe.com/) is used for native feeling photo galleries.

- *iScroll 4* - [iscroll.js](http://cubiq.org/iscroll-4) is used for horizontal scrolling on some views.

- *Google Maps* - [JS API](https://developers.google.com/maps/documentation/)



## Creating an OAuth Client

Register your app via the [Snapr Developer Portal](http://developers.sna.pr/)

Login to the portal using a Snapr account created via [our website](http://sna.pr/join-snapr/)

When you register your app you will be given an OAuth Client / Secret, and you will also create an ‘App Group’ for your app.



## Setup / Config

Your theme has a `config.js` file where you can customize basic settings.


### App Group

In your theme's `config.js` file you can add your `app_group`. This will be sent with all API calls so that data returned is relative to your app.

### Client / Secret

You should also be sure to add the correct client / secret for your app.

// JAKE - if deploying on mob web do we need to try and hide these?

### Environments

You can optionally set up details for different server environments to test against so you can easily switch between staging and live environments during testing.

** Beta Users Note ** Snapr's staging server is not currently live. You can create clients on our development server and test against this at your own risk - it sometimes has new features, or may be broken.

// JAKE - document environments settings

### Other Config

// JAKE lets shuffle the order of these config items and doccument them with comments



## Browser Testing

You can do the bulk of your development in any webkit browser - we recommend Chrome or Safari.

- Run the app in an environment that performs like a web server. A quick way to do this is to navigate to the directory where the project is located via terminal (`cd /Users/username/folder/project`) and run `python -m SimpleHTTPServer` to serve it up at [http://localhost:8000](http://localhost:8000)
- To view the project from other devices on your network find your IP address in the Network pane of System Preferences and direct your device to `http://(ip):8000`

- Alternatively you can use the 'Sites' folder on mac. ([Instructions for Mountain Lion](http://reviews.cnet.com/8301-13727_7-57481978-263/how-to-enable-web-sharing-in-os-x-mountain-lion/)).

- No other local development setup is necessary since the project will interact with a web based API.

- Append `#/?browser_testing=true` to the url when you first load the page if testing in a desktop browser (hit refresh after loading the URL). This will add a class to the `<body>` and set a flag in local storage so that the project will limited to a 320px wide section of your screen.

- Note that the app uses a slightly different upload flow on desktop vs mobile web, allow time to test your code within the native wrappers if you edit things in this area.






## Styling the App

//ROWAN to edit

The most simple way to customize the SnaprKit app is to find a theme close to your needs, and edit the graphics sprites and css.

Basic layout and functional styles are included in `app/css` - you should *not* edit these.

Instead you should edit the styles in your theme folder, and extend / override styles in the `app/css` folder as needed.

Your theme needs only one css file, but you will see that many SnaprKit themes are compiled from multiple less files into a single theme.css file.


- *main.less* - See this file for a breakdown of the different style sheets and their uses. Always compile your less from this file only `/theme/<name>/css/main.less`

- *variables.less* - Many of the key UI aspects are defined in a single variables file `/theme/<name>/css/variables.less`

    Here you can edit things such as colors, fonts, font sizes, borders, page margins, etc and the changes will flow through the whole app.

    This file should be your first port of call for customization

- *Graphics Sprites* - PSD files for the sprites used in the app are supplied @2x resolution. To accommodate different device screen pixel densities you should export three versions of each file.

    * Standard : @1x pixel density, 50% size of @2x version. Lives in `/theme/<name>/gfx/` (For iPhone 3 and MDPI android devices)
    * HDPI : @1.5x pixel density, 75% size of @2x version. Lives in `/theme/<name>/gfx/hdpi/` (For HDPI Android devices)
    * Retina : @2x pixeldensity, 100% size of @2x version. Lives in `/theme/<name>/gfx/retina/` (for iPhone 4 and XHDPI Android devices)

- *sprites.less* - Layout data for all the graphics sprites used in the app is set up via sprites.less. The aim of this is to take the pain out of calculating background positioning for large sprites, and to make it easier to edit sprites and have the changes update globally.

    Be sure to change the width and height variables if you edit the size of the graphics as these will be used to size the sprites for devices with different pixel density (match @1x pixel res version).

- *jquerymobile.theme.less* - Tweaks to the jQuery mobile structure and basic jQuery mobile theme elements.

- *jquerymobile.swatches.less* - jQuery mobile theme swatches are defined in here.

    Note that the normal jQuery mobile theme css has been replaced completely with this less css version.



## Editing the App

All the base templates and javascript code for the app is located in the *app* directory. You should not need to edit these as they can be overridden via theme configuration.


### Hash-URL Routing

[Backbone.js](http://documentcloud.github.com/backbone/) is used to manage the #hash navigation system for the app.

The routes are defined in the `pages` array in your theme's config as below.

Imagine an app which had just three views, `home`, `popular`, and `feed`. These views could be loaded with the url hashes `#/home/`, `#/popular/`, and `#/feed/`.

//JAKE - lets amend this to include the fact we have lots of views added by default ? //

The pages config for this app would look like so:

    pages: [
        'home',
        'popular',
        'feed'
    ]


The strings in this pages array are shorthand for full view config objects. `'my-account'` is shorthand for:

    {
        name: 'my-account',
        view: 'my_account',
        template: 'my_account',
        extra: {}
    }

These options can be used to customize views further, see below for more.

For more info on Backbone routing see [the documentation](http://documentcloud.github.com/backbone/#Router).

### initial_view

Any url that is not recognized including the root url (`/#`) will show the view specified by `initial_view` in your theme's config. This defaults to `home`.

The `initial_view` is also the view that will show by default when people launch the app.

### Overriding Templates

If you need to change the html of a view you can do so by specifying the `template` key in the page config.

For example if you wanted to override the `popular` template you'd use this configuration:

    pages: [
        'home',
        {
            name: 'popular',
            template: theme_templates_path + 'popular'
        },
        'feed'
    ]

Then copy `app/templates/popular.html` to `theme/my-theme/templates/popular.html` and edit it.

### Overriding Views

If you need to change the javascript of a view you can do so by specifying the `view` key in the page config.

For example if you wanted to override the action of clicking a username in the feed you'd use this configuration:

    pages: [
        'home',
        'popular',
        {
            name: 'feed',
            view: theme_views_path + 'feed'
        }
    ]

`theme/my-theme/views/feed.js` should be similar to:

    define(['views/feed'], function(base_feed){
        return base_feed.extend({
            show_user: function(e){

                // custom actions

                e.preventDefault();
            }
        });
    });

Note that the default view is extended and only the required method is overridden, there is no need to copy the whole javascript file into your theme.

#### Overriding Urls

If you need to change the javascript of a view you can do so by specifying the `name` key in the page config.

For example if you wanted to show `popular` at `#/awesome/` you'd use this configuration:

    pages: [
        'home',
        {
            name: 'awesome',
            view: 'popular'
        },
        'feed'
    ]

### Extra Options

Some views allow extra options to customize them. This can be used to customize some aspects of a view without overriding it's javascript or to split a view and use a variation of it at two different urls.

For example you can remove competition streams from the dash and create a new dash just for them like this:

    pages: [
        'home',
        {
            name: 'dash',
            extra: {show: ['user-streams', 'featured-streams', 'tumblr']}
        },
        {
            name: 'comp-dash',
            view: 'dash',
            extra: {show: ['comps']}
        }
    }

### Adding new page views

In short there are 3 things needed to add a page:

1. Create themes/my-theme/templates/my-view.html
2. Create themes/my-theme/views/my-view.js
3. Add `my-view` to the pages array in your theme's config.js

We are using a combination of [Backbone.js](http://documentcloud.github.com/backbone/) and [jQuery Mobile](http://jquerymobile.com/) to handle views.

Backbone provides a set of functions for creating/displaying/manipulating "views" which may have any HTML element as their content.

jQuery Mobile provides a set of widget styling and functions for showing/hiding/transitioning between specially marked-up HTML div elements as full-screen views in an app-like manner.

In our combination of the two libraries we follow a common pattern for adding new page views:

1. Each page has a single HTML element defined in `app/views/<name>.html` with a `data-role` attribute set to either `"page"` or `"dialog"` Eg:

            <div id="profile" data-role="page">
                <div data-role="header">
                    <h1>Profile</h1>
                </div>
                <div data-role="content">
                    <p>Page content goes here...</p>
                </div>
            </div>

*   See the [jQuery page anatomy documentation](http://jquerymobile.com/demos/1.0.1/docs/pages/page-anatomy.html) for more info on the markup used.

2.  The page content may be included in the HTML above for static content, or generated dynamically via a template. We use the lightweight  [Underscore templating](http://documentcloud.github.com/underscore/#template) system which is included in Backbone to render dynamic content. Underscore templates allow you to use standard JavaScript markup wrapped in `<% %>` symbols and let you print variables as string literals with `<%= variable_name %>` Eg:

            <% if (username) {%>
                <h1>Hello <%= username %>!</h1>
            <%}else{%>
                <h1>Hello stranger!</h1>
            <%}%>

3.  To manage the showing/hiding and dynamic generation of page content, each page view has a [Backbone view](http://documentcloud.github.com/backbone/#View) defined, which lives in `app/views/<name>.js`. These view files can be  extended to do all sorts of things, but they all share a number of common basic methods. You can read more about how they work in the [Backbone documentation](http://documentcloud.github.com/backbone/#View).

*   In the Snapr app, we define `initialize` and `activate` methods in a base page view. Individual views use `post_initialize` and `post_activate` to perform their specific actions after the generic ones have run.
    * `initialize` Runs only the first time the view is shown and sets up the view. It loads the template and creats the page element from it, it also sets up the 'back' button system.
    * `post_initialize` does not need to do anything specific but is the best place for views to perform setup actions like creating needed collections and models.
    * `activate` Runs every time the view is shown, including the first time. It handles the options passed in via the query string and shows/hides the tab bar, among other things.
    * `post_activate` must call `change_page` to show the page when it is ready. First it is usually used to handle actions like rendering data into the template.

*   If the page only displays static content you don't need to define any methods, however in this example we would like to use the template defined above to render different content depending on whether a `username` parameter is passed in to the view.


## Deploying SnaprKit 

### Mobile Web 

Upload the full SnaprKit project to your webserver.


### Building the native versions of the App

The SnaprKit HTML app can be added to Snapr’s wrapper apps for iOS and Android

The html code is set up to work differently when run in 'appmode'.

Custom URLs (snapr://) are used to launch native views such as the device camera. These URLs are also used to request data from the native wrapper (such as location data).

These interfaces are documented separately.


### Including SnaprKit in an existing App

The SnaprKit modules for iOS and Android can be included as components for an existing app.

Data is passed to the parent app via snaprkit-parent:// urls.

See separate documentation included with the SnaprKit Libraries for iOS / Android.

