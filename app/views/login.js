snapr.views.login = snapr.views.dialog.extend({

    el: $('#login'),

    events: {
        "submit #login-dialog":"log_in",
        "click .x-back": "back"
    },

    initialize: function()
    {
        this.back_view = this.options.back_view;

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
            $(this.el).find(".login-message").show().text(this.message);
        }
        else
        {
            $(this.el).find(".login-message").hide().text("");
        }

        $.mobile.changePage( $("#login"), {
            changeHash: false,
            transition: this.transition
        });
    },

    transition: "slidedown",

    log_in: function()
    {
        // console.log('get_auth_token')
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
