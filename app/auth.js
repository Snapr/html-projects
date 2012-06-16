/*global _  define require */
define(['config', 'backbone', 'jquery', 'utils/local_storage', 'native'], function(config, Backbone, $, local_storage, native) {

var auth_model = Backbone.Model.extend({

    url: function(){
        if (!config.has("access_token_url"))
        {
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
                        snapr_user: username
                    });
                    auth.save_locally();
                    delete auth.data;
                    if (typeof options.success == "function")
                    {
                        options.success();
                    }
                }else{
                    delete auth.data;
                    if (typeof options.error == "function")
                    {
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
        var snapr_user = local_storage.get( "snapr_user" );
        var access_token = local_storage.get( "access_token" );

        if (snapr_user && access_token){
            this.set({
                access_token: access_token,
                snapr_user: snapr_user
            });
        }
    },

    save_locally: function(){
        var snapr_user = this.get( "snapr_user" );
        var access_token = this.get( "access_token" );

        localStorage.setItem( "snapr_user", snapr_user );
        localStorage.setItem( "access_token", access_token );

        // only save to the app if we're in appmode
        // and the hash doesn't have "access_token" in it
        // (which would cause an infinite loop)
        if (local_storage.get( "appmode" ) && window.location.hash.indexOf("access_token") < 0){
            native.pass_data( "snapr://login?snapr_user=" + encodeURI( snapr_user ) + "&access_token=" + encodeURI( access_token ) );
        }
    },

    logout: function(){
        this.unset( "snapr_user" );
        this.unset( "access_token" );
        localStorage.removeItem( "snapr_user" );
        localStorage.removeItem( "access_token" );
    },

    // decorator function
    require_login: function (funct) {
        return function (e) {
            if(!auth.has('access_token')) {
                if(e) {
                    e.preventDefault();
                }
                Backbone.history.navigate('#/login/?message=Sorry, you need to log in first.');
            } else {
                $.proxy(funct, this)(e);
            }
        };
    }
});

var auth = new auth_model();
auth.get_locally();

return auth;
});
