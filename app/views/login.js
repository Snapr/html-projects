snapr.views.login = Backbone.View.extend({

    events: {
        "submit #login-dialog":"log_in"
    },

    initialize: function()
    {

        this.el.live('pagehide', function( e )
        {
            $(e.target).undelegate();
            
            return true;
        });
        
        if (this.options.query)
        {
            this.message = this.options.query.message;
        }

        
        if (this.message)
        {
            $(this.el).find(".login-message").text(this.message);
        }
        else
        {
            $(this.el).find(".login-message").text("");
        }
        
        $.mobile.changePage( $("#login"), {
            changeHash: false,
            transition: "slidedown"
        });
    },

    log_in: function()
    {
        // console.warn('get_auth_token')
        var username = $("#login-dialog-username").val();
        var password = $("#login-dialog-password").val();

        var options = {
            success: function( response )
            {
                $("#login-dialog-username").val('');
                $("#login-dialog-password").val('');
                if (window.location.hash.indexOf("#/login/") > -1 )
                {
                    window.history.back();
                }
                else
                {
                    Route.navigate( window.location.hash, true );
                }
            },
            error: function(error)
            {
                alert( error || "Sorry, we had trouble logging in. Please try again." );
            }
        }
        snapr.auth.get_token( username, password, options );
    }
});