/*global _  define require */
define(['config', 'backbone', 'auth', 'utils/local_storage', 'native', 'utils/alerts', 'utils/query'], function(config, Backbone, auth, local_storage, native, alerts, Query) {

var pages = [
    'home',
    'about',
    'about-snapr',
    'map',
    'app',
    'login',
    'logout',
    'upload',
    'uploading',
    'connect',
    'cities',
    'limbo',
    'feed',
    'dash',
    {
        name: 'zombie-home',
        view: 'dash',
        extra: {show: ['comps', 'tumblr']}
    },
    {
        name: 'feeds',
        view: 'dash',
        extra: {show: ['user-streams', 'featured-streams']}
    },
    'leaderboard',
    'activity',
    'popular',
    'search',
    'spots',
    'spot',
    'welcome',
    'snapr-apps',
    'forgot-password',
    'join',
    'join-success',
    'my-account',
    'find-friends',
    {
        name: 'find-friends-twitter',
        view: 'find_friends_list',
        template: 'find_friends_twitter',
        extra: {service: "twitter"}
    },
    {
        name: 'find-friends-facebook',
        view: 'find_friends_list',
        template: 'find_friends_facebook',
        extra: {service: "facebook"}
    },
    'linked-services',
    'tumblr-posts',
    'tumblr-xauth',
    'twitter-xauth',
    'share',
    {
        name: 'user/followers',
        view: 'people',
        extra: {follow: "followers"}
    },
    {
        name: 'user/following',
        view: 'people',
        extra: {follow: "following"}
    },
    {
        name: 'user/search',
        view: 'people'
    },
    'user/profile',
    {
        name: 'upload_xhr',
        template: 'upload'
    },
    'foursquare_venues',
    'competitions',
    'competition'
];

function _make_route(view_name, template, extra_view_data){
    // returns a function that will do all that's needed to show a page when called
    // view_name: js file to require, provices a Backbone.View
    // template: template path
    // extra_view_data: extra params to load this view with every time
    var route = function(query_string, dialog, extra_instance_data){
        // query_string: query string
        // dialog: (bool) load this page as a dialog (no url change, no effect on history)
        // extra_instance_data: extra data to load this view this time only

        // get the view
        require([view_name], function(view) {

            if(config.get('current_view')){
                console.groupEnd(config.get('current_view').name);
            }
            console.group(template);

            var query = get_query_params(query_string),
                options = _.extend({
                    query: query,
                    dialog: !!dialog
                }, extra_view_data || {}, extra_instance_data || {});

            // don't create a new instance of this view every time
            if(!route.cached_view){
                //options.el = $(el);
                options.name = template;
                // new view() initialises AND activates
                route.cached_view = new view(options);
            }else{
                route.cached_view.options = options;
                route.cached_view.activate(options);
            }
            // store 'current_view' as the one about to be loaded's previous_view
            route.cached_view.previous_view = config.get('current_view');
            // make this view current
            config.set('current_view', route.cached_view);
        });
    };

    return route;
}


// TODO: some of the things done in here seem like they should be in the main.js or config
function get_query_params(query) {
    var params = {};
    if(query && query.indexOf('=') > -1) {
        _.each(query.split('&'), function (part) {

            var kv = part.split('='),
                key = kv[0],
                value = kv[1];

            if(key == "zoom") {
                params[key] = parseInt(unescape(value), 10);
            } else {
                if(_.contains(["access_token", "snapr_user"], key)) {
                    auth.set(key, unescape(value));
                    auth.save_locally();
                }else if(key == "display_username") {
                    auth.set(key, unescape(value).replace('+', ' '));
                    auth.save_locally();
                } else if(_.contains(["snapr_user_public_group", "snapr_user_public_group_name", "appmode", "demo_mode", "environment", "browser_testing", "aviary", "camplus", "camplus_camera", "camplus_edit", "camplus_lightbox"], kv[0])) {
                    local_storage.save(key, value);
                } else {
                    key = unescape(key);
                    if(key in params) {
                        if(!_.isArray(params[key])) {
                            params[key] = [params[key]];
                        }
                        params[key].push(value);
                    } else {
                        params[key] = unescape(value);
                    }
                }
            }
        });
    }

    var env = local_storage.get('environment');
    config.set('environment', env);

    if(params.facebook_signin && auth.get('access_token')){
        alerts.notification('Logged in as ' + (auth.get('display_username') || auth.get('snapr_user')));
        query = new Query(query);
        query.remove('facebook_signin');
        if(Backbone.History.started){
            Backbone.history.navigate( "#/?" + query.toString(), true );  // strip login params
        }else{
            window.location.hash = "#/?" + query.toString();
        }
    }

    return params;
}

// this saves certain params to local storage
var hash = window.location.hash.split('?');
if(hash.length > 1){
    get_query_params(hash[1]);
}

var routers = Backbone.Router.extend({
    pages: pages,

    // build our page array into backbone routes
    initialize: function() {
        _.each(this.pages, function(orig_options){
            var options;

            // the page can just be a name or an object specifing more properties
            if(_.isObject(orig_options)){
                options = orig_options;
            }else{
                options = {name: orig_options};
            }

            if(!options.view){
                options.view = options.name.replace('-', '_').replace('/', '_');
            }

            if(!options.template){
                options.template = options.view;
            }

            options.view = 'views/' + options.view;

            if(!options.extra){
                options.extra = {};
            }

            var callback = _make_route(options.view, options.template, options.extra);
            var regex = new RegExp('^' + options.name + '\\/\\??(.*?)?$');

            // store url so we can manually look them up (for dialogues)
            this.urls.push({
                regex:regex,
                name: options.name,
                callback: callback
            });

            // create backbone route
            this.route(regex, options.name, callback);

        }, this);

    },
    urls:[],

    routes: {
        "?*query_string": "_initial",
        "*path": "_initial"
    },

    _initial: function(query_string){
        return _.any(this.urls, function(url) {
            if (url.name == config.get('initial_view')) {
                url.callback(query_string);
                return true;
            }
        });
    }

});

return routers;

});
