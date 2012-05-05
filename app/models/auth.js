snapr.models.auth = Backbone.Model.extend({

    url: function()
    {
        return snapr.access_token_url;
    },

    get_token: function( username, password, options )
    {
        this.data = {
            grant_type: "password",
            client_id: snapr.client_id,
            client_secret: snapr.client_secret,
            username: username,
            password: password,
            _method: "POST"
        }
        var auth = this;
        var opt = {
            success: function( response )
            {
                if (auth.get( "access_token" ))
                {
                    auth.set({
                        snapr_user: username
                    });
                    auth.save_locally();
                    delete auth.data;
                    if (typeof options.success == "function")
                    {
                        options.success();
                    }
                }
                else
                {
                    delete auth.data;
                    if (typeof options.error == "function")
                    {
                        options.error( auth.attributes );
                    }
                }
            },
            error: function()
            {
                if (typeof options.error == "function")
                {
                    options.error();
                }
            }
        }

        this.fetch( opt );
    },

    get_locally: function()
    {
        if (snapr.info.supports_local_storage)
        {
            var snapr_user = localStorage.getItem( "snapr_user" );
            var access_token = localStorage.getItem( "access_token" );
        }
        else
        {
            var snapr_user = $.cookie( "snapr_user" );
            var access_token = $.cookie( "access_token" );
        }
        if (snapr_user && access_token)
        {
            this.set({
                access_token: access_token,
                snapr_user: snapr_user
            });
        }
    },

    save_locally: function()
    {
        var snapr_user = this.get( "snapr_user" );
        var access_token = this.get( "access_token" );

        if (snapr.utils.get_local_param( "appmode" ))
        {
            pass_data( "snapr://login?snapr_user=" + encodeURI( snapr_user ) + "&access_token=" + encodeURI( access_token ) );
        }
        else
        {
            if (snapr.info.supports_local_storage)
            {
                localStorage.setItem( "snapr_user", snapr_user );
                localStorage.setItem( "access_token", access_token );
            }
            else
            {
                $.cookie( "snapr_user", snapr_user );
                $.cookie( "access_token", access_token );
            }
        }
    },

    logout: function()
    {
        this.unset( "snapr_user" );
        this.unset( "access_token" );
        if (snapr.info.supports_local_storage)
        {
            var snapr_user = localStorage.removeItem( "snapr_user" );
            var access_token = localStorage.removeItem( "access_token" );
        }
        else
        {
            $.cookie( "snapr_user", null );
            $.cookie( "access_token", null );
        }
    }
});
