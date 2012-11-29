/*global _  define require */
define(['views/home', './nearby_photostream'], function(base_home, nearby_photostream_view){
return base_home.extend({

    render_nearby_photostream: function(){

        this.nearby_photostream = new nearby_photostream_view({
           el: this.$('.x-menu-stream')
        });
        this.nearby_photostream.refresh();

        this.$el.trigger('create');

        return this;
    }

});
});
