/*global _  define require */
define(['config', 'backbone', 'auth', 'utils/local_storage', 'native_bridge', 'utils/alerts', 'utils/query', '../theme/'+window.theme+'/config'], function(config, Backbone, auth, local_storage, native_bridge, alerts, Query, theme_config) {

function _make_route(file_name, name, template, extra_view_data){
    // returns a function that will do all that's needed to show a page when called
    // file_name: js file to require, provices a Backbone.View
    // template: template path
    // extra_view_data: extra params to load this view with every time
    var route = function(query_string, dialog, extra_instance_data){
        // query_string: query string
        // dialog: (bool) load this page as a dialog (no url change, no effect on history)
        // extra_instance_data: extra data to load this view this time only

        if(query_string && query_string.toLowerCase().indexOf('new_user=true') !== -1 && !local_storage.get("welcome_shown")){
            //Backbone.history.navigate( "#", true );  // go here first so that back is not new_user
            Backbone.history.navigate( "#/welcome/" );

            return;
        }

        // get the view
        require([file_name], function(view) {

            if(config.get('current_view')){
                config.get('current_view').trigger('deactivate');
                console.groupEnd(config.get('current_view').name);
            }
            console.group(name);

            var query = get_query_params(query_string),
                options = _.extend({
                    query: query,
                    name: name,
                    template: template,
                    dialog: !!dialog
                }, extra_view_data || {}, extra_instance_data || {});

            // don't create a new instance of this view every time
            if(!route.cached_view){
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
                    local_storage.set(key, value);
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
    pages: theme_config.pages,

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

            var callback = _make_route(options.view, options.name, options.template, options.extra);
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
