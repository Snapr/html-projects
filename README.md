Snapr Mobile App
================

Kitchen sink edition.
---------------------

Featuring:
* jQuery Mobile widgets and framework
* Backbone.js structure, routing and events


Routing
-------

[Backbone.js](http://documentcloud.github.com/backbone/) is used to manage the #hash navigation system for the app.

The routes are defined in the main `app/snapr.js` file as below.

Imagine an app which had just three views, `"popular"`, `"feed"`, and `home` which would be loaded with the url hashes `#/popular/`, `#/feed/`, and `*anything-else`.

The router for this app would look like so:

`snapr.routers = Backbone.Router.extend({
    routes: {
        "/feed/": "feed",
        "/feed/?*query_string": "feed",
        "/popular/": "popular",
        "/feed/?*query_string": "popular",
        "/": "home",
        "/?*query_string": "home",
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
});`

You will see above that in the `routes:` section we have actually defined two routes for each of the views.

We have base hash `"/feed/"`, and a second hash `"/feed/?*query_string"` that takes a query_string from the hash fragment and passes it to the view. This lets us pass in parameters like "`appmode=iphone`" to any view, or parameters like `"username=rowan"` which can be accessed by the view.

These routes tell Backbone which function to call the url hash changes to a particular pattern. The second part refers to the function name.

If we take `feed` as an example, the function takes the `query_string` which has been passed to it, and uses the `snapr.utils.get_query_params` function to interpret any globally useful parameters like `appmode` and `access_token`, and return a hash of parameter pairs (eg. {username: "rowan"}) as variable `query`.

Since we will only ever have one page view at a time, the function creates a new view of the type requested and assigns it to `snapr.info.current_view` for easy access.

[For more info on Backbone routing see the documentation here.](http://documentcloud.github.com/backbone/#Router)

Adding new page views
---------------------

We are using a combination of [Backbone.js](http://documentcloud.github.com/backbone/) and [jQuery Mobile](http://jquerymobile.com/) to handle views.

Backbone provides a set of functions for creating/displaying/manipulating "views" which may have any HTML element as their content.

jQuery Mobile provides a set of widget styling and functions for showing/hiding/transitioning between specially marked-up HTML div elements as full-screen views in an app-like manner.

In our combination of the two libraries we follow a common pattern for adding new page views:

1. Each page has a single HTML element defined in `index.html` with a unique id and a `data-role` attribute set to either `"page"` or `"dialog"` Eg:

    *   `<div id="profile" data-role="page">
            <div data-role="header">
                <h1>Profile</h1>
            </div>
            <div data-role="content">
                <p>Page content goes here...</p>
            </div>
        </div>`
    *   See the [jQuery page anatomy documentation](http://jquerymobile.com/demos/1.0.1/docs/pages/page-anatomy.html) for more info on the markup used.

2.  The page content may be included in the HTML above for static content, or generated dynamically via a template. We use the lightweight  [Underscore templating](http://documentcloud.github.com/underscore/#template) system which is included in Backbone to render dynamic content. These templates are included in `index.html` as script tags with unique ids and `type` set to `"text/template"`. Eg:

    *   `<script id="profile-template" type="text/template">
            <% if (username) {%>
                <h1>Hello <%= username %>!</h1>
            <%}else{%>
                <h1>Hello stranger!</h1>
            <%}%>
        </script>`
    *   Underscore templates allow you to use standard JavaScript markup wrapped in `<% %>` symbols and let you print variables as string literals with `<%= variable_name %>`.


3.  To manage the showing/hiding and dynamic generation of page content, each page view has a [Backbone view](http://documentcloud.github.com/backbone/#View) defined, which lives in `app/views/`. These view files can be customised and extended to do all sorts of things, but they all share a number of common basic funcions.

4.  As described above, each page view has a route (or routes) defined and an associated route function.

    *   So if we were wanting to add a `profile` view we would add extra lines to `routes:` with:
        `"/profile/": profile` and `"/profile/?query_string": profile`
    *   We would then define the `profile` function.