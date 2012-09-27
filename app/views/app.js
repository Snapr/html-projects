/*global _  define require */
define(['views/base/page', 'backbone'], function(page_view, Backbone){
    return page_view.extend({
        events: {
            "click #app-page-upload-button": "goto_upload"
        },
        goto_upload: function(){
            Backbone.history.navigate('#/upload/?' + $.param(this.options.query));
        }
    });
});


