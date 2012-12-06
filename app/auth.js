/*global _  define require T */
define(['config', 'backbone', 'jquery', 'utils/local_storage', 'native_bridge', 'models/user_settings'], function(config, Backbone, $, local_storage, native_bridge, user_settings) {

var auth_model = Backbone.Model.extend({

    initialize: function(){
        _.bindAll(this);
        this.user_settings = new user_settings();
        this.user_settings.on('change', this.save_display_username);
        this.on('change:access_token', function(x){
            if(this.has('access_token')){
                this.trigger('login');
            }
        });
    },

    url: function(){
        if (!config.has("access_token_url")){
            config.trigger("change:environment");
        }
        return config.get('access_token_url');
    },

    get_token: function( username, password, options ){
        this.data = {
            grant_type: "password",
            client_id: config.get('client_id'),
            client_secret: config.get('client_secret'),
            username: username,
            password: password,
            _method: "POST"
        };

        var auth = this;
        var opt = {
            success: function( response ){
                if (auth.get( "access_token" )){
                    auth.set({
                        snapr_user: username,
                        display_username: username
                    });
                    auth.save_locally();
                    delete auth.data;
                    if (typeof options.success == "function"){
                        options.success();
                    }
                    auth.trigger('login');
                }else{
                    delete auth.data;
                    if (typeof options.error == "function"){
                        options.error( auth.attributes );
                    }
                }
            },
            error: function(){
                if (typeof options.error == "function"){
                    options.error();
                }
            }
        };

        this.fetch( opt );
    },

    get_locally: function(){
        var attributes = local_storage.get('auth') || {};

        if (attributes.snapr_user && attributes.access_token){
            this.set(attributes);
        }
    },

    save_display_username: function(save, display, username){
        this.set({'display_username': this.user_settings.get('user').display_username}, {silent:true});
        local_storage.set('auth', this.attributes);
    },

    save_locally: function(){
        local_storage.set('auth', this.attributes);

        // only save to the app if we're in appmode
        // and the hash doesn't have "access_token" in it
        // (which would cause an infinite loop)
        if (local_storage.get( "appmode" )){
            native_bridge.pass_data( "snapr://login?snapr_user=" + encodeURI( this.get( "snapr_user" ) ) + "&display_username=" + encodeURI( this.get( "display_username" ) ) + "&access_token=" + encodeURI( this.get( "access_token" ) ) );
        }
    },

    logout: function(){
        this.clear();
        local_storage['delete']( "auth" );
        this.trigger('logout');
    },

    // decorator function
    require_login: function (funct) {
        return function (e) {
            if(!window.auth.has('access_token')) {
                if(e) {
                    e.preventDefault();
                }
                Backbone.history.navigate('#/login/?message='+T('Sorry, you need to log in first'));
            } else {
                $.proxy(funct, this)(e);
            }
        };
    },

    // fill in blank display_usernames
    fill_username: function(user){
        if(user.display_username === ''){
            if(user.username == window.auth.get('snapr_user')){
                return config.get('me_username');
            }else{
                return config.get('anon_username');
            }
        }else{
            return user.display_username;
        }
    }
});

window.auth = new auth_model();
window.auth.get_locally();

return window.auth;
});
