/*global _  define require */
define(['config', 'backbone', 'models/user'],
function(config, Backbone, user){
return  Backbone.Collection.extend({

    model: user,

    urlRoot: function(){
        return config.get('api_base') + '/user/';
    },

    url: function( method ){
        return this.urlRoot();
    },

    parse: function( d, xhr ){
        if (d.success && d.response && d.response.groups && d.response.groups[0] && d.response.groups[0].users){
            return d.response.groups[0].users;
        }else if (d.success && d.response && d.response.followers){
            return d.response.followers;
        }else if(d.success && d.response && d.response.users ){
            return d.response.users;
        }else{
            return [];
        }
    },

    get_following: function( username )
    {
        var url_function = this.url;

        this.url = this.urlRoot() + "following/";

        this.data = {
            username: username
        };
        if(config.get('get_user_points')){
            this.data.sort = 'score';
        }

        var user_collection = this;

        this.fetch({
            success: function()
            {
                user_collection.url = url_function;
            },
            error: function(e)
            {
                user_collection.url = url_function;
                console.log( "error getting following", e );
            }
        });
    },

    get_followers: function( username )
    {
        var url_function = this.url;

        this.url = this.urlRoot() + 'followers/';

        this.data = {
            username: username
        };
        if(config.get('get_user_points')){
            this.data.sort = 'score';
        }

        var user_collection = this;

        this.fetch({
            success: function()
            {
                user_collection.url = url_function;
            },
            error: function(e)
            {
                user_collection.url = url_function;
                console.log( "error getting following", e );
            }
        });
    },

    user_search: function( username )
    {
        var url_function = this.url;

        this.url = this.urlRoot() + 'search/';

        this.data = {
            username: username
        };
        if(config.get('get_user_points')){
            this.data.sort = 'score';
        }

        var user_collection = this;

        this.fetch({
            success: function()
            {
                user_collection.url = url_function;
            },
            error: function(e)
            {
                user_collection.url = url_function;
                console.log( "error getting following", e );
            }
        });
    },

    get_top_users: function(spot_id) {
        var url_function = this.url;
        this.url = this.urlRoot() + 'search/';

        this.data = {
            n: 10,
            sort: 'score',
            spot: spot_id
        };

        var user_collection = this;
        this.fetch({
            success: function()
            {
                user_collection.url = url_function;
            },
            error: function(e)
            {
                user_collection.url = url_function;
                console.log( "error getting following", e );
            }
        });

    }
});

});
