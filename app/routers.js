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
    routes: {
        "about/": "about",
        "about/?*query_string": "about",
        "snapr-apps/": "snapr_apps",
        "snapr-apps/?*query_string": "snapr_apps",
        "app/": "app",
        "app/?*query_string": "app",
        "login/": "login",
        "login/?*query_string": "login",
        "forgot-password/": "forgot_password",
        "forgot-password/?*query_string": "forgot_password",
        "logout/": "logout",
        "join/": "join_snapr",
        "join/?*query_string": "join_snapr",
        "join-success/": "join_success",
        "join-success/?*query_string": "join_success",
        "upload/": "upload",
        "upload/?*query_string": "upload",
        "uploading/": "uploading",
        "uploading/?*query_string": "uploading",
        "photo-edit/": "share_photo",
        "photo-edit/?*query_string": "share_photo",
        "my-account/": "my_account",
        "my-account/?*query_string": "my_account",
        "find-friends/": "find_friends",
        "find-friends/?*query_string": "find_friends",
        "find-friends-twitter/": "find_friends_twitter",
        "find-friends-twitter/?*query_string": "find_friends_twitter",
        "find-friends-facebook/": "find_friends_facebook",
        "find-friends-facebook/?*query_string": "find_friends_facebook",
        "linked-services/": "linked_services",
        "linked-services/?*query_string": "linked_services",
        "connect/": "connect",
        "connect/?*query_string": "connect",
        "tumblr-xauth/": "tumblr_xauth",
        "tumblr-xauth/?*query_string": "tumblr_xauth",
        "twitter-xauth/": "twitter_xauth",
        "twitter-xauth/?*query_string": "twitter_xauth",
        "cities/": "cities",
        "cities/?*query_string": "cities",
        "limbo/": "limbo",
        "limbo/?*": "limbo",
        "feed/": "feed",
        "feed/?*query_string": "feed",
        "dash/": "dash",
        "dash/?*query_string": "dash",
        // "dash-add-person/": "dash_add_person",
        // "dash-add-person/?*query_string": "dash_add_person",
        // "dash-add-search/": "dash_add_search",
        // "dash-add-search/?*query_string": "dash_add_search",
        "activity/": "activity",
        "activity/?*query_string": "activity",
        "map/": "map",
        "map/?*query_string": "map",
        "popular/": "popular",
        "popular/?*query_string": "popular",
        "search/": "search",
        "search/?*query_string": "search",
        "user/profile/": "user_profile",
        "user/profile/?*query_string": "user_profile",
        "user/search/": "user_search",
        "user/search/?*query_string": "user_search",
        "user/followers/": "people_followers",
        "user/followers/?*query_string": "people_followers",
        "user/following/": "people_following",
        "user/following/?*query_string": "people_following",
        "venue/search/": "venues",
        "venue/search/?*query_string": "venues",
        "welcome/": "welcome",
        "welcome/?*query_string": "welcome",
        "?*query_string": "home",
        "*path": "home"
    },

    home: _make_route("views/home", "#home"),

    join_snapr: _make_route("views/join_snapr", "#join-snapr"),
    join_success: _make_route("views/join_success", "#join-success"),
    login: _make_route("views/login", "#login"),
    welcome: _make_route("views/welcome", "#welcome"),
    forgot_password: _make_route("views/forgot_password", "#forgot-password"),
    logout: function( query_string ){

        get_query_params( query_string );
        auth.logout();

        window.location.hash = "";
        if (local_storage.get( "appmode" )){
            native.pass_data('snapr://logout');
        }
    },

    feed: _make_route('views/feed', "#feed"),

    activity: _make_route("views/activity", "#activity"),

    upload: _make_route("views/upload", "#upload"),
    uploading: _make_route("views/uploading", "#uploading"),
    share_photo: _make_route("views/share_photo", "#share-photo"),

    about: _make_route("views/about", "#about"),
    snapr_apps: _make_route("views/snapr_apps", "#snapr-apps"),
    app: _make_route("views/app", "#app"),

    cities: _make_route("views/cities", "#cities"),

    popular: _make_route("views/popular", "#popular" ),

    my_account: _make_route("views/my_account", "#my-account"),

    find_friends: _make_route("views/find_friends_list", "#find-friends"),
    find_friends_twitter: _make_route(
        "views/find_friends",
        "#find-friends-twitter",
        {service: "twitter"}
    ),
    find_friends_facebook: _make_route(
        "views/find_friends",
        "#find-friends-twitter",
        {service: "facebook"}
    ),

    linked_services: _make_route("views/linked_services", "#linked-services"),
    connect: _make_route("views/connect", "#connect"),
    tumblr_xauth: _make_route("views/tumblr_xauth", "#tumblr-xauth"),
    twitter_xauth: _make_route("views/twitter_xauth", "#twitter-xauth"),


    map: _make_route("views/map", "#map"),

    dash: _make_route("views/dash", "#dashboard" ),
    dash_add_person: _make_route("views/dash_add_person", "#dash-add-person"),
    dash_add_search: _make_route("views/dash_add_search", "#dash-add-search"),

    search: _make_route("views/search", "#search"),

    user_profile: _make_route("views/user_profile", "#user-profile"),
    user_search: _make_route("views/people", "#people"),

    people_followers: _make_route("views/people", "#people", {follow: "followers"}),
    people_following: _make_route("views/people", "#people", {follow: "following"}),

    venues: _make_route("views/venues", "#venues"),

    limbo: _make_route("views/limbo", "#limbo")

});

return routers;

});
