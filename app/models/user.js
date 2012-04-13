snapr.models.user = Backbone.Model.extend({

    initialize: function( init_options )
    {
        this.data = {
            username: init_options.username
        }
    },

    urlRoot: function()
    {
        return snapr.api_base + '/user/'
    },

    url: function( method )
    {
        return this.urlRoot() + 'details/';
    },

    parse: function( d, xhr )
    {
        if (d.response && d.response.user)
        {
            if (d.response.details)
            {
                d.response.user.details = d.response.details;
            }
            return d.response.user;
        }
        else if (d.user_id)
        {
            return d;
        }
        else
        {
            return {};
        }
    },

    follow: function()
    {
        var url_function = this.url;

        this.url = this.urlRoot() + "follow/";

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
                console.log( "follow error", e );
            }
        })

    },

    unfollow: function()
    {
        var url_function = this.url;

        this.url = this.urlRoot() + "unfollow/";

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
                console.log( "unfollow error", e );
            }
        })

    }


});
