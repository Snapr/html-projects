/*global _  define require */
define(['backbone', 'collections/tumblr_post'], function(Backbone, tumblr_collection){

var tumblr_item_view = Backbone.View.extend({
    tagName: 'li',

    initialize: function () {
        var type = this.model.get('type');
        this.template = _.template( $("#tumblr-tmpl-" + type).html() );
        this.metadata_template = _.template( $("#tumblr-tmpl-metadata").html() );
    },
    
    render: function () {
        var parentWidth = this.$el.parent().width(); 
        this.$el.html( this.template({
            model: this.model,
            _:_,
            getPhotoURL: function(model, size) {
                size = parentWidth;
                // Returns the best image URL from available photo sizes based on the specified
                // "size" parameter. For non-native sizes, returns the next largest size (if available).
                var images = model.alt_sizes,
                    src = "";
                for (var i = 0; i < images.length; i++) {
                    if (images[i].width >= size) src = images[i].url; else break;
                }
                return (src === "") ? images[0].url : src;
            },
            getVideoEmbed: function(model, size) {
                size = parentWidth;
                // Returns the best embed code from available video sizes based on the specified
                // "size" parameter. For non-native sizes, returns the next smallest size.
                var players = model.get('player'),
                    embed = "";
                for (var i = 0; i < players.length; i++) {
                    if (players[i].width <= size) embed = players[i].embed_code; else break;
                }
                return (embed === "") ? players[0].embed_code : embed;
            }
        }));
        _.each(this.model.get('data'))
        this.$el.append( this.metadata_template({
            model: this.model,
            _:_
        }));
        this.$el.trigger('create');
    }
});

return tumblr_item_view;

});