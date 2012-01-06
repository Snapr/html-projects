snapr.views.home = Backbone.View.extend({

    initialize: function()
    {
        this.el.live('pagehide', function( e )
        {
            $(e.target).undelegate();
            
            return true;
        });

        if ($.mobile.activePage && $.mobile.activePage.find("#home").length < 1)
        {
            console.warn( 'changing page' );
            $.mobile.changePage( "#home" );
        }
        // window.location.hash = "";
        var home_view = this;
        snapr.auth.bind( "set:username", function()
        {
            console.warn( 'set:username' )
            home_view.render();
        });
        snapr.auth.bind( "unset:username" , function()
        {
            console.warn( 'unset:username' )
            home_view.render();
        });

        snapr.auth.change();
        this.render();
    },

    template: _.template( $('#home-template').html() ),

    render: function()
    {
        console.warn( 'render home' )
        if (snapr.auth && snapr.auth.attributes.snapr_user)
        {
            var logged_in = true;
            var snapr_user = snapr.auth.attributes.snapr_user;
            
        }
        else
        {
            var logged_in = false;
            var snapr_user = null;
        }
        this.el.find( '[data-role="content"]' )
            .replaceWith(
                $(this.template( {
                    logged_in: logged_in,
                    username: snapr_user,
                    appmode: snapr.utils.get_local_param("appmode")
                })));
        this.el.trigger( "create" );
        
        return this;
    }
});