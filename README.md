Getting Started with the SnaprKit HTML 5 App
============================================


Browser Testing
---------------

You can do the bulk of your development in any webkit browser - we recommend Chrome or Safari.

- Run the app in an environment that performs like a web server such as the 'Sites' folder on mac. 
- If you enable web sharing you can access this page at your computers IP i.e. `http://(your ip)/~username/` and test from your mobile device.

- Alternatively you can navigate to the directory where the project is located via terminal and run `python -m SimpleHTTPServer` to serve it up at `http://(your ip):8000`

- No other local development setup is necessary since the project will interact with a web based API.

- Append `#/?browser_testing=true` to the url when you first load the page if testing in a desktop browser. This will add a class to the `<body>` and set a flag in local storage so that the project will limited to a 320px wide section of your screen. 

- Note that the app uses a slightly different upload flow on desktop/mobile web.


Key Libraries
-------------

You should familiarize yourself with these projects before starting work:

- *jQuery Mobile* - The app primarily uses the [jQuery mobile framework](http://jquerymobile.com/)

- *Backbone.js* - [backbone.js](http://documentcloud.github.com/backbone/) is used for #hash url navigation and data handling (In combination with jQuery mobile page transitions).

- *Less CSS* - The theme for the app is written using [Less CSS](http://lesscss.org/). We recommend using an app/script to compile your styles as you work( such as http://incident57.com/less/ ). 


Other Libraries
---------------

These libraries are also used in the project, here are the links if you need to look them up:

- *Underscore.js* - [underscore.js](http://documentcloud.github.com/underscore/) is used for templating.

- *Photoswipe.js* - [photoswipe.js](http://www.photoswipe.com/) is used for native feeling photo galleries.

- *iScroll 4* - [iscroll.js](http://cubiq.org/iscroll-4) is used for horizontal scrolling on some views.

- *Google Maps* - (https://developers.google.com/maps/documentation/)


Styling the App
---------------

- *main.less* - See this file for a breakdown of the different style sheets and their uses. Always compile your less from this file only (`/theme/<name>/css/main.less`)
    
- *variables.less* - Many of the key UI aspects are defined in a single variables file (`/theme/<name>/css/variables.less`)

    Here you can edit things such as colors, fonts, font sizes, borders, page margins, etc and the changes will flow through the whole app.

    This file should be your first port of call for customization

- *Graphics Sprites* - PSD files for the sprites used in the app are supplied @2x resolution. To accommodate different device screen pixel densities you should export three versions of each file. 

    * Standard : @1x pixel density, 50% size of @2x version. Lives in `/theme/<name>/gfx/` (For iPhone 3 and MDPI android devices)
    * HDPI : @1.5x pixel density, 75% size of @2x version. Lives in `/theme/<name>/gfx/hdpi/` (For HDPI Android devices)
    * Retina : @2x pixeldensity, 100% size of @2x version. Lives in `/theme/<name>/gfx/retina/` (for iPhone 4 and XHDPI Android devices)

- *sprites.less* - Layout data for all the graphics sprites used in the app is set up via sprites.less. The aim of this is to take the pain out of calculating background positioning for large sprites, and to make it easier to edit sprites and have the changes update globally.

    Be sure to change the width and height variables if you edit the size of the graphics as these will be used to size the sprites for devices with different pixel density (match @1x pixel res version).

- *jquerymobile.theme.less* - Tweaks to the jQuery mobile structure and basic jQuery mobile theme elements. 

- *jquerymobile.swatches.less* - jQuery mobile theme swatches are defined in here. Note that the normal jQuery mobile theme css has been replaced completely with this less css version.


Editing the App
---------------

All the HTML for pages / views within the app is included in index.html. The different pages are contained within divs with `data-role="page"`, pages with dynamic content have javascript templated elements.

The javascript for each page is in its own file, i.e. feed.js (/app/views/feed.js)

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

The routes are defined in the main `app/snapr.js` file as below.

Imagine an app which had just three views, `popular`, `feed`, and `home`. These views could be loaded with the url hashes `#/popular/`, `#/feed/`, and `*anything-else` (we'd use *anything-else as a catch-all).

The router for this app would look like so:

    snapr.routers = Backbone.Router.extend({
        routes: {
            "feed/": "feed",
            "feed/?*query_string": "feed",
            "popular/": "popular",
            "feed/?*query_string": "popular",
            "?*query_string": "home",
            "*path": "home"
        },
        feed: function( query_string )
        {
            // function which loads view
            var query = snapr.utils.get_query_params( query_string );
            snapr.info.current_view = new snapr.views.feed({
                query: query,
                el: $("#feed")
            });
        },
        popular: function( query_string )
        {
            // function which loads view
            // ...
        },
        home: function( query_string)
        {
            // function which loads view
            // ...
        }
    });

You will see above that in the `routes:` section we have actually defined two routes for each of the views.

We have base hash `"/feed/"`, and a second hash `"/feed/?*query_string"` that takes a query_string from the hash fragment and passes it to the view. This lets us pass in parameters like "`appmode=iphone`" to any view, or parameters like `"username=rowan"` which can be accessed by the view.

These routes tell Backbone which function to call the url hash changes to a particular pattern. The second part refers to the function name.

If we take `feed` as an example, the function takes the `query_string` which has been passed to it, and uses the `snapr.utils.get_query_params` function to interpret any globally useful parameters like `appmode` and `access_token`, and return a hash of parameter pairs (eg. `{username: "rowan"}`) as variable `query`.

Since we will only ever have one page view at a time, the function creates a new view of the type requested and assigns it to `snapr.info.current_view` for easy access.

[For more info on Backbone routing see the documentation here.](http://documentcloud.github.com/backbone/#Router)

Adding new page views
---------------------

We are using a combination of [Backbone.js](http://documentcloud.github.com/backbone/) and [jQuery Mobile](http://jquerymobile.com/) to handle views.

Backbone provides a set of functions for creating/displaying/manipulating "views" which may have any HTML element as their content.

jQuery Mobile provides a set of widget styling and functions for showing/hiding/transitioning between specially marked-up HTML div elements as full-screen views in an app-like manner.

In our combination of the two libraries we follow a common pattern for adding new page views:

1. Each page has a single HTML element defined in `index.html` with a unique id and a `data-role` attribute set to either `"page"` or `"dialog"` Eg:

           <div id="profile" data-role="page">
                <div data-role="header">
                    <h1>Profile</h1>
                </div>
                <div data-role="content">
                    <p>Page content goes here...</p>
                </div>
            </div>

*   See the [jQuery page anatomy documentation](http://jquerymobile.com/demos/1.0.1/docs/pages/page-anatomy.html) for more info on the markup used.

2.  The page content may be included in the HTML above for static content, or generated dynamically via a template. We use the lightweight  [Underscore templating](http://documentcloud.github.com/underscore/#template) system which is included in Backbone to render dynamic content. These templates are included in `index.html` as script tags with unique ids and `type` set to `"text/template"`. Underscore templates allow you to use standard JavaScript markup wrapped in `<% %>` symbols and let you print variables as string literals with `<%= variable_name %>` Eg:

            <script id="profile-template" type="text/template">
                <% if (username) {%>
                    <h1>Hello <%= username %>!</h1>
                <%}else{%>
                    <h1>Hello stranger!</h1>
                <%}%>
            </script>

3.  To manage the showing/hiding and dynamic generation of page content, each page view has a [Backbone view](http://documentcloud.github.com/backbone/#View) defined, which lives in `app/views/` and must be referenced in `index.html`. These view files can be customised and extended to do all sorts of things, but they all share a number of common basic functions. You can read more about how they work in the [Backbone documentation](http://documentcloud.github.com/backbone/#View).

*   In the Snapr app, we define an `initialize` function which (among other things) tells jQuery Mobile to show the HTML div we added above (`id="profile"`) with an optional transition. It is important to set `changeHash` to `false` since we are using Backbone's hash navigation and not jQuery Mobile's.

            hs.views.profile = Backbone.View.extend({
                initialize: function()
                {
                    $.mobile.changePage( $("#profile"), {
                        changeHash: false,
                        transition: "slide"
                    });
                    //...
                },
                // ...
            });

*   If the page only displays static content you don't need to define a new `render` function, however in this example we would like to use the template defined above to render different content depending on whether a `username` parameter is passed in to the view.

*   In this case we need to add to the initialize function to tell it which template markup to use, and to get the `username` if it is passed via the initialization options (see 5. below):

            hs.views.profile = Backbone.View.extend({
                initialize: function()
                {
                    $.mobile.changePage( $("#profile"), {
                        changeHash: false,
                        transition: "slide"
                    });
                    this.template = _.template( $("#profile-template").html() );
                    this.username = this.options.query && this.options.query.username || false;
                },
            });

*   Now that the view has the information needed to render the content, we can add the `render` function to add the dynamic content to the page. The `render` function takes the `this.username` variable and passes it to the template, replacing the current page content (`data-role='content'`) with the template function's output. By calling `this.render()` in the `initialization` function we will render the new page content straight away in this example. Often rendering triggered by a "bound" network event or user interaction.

            hs.views.profile = Backbone.View.extend({
                initialize: function()
                {
                    $.mobile.changePage( $("#profile"), {
                        changeHash: false,
                        transition: "slide"
                    });
                    this.template = _.template( $("#profile-template").html() );
                    this.username = this.options.query && this.options.query.username || false;
                    this.render();
                },
                render: function()
                {
                    $(this.el).find("[data-role='content']").html( this.template({
                        username: this.username
                    }));
                    return this;
                }
            });

*   The `render` function should always return `this`, so we can chain it together with other functions later.


4.  As described above, each page view has a hash url route (or routes) defined and an associated route function. This tells the app to load a particular page in response to a url hash.

*   So if we wanting to show our new `profile` view when the user goes to `index.html#/profile/` or `index.html#/?username=rowan` we would add the following extra lines to `routes:`:

            "/profile/": "profile",
            "/profile/?query_string": "profile"

*   Now that we've directed the routes to the the `profile` function we need to create it.

5.  The `profile` function handles the instantiation of the `hs.view.profile` view, set the div with id `profile` as the view's element and passes in any parameters from the url like so:

        profile: function( query_string )
        {
            // load profile view
            var query = snapr.utils.get_query_params( query_string );
            snapr.info.current_view = new snapr.views.profile({
                query: query,
                el: $("#profile")
            });
        }
        

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

