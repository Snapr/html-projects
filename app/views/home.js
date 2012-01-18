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
    }

});