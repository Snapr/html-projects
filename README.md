Getting Started with the SnaprKit HTML 5 App
============================================


Browser Testing
---------------

You can do the bulk of your development in any webkit browser - we recommend Chrome or Safari.

- Run the app in an environment that performs like a web server. A quick way to do this is to navigate to the directory where the project is located via terminal (`cd /Users/username/folder/project`) and run `python -m SimpleHTTPServer` to serve it up at [http://localhost:8000](http://localhost:8000)
- To view the project from other devices on your network find your IP address in the Network pane of System Preferences and direct your device to `http://(ip):8000`

- Alternatively you can use the 'Sites' folder on mac. ([Instructions for Mountain Lion](http://reviews.cnet.com/8301-13727_7-57481978-263/how-to-enable-web-sharing-in-os-x-mountain-lion/)).

- No other local development setup is necessary since the project will interact with a web based API.

- Append `#/?browser_testing=true` to the url when you first load the page if testing in a desktop browser (hit refresh after loading the URL). This will add a class to the `<body>` and set a flag in local storage so that the project will limited to a 320px wide section of your screen.

- Note that the app uses a slightly different upload flow on desktop vs mobile web.


Key Libraries
-------------

You should familiarize yourself with these projects before starting work:

- *jQuery Mobile* - The app uses the [jQuery mobile framework](http://jquerymobile.com/) for base styling, widgets and cross-device normalization.

- *Backbone.js* - [backbone.js](http://documentcloud.github.com/backbone/) is used for #hash url navigation and data handling.

- *Require.js* - [require.js](http://requirejs.org/) is a modular script loading package used to improve the performance of the app as it scales.

- *Less CSS* - The theme for the app is written using [Less CSS](http://lesscss.org/). We recommend using an app/script to compile your styles as you work( such as [less](http://incident57.com/less/) ).


Other Libraries
---------------

These libraries are also used in the project, here are the links if you need to look them up:

- *Underscore.js* - [underscore.js](http://documentcloud.github.com/underscore/) is used for templating, required by backbone.js.

- *Photoswipe.js* - [photoswipe.js](http://www.photoswipe.com/) is used for native feeling photo galleries.

- *iScroll 4* - [iscroll.js](http://cubiq.org/iscroll-4) is used for horizontal scrolling on some views.

- *Google Maps* - [JS API](https://developers.google.com/maps/documentation/)


Styling the App
---------------

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


Editing the App
---------------

All the base tempaltes and javascipt code for the app is located in the *app* directory. You should not need to edit these as they can be overriden via theme configuration.

Creating an OAuth Client
------------------------

Register your app via our [developer portal](http://developers.sna.pr/)

The portal is still pre-release so you will need to enter a username / pw the first time you visit: snapr / advance

Login to the portal using a Snapr account created via [our website](http://sna.pr/join-snapr/)

Note that for now all development and testing should take place in our staging environment.

Setting the OAuth details and App Group for your app

When you register your app you will be given an OAuth Client / Secret, and you will also create an ‘App Group’ for your app.

By sending app_group=yourapp with any API call you tell the API to return data relative to your app and its users.

At the top of snapr.js (app/snapr.js) you can enter your client, secret, and app_group.

Once you do this all calls will automatically send your app_group and data will be specific to your app.

Note that you can have different groups of settings for ‘dev’, ‘live’ and ‘default’.

When publishing for iOS and Android the parent app will set environment=live || environment=dev to the URL when it loads your project in order to easily toggle which server environment you are working off.


Adding and Removing Views
=========================

Hash-URL Routing
----------------

[Backbone.js](http://documentcloud.github.com/backbone/) is used to manage the #hash navigation system for the app.

The routes are defined in the `pages` array in your theme's config as below.

Imagine an app which had just three views, `home`, `popular`, and `feed`. These views could be loaded with the url hashes `#/home/`, `#/popular/`, and `#/feed/`.

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

initial_view
------------

Any url that is not recognised including the root url (`\#`) will show the view specified by `initial_view` in your theme's config. This defaults to `home

Overiding Templates
-------------------

If you need to change the html of a view you can do so by specifing the `template` key in the page config.

For example if you wanted to override the `popular` template you'd use this configuration:

    pages: [
        'home',
        {
            name: 'popular',
            template: theme_templates + 'popular'
        },
        'feed'
    ]

Then copy `app/templates/popular.html` to `theme/my-theme/templates/popular.html` and edit it.

Overriding Views
----------------

If you need to change the javascript of a view you can do so by specifing the `view` key in the page config.

For example if you wanted to override the action of clicking a username in the feed you'd use this configuration:

    pages: [
        'home',
        'popular',
        {
            name: 'feed',
            view: theme_views + 'feed'
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

Note that the default view is extended and only the required method is overriden, there is no need to copy the whole javascript file into your theme.

Overriding Urls
---------------

If you need to change the javascript of a view you can do so by specifing the `name` key in the page config.

For example if you wanted to show `popular` at `#\awesome\` you'd use this configuration:

    pages: [
        'home',
        {
            name: 'awesome',
            view: 'popular'
        },
        'feed'
    ]

Extra Options
-------------

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

Adding new page views
---------------------

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
    * `initialize` Runs only the first time the view is shown and sets up the view. It loads the template and created the page element from it, it also sets up the 'back' button system.
    * `post_initialize` does not need to do anything specific but is the best place for views to perform setup actions like creating needed collections and models.
    * `activate` Runs every time the view is shown, including the first time. It handles the options passed in via the query string and shows/hides the tab bar, amoung other things.
    * `post_activate` must call `change_page` to show the page when it is ready. First it is usually used to handle actions like rendering data into the template.

*   If the page only displays static content you don't need to define any methods, however in this example we would like to use the template defined above to render different content depending on whether a `username` parameter is passed in to the view.


Building the native versions of the App
=======================================

The SnaprKit HTML app can be added to Snapr’s wrapper apps for iOS and Android

The html code is set up to work differently when run in 'appmode'.

Custom URLs (snapr://) are used to launch native views such as the device camera. These URLs are also used to request data from the native wrapper (such as location data).

These interfaces are documented separately.


Including SnaprKit in an existing App
=====================================

The SnaprKit modules for iOS and Android can be included as components for an existing app.

Data is passed to the parent app via snaprkit-parent:// urls.

See separate documentation included with the SnaprKit Libraries for iOS / Android.

