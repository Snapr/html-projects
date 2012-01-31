Snapr Mobile App
================

Kitchen sink edition.
---------------------

Featuring:
* jQuery Mobile widgets and framework
* Backbone.js structure, routing and events


Hash-URL Routing
----------------

[Backbone.js](http://documentcloud.github.com/backbone/) is used to manage the #hash navigation system for the app.

The routes are defined in the main `app/snapr.js` file as below.

Imagine an app which had just three views, `popular`, `feed`, and `home`. These views could be loaded with the url hashes `#/popular/`, `#/feed/`, and `#/` or `*anything-else` (we'd use *anything-else as a catch-all).

The router for this app would look like so:

    snapr.routers = Backbone.Router.extend({
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
    });

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
