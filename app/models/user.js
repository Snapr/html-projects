/*global _  define require */
define(['config', 'backbone', 'auth'], function(config, Backbone, auth){
return Backbone.Model.extend({

    initialize: function( init_options ){
        this.data = {
            username: init_options.username
        };
        if(config.get('get_user_points')){
            this.data.user_points = true;
        }
    },

    urlRoot: function(){
        return config.get('api_base') + '/user/';
    },

    url: function( method ){
        return this.urlRoot() + 'details/';
    },

    parse: function( d, xhr ){

        if (d.response && d.response.user){
            if (d.response.details){
                d.response.user.details = d.response.details;
            }

            d.response.user.display_username = auth.fill_username(d.response.user);

            return d.response.user;
        }else if (d.user_id){
            d.display_username = auth.fill_username(d);
            return d;
        }else{
            return {};
        }
    },

    follow: function(callback){
        var url_function = this.url;

        this.url = this.urlRoot() + "follow/";

        this.save({},{
            success: function( new_model, response ){
                if (response.success && response.response && response.response.users){
                    new_model.set( response.response.users[0] );
                }else{
                    console.warn(new_model, response);
                }
                if($.isFunction(callback)){
                    callback(new_model, response);
                }
            },
            error: function(e){
                console.log( "follow error", e );
                if($.isFunction(callback)){
                    callback(e);
                }
            }
        });

    },

    unfollow: function(callback){
        var url_function = this.url;

        this.url = this.urlRoot() + "unfollow/";

        this.save({},{
            success: function( new_model, response ){
                if (response.success && response.response && response.response.users && response.response.users[0]){
                    new_model.set( response.response.users[0][0] );
                }else{
                    console.warn(new_model, response);
                }
                if($.isFunction(callback)){
                    callback(new_model, response);
                }
            },
            error: function(e){
                console.log( "unfollow error", e );

                if($.isFunction(callback)){
                    callback(e);
                }
            }
        });

    }


});
});
