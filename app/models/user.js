snapr.models.user = Backbone.Model.extend({

    initialize: function( init_options )
    {
        this.data = {
            username: init_options.username
        }
    },

    //urlRoot: snapr.api_base + '/user/',

    url: function( method )
    {
        return snapr.api_base + '/user/details/';
    },

    parse: function( d, xhr )
    {
        if (d.response && d.response.user)
        {
            return d.response.user;
        }else{
            return {};
        }
    },

    follow: function()
    {
        var url_function = this.url;

        this.url = snapr.api_base + "/user/follow/";

        var model = this;

        this.save({},{
            success: function()
            {
                model.url = url_function;
                model.fetch();
            },
            error: function(e)
            {
                model.url = url_function;
                model.fetch();
                console.warn( "follow error", e );
            }
        })

    },

    unfollow: function()
    {
        var url_function = this.url;

        this.url = snapr.api_base + "/user/unfollow/";

        var model = this;

        this.save({},{
            success: function(s)
            {
                model.url = url_function;
                model.fetch();
            },
            error: function(e)
            {
                model.url = url_function;
                model.fetch();
                console.warn( "unfollow error", e );
            }
        })

    }


});
