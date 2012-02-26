snapr.views.join_snapr = Backbone.View.extend({

    events: {
        "submit #join-dialog": "join"
    },

    initialize: function()
    {
        this.el.live('pagehide', function( e )
        {
            $(e.target).undelegate();
            
            return true;
        });

        $.mobile.changePage( $("#join-snapr"), {changeHash: false});
    },

    join: function()
    {
        var new_user = new snapr.models.user_settings();
        new_user.data = {
           username: this.el.find("#join-dialog-username").val(),
           password: this.el.find("#join-dialog-password").val(),
           email: this.el.find("#join-dialog-email").val(),
           client_id: snapr.client_id
        }
        
        var join_snapr_view = this;
        
        // these options will be triggered on login (after successful join)
        var login_options = {
            success: function()
            {
                // empty all the forms
                join_snapr_view.el.find("#join-dialog-username").val('');
                join_snapr_view.el.find("#join-dialog-password").val('');
                join_snapr_view.el.find("#join-dialog-email").val('')
                // go back to home screen
                Route.navigate('#',true);
            },
            error: function()
            {
                console.warn('error on login after successful join');
            }
        }
        // these options will be triggered on join
        var join_options = {
            success: function()
            {
                snapr.auth.get_token( new_user.data.username, new_user.data.password, login_options );
            },
            error: function( e )
            {
                console.warn( "error", e );
            }
        }
        // save creates a new user
        new_user.save({},join_options);
    }
});




