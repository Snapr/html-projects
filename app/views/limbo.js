snapr.views.limbo = snapr.views.page.extend({

    initialize: function()
    {
        snapr.views.page.prototype.initialize.call( this );

        this.change_page();        

        setTimeout(function()
        {
           $.mobile.showPageLoadingMsg();
        },100);
        
        _.bindAll( this );
        this.el.live('pagehide', function( e )
        {
            $(e.target).undelegate();
            $.mobile.hidePageLoadingMsg();

            return true;
        });
      
    },
    events: {
        "click": "home"
    },
    
    home: function()
    {
        Route.navigate( "#/", true );
    }
});