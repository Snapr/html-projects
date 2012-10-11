/*global _  define require */
define(['views/base/page', 'collections/tumblr_post', 'views/tumblr_item'], function(page_view, tumblr_collection, tumblr_item_view){

var tumblr_post_view = page_view.extend({

    post_initialize: function(){
        this.collection = new tumblr_collection();
    },

    post_activate: function(options){
        var this_view = this;

        this.change_page();
        $.mobile.showPageLoadingMsg();

        this.$el.find( ".posts-stream" ).empty();

        this.collection.bind( "change", _.bind(this.render, this) );

        this.collection.fetch({
            data: {
                filter:'text'
            },
            success: function() {
                this_view.render();
            },
            error: function() {
                this_view.render();
            }
        });
    },

    render: function(){
        var $stream = this.$el.find( ".posts-stream" ).empty();

        this.collection.each(function (post) {
            var li = new tumblr_item_view({
                model: post
            });
            $stream.append( li.el );
            li.render();
        });
        // this.$el.find('[data-role="button"]').button();
        $.mobile.hidePageLoadingMsg();
    }
});

return tumblr_post_view;

});
