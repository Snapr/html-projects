/*global _ Route define require */
define(['views/base/dialog'], function(dialog_view){
snapr.views.login = dialog_view.extend({

    initialize: function()
    {
        snapr.views.dialog.prototype.initialize.call( this );

        if (this.options.query)
        {
            this.message = this.options.query.message;
        }

        if (this.message)
        {
            this.$el.find(".login-message").show().text(this.message);
        }
        else
        {
            this.$el.find(".login-message").hide().text("");
        }

        this.change_page({
            transition: this.transition
        });
    },

    events: {
        "submit #login-dialog":"log_in",
        "click .x-back": "back",
        "click .twitter-button": 'twitter_login'
    },

    log_in: function()
    {
        // console.log('get_auth_token')
        var username = $("#login-dialog-username").val();
        var password = $("#login-dialog-password").val();

        var login_view = this;
        var options = {
            success: function( response )
            {
                $("#login-dialog-username").val('');
                $("#login-dialog-password").val('');
                login_view.back()
            },
            error: function( error )
            {
                console.warn("error", error)
                if (error && error.error && error.error == "invalid_grant")
                {
                    alert( "Oops.. Your login or password was incorrect." )
                }
                else
                {
                    alert( "Sorry, we had trouble logging in. Please try again." );
                }
            }
        }
        snapr.auth.get_token( username, password, options );
    },
    twitter_login: function(){
        Route.navigate( "#/twitter-xauth/?signin=true" );
    }
});

return snapr.views.login;
});
