/*global _  define require */
define(['views/home', './nearby_photostream'], function(base_home, nearby_photostream_view){
return base_home.extend({

    post_initialize: function(options){
        base_home.prototype.post_initialize(options);

        this.nearby_photostream = new nearby_photostream_view({
           el: this.$('.x-menu-stream')
        });
    },

    events: {
        "click .x-feed-button": "go_to_feed"
    },

    go_to_feed: function(){
        this.nearby_photostream.go_to_feed();
    },

    render_nearby_photostream: function(){
        this.nearby_photostream.refresh();
        this.$el.trigger('create');
        return this;
    }

});
});
