/*global _  define require */
define(['views/base/page', 'backbone'], function(page_view, Backbone){
    return page_view.extend({
        events: {
            "click .x-web-upload": "goto_upload"
        },
        goto_upload: function(){
            Backbone.history.navigate('#/upload/?' + $.param(this.options.query));
        }
    });
});


