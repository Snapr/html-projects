/*global _ Route define require */
define(['views/base/page'], function(page_view){
return page_view.extend({

    post_initialize: function(){

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
});
