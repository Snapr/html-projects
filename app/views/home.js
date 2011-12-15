snapr.views.home = Backbone.View.extend({

    initialize: function()
    {
        if ($.mobile.activePage && $.mobile.activePage.find("#home").length < 1)
        {
            console.warn( 'changing page' );
            $.mobile.changePage( "#home" );
        }
        window.location.hash = "";
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
        if (snapr.auth && snapr.auth.attributes.username)
        {
            var logged_in = true,
            username = snapr.auth.attributes.username;
            
        }
        else
        {
            var logged_in = false,
            username = null;
        }
        this.el.find( '[data-role="content"]' )
            .replaceWith(
                $(this.template( {
                    logged_in: logged_in,
                    username:username
                })));
        this.el.trigger( "create" );
        
        return this;
    }
});