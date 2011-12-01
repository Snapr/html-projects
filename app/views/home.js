tripmapper.views.home = Backbone.View.extend({

    initialize: function()
    {
        if ($.mobile.activePage && $.mobile.activePage.find("#home").length < 1)
        {
            console.warn( 'changing page' );
            $.mobile.changePage( "#home" );
        }
        window.location.hash = "";
        var home_view = this;
        tripmapper.auth.bind( "set:username", function()
        {
            console.warn( 'set:username' )
            home_view.render();
        });
        tripmapper.auth.bind( "unset:username" , function()
        {
            console.warn( 'unset:username' )
            home_view.render();
        });

        tripmapper.auth.change();
        this.render();
    },

    template: _.template( $('#home-template').html() ),

    render: function()
    {
        console.warn( 'render home' )
        if (tripmapper.auth && tripmapper.auth.attributes.username)
        {
            var logged_in = true,
            username = tripmapper.auth.attributes.username;
            
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