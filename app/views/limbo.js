/*global _ Route define require */
define(['views/base/page'], function(page_view){
return page_view.extend({

    post_initialize: function(){
        this.el.live('pagehide', function( e ){
            $.mobile.hidePageLoadingMsg();
            return true;
        });
    },
    activate: function(){

        this.change_page();

        setTimeout(function(){
           $.mobile.showPageLoadingMsg();
        },100);

    },
    events: {
        "click": "home"
    },

    home: function(){
        Route.navigate( "#/", true );
    }
});
});
