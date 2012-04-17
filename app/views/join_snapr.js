snapr.views.join_snapr = snapr.views.dialog.extend({

    initialize: function()
    {
        snapr.views.dialog.prototype.initialize.call( this );

        this.change_page({
            transition: this.transition
        });
    },

    transition: "slideup",

    events: {
        "submit #join-dialog": "join",
        "click .x-back": "back"
    },

    join: function()
    {
        var new_user = new snapr.models.user_settings();
        new_user.data = {
           username: this.$el.find("#join-dialog-username").val(),
           password: this.$el.find("#join-dialog-password").val(),
           email: this.$el.find("#join-dialog-email").val(),
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
                Route.navigate('#');
            },
            error: function()
            {
                console.log('error on login after successful join');
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
                console.log( "error", e );
            }
        }
        // save creates a new user
        new_user.save({},join_options);
    }
});




