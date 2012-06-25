/*global _  define require */
define(['config', 'backbone', 'auth', 'utils/local_storage', 'native'], function(config, Backbone, auth, local_storage, native) {

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
            if(kv[0] == "zoom") {
                params[key] = parseInt(unescape(value), 10);
            } else {
                if(_.indexOf(["access_token", "snapr_user"], key) > -1) {
                    var obj = {};
                    obj[kv[0]] = unescape(kv[1]);
                    auth.set(obj);
                    auth.save_locally();
                } else if(_.indexOf(["snapr_user_public_group", "snapr_user_public_group_name", "appmode", "demo_mode", "environment", "browser_testing", "aviary", "camplus", "camplus_camera", "camplus_edit", "camplus_lightbox"], kv[0]) > -1) {
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

    return params;
}

// this saves certain params to local storage
var hash = window.location.hash.split('?');
if(hash.length > 1){
    get_query_params(hash[1]);
}

var routers = Backbone.Router.extend({
    pages: [
        'about',
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
        ['find-friends-twitter', 'find_friends_list', {service: "twitter"}],
        ['find-friends-facebook', 'find_friends_list', {service: "facebook"}],
        'linked-services',
        'tumblr-xauth',
        'twitter-xauth',
        'share',
        ['user/followers', 'people', {follow: "followers"}],
        ['user/following', 'people', {follow: "following"}],
        'foursquare_venues'
    ],
    initialize: function() {
        _.each(this.pages, _.bind(function(name){
            var view, extra_data;
            if($.isArray(name)){
                view = "views/" + name[1];
                extra_data = name[2];
                name = name[0];
            }else{
                view = "views/" + name.replace('-', '_').replace('/', '_');
            }
            var regex = new RegExp('^' + name + '\\/\\??(.*?)?$');
            var element = "#" + name;
            var callback = _make_route(view, element, extra_data);
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
