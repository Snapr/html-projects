snapr.models.user_collection = Backbone.Collection.extend({

    model:snapr.models.user,

    urlRoot: snapr.api_base + '/user/',

    url: function( method )
    {
        return snapr.api_base + '/user/';
    },

    parse: function( d, xhr )
    {
        if (d.success && d.response && d.response.groups && d.response.groups[0] && d.response.groups[0].users)
        {
            return d.response.groups[0].users;
        }
        else if (d.success && d.response && d.response.followers)
        {
            return d.response.followers;
        }
        else if(d.success && d.response && d.response.users )
        {
            return d.response.users;
        }
        else
        {
            return [];
        }
    },

    get_following: function( username )
    {
        var url_function = this.url;

        this.url = this.urlRoot + "following/";

        this.data = {
            username: username
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
        })
    },

    get_followers: function( username )
    {
        var url_function = this.url;

        this.url = snapr.api_base + '/user/followers/';

        this.data = {
            username: username
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
        })
    },

    user_search: function( username )
    {
        var url_function = this.url;

        this.url = snapr.api_base + '/user/search/';

        this.data = {
            username: username
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
        })
    },
});
