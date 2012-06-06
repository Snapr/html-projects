define(['views/base/page'], function(page_view){
snapr.views.limbo = page_view.extend({

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

return snapr.views.limbo;
});
