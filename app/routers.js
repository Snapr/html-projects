/*global _  define require */
define(['config', 'backbone', 'auth', 'utils/local_storage', 'native', 'utils/alerts', 'utils/query'], function(config, Backbone, auth, local_storage, native, alerts, Query) {

var pages = [
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
        extra: {service: "twitter"}
    },
    {
        name: 'find-friends-facebook',
        view: 'find_friends_list',
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
        element: 'people',
        extra: {follow: "followers"}
    },
    {
        name: 'user/following',
        view: 'people',
        element: 'people',
        extra: {follow: "following"}
    },
    {
        name: 'user/search',
        view: 'people',
        element: 'people'
    },
    {
        name: 'user/profile',
        element: 'user-profile'
    },
    {
        name: 'upload_xhr',
        element: 'upload'
    },
    'foursquare_venues'
];

function _make_route(view, el, extra_data){
    var route = function(query_string, dialog, extra_data_2){
        require([view], function(view) {
            var query = get_query_params(query_string),
                options = _.extend({
                    query: query,
                    dialog: !!dialog
                }, extra_data || {}, extra_data_2 || {});
            if(!route.cached_view){
                options.el = $(el);
                route.cached_view = new view(options);
            }else{
                route.cached_view.options = options;
                route.cached_view.activate(options);
            }
            route.cached_view.previous_view = config.get('current_view');
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
    initialize: function() {
        _.each(this.pages, _.bind(function(name){
            var view, extra_data, element;
            if(_.isObject(name)){
                view = name.view;
                extra_data = name.extra;
                element = name.element;
                name = name.name;
            }
            view = "views/" + (view || name.replace('-', '_').replace('/', '_'));
            element = "#" + (element || name);
            var callback = _make_route(view, element, extra_data);
            var regex = new RegExp('^' + name + '\\/\\??(.*?)?$');
            this.urls.push({
                regex:regex,
                callback: callback
            });
            this.route(regex, name, callback);
        }, this));

    },
    urls:[],
    routes: {
        "?*query_string": "home",
        "*path": "home"
    },

    home: _make_route("views/home", "#home")

});

return routers;

});
