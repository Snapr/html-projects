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

        this.$( ".x-posts" ).empty();

        this.collection.bind( "change", _.bind(this.render, this) );

        this.collection.fetch({
            host: options.query.host,
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

    get_default_tab: function(){ return 'dash'; },

    render: function(){
        var $stream = this.$( ".x-posts" ).empty();

        this.$('.x-blog-title').text(this.collection.blog_title);

        this.collection.each(function (post) {
            var li = new tumblr_item_view({
                model: post
            });
            $stream.append( li.el );
            li.render();
        });

        // this.$('[data-role="button"]').button();
        $.mobile.hidePageLoadingMsg();
    }
});

return tumblr_post_view;

});
