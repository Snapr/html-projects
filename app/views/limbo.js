/*global _  define require */
define(['backbone', 'views/base/page'], function(Backbone, page_view){
return page_view.extend({

    post_initialize: function(){
        this.$el.live('pagehide', function( e ){
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

    load_template: function(){
        this.template = _.template('<div data-role="page" data-theme="a"><div data-role="content"></div></div>');
    },

    home: function(){
        Backbone.history.navigate( "#/", true );
    },

    offline: function(){}
});
});

