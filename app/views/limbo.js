/*global _ Route define require */
define(['backbone', 'views/base/page'], function(Backbone, page_view){
return page_view.extend({

    post_initialize: function(){
        this.el.live('pagehide', function( e ){
            $.mobile.hidePageLoadingMsg();
            return true;
        });
    },
    post_activate: function(){

        this.change_page();

        setTimeout(function(){
           $.mobile.showPageLoadingMsg();
        },100);

    },
    events: {
        "click": "home"
    },

    home: function(){
        Backbone.history.navigate( "#/", true );
    }
});
});
