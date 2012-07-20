/*global _  define require */
define(['backbone', 'utils/geo', 'collections/photo'],
    function(Backbone, geo, photo_collection) {

var nearby_photostream_view = Backbone.View.extend({

    template: _.template( $("#nearby-photostream-template").html() ),
    collection: new photo_collection(),

    initialize: function () {
        this.render();
        this.search_options = {
            n: 4,
            sort:'weighted_score'
        };
    },
    events: {
        "click #home-nearby-link": "go_to_feed"
    },
    refresh: function () {

        var this_view = this;

        var success_callback = function( location ) {
            this_view.search_options.latitude = location.coords.latitude;
            this_view.search_options.longitude = location.coords.longitude;
            this_view.search_options.nearby = true;
            this_view.search_options.radius = 5000;
            this_view.fetch_photos();
        };

        var error_callback = function() {
            this_view.fetch_photos();
        };

        geo.get_location( success_callback, error_callback );
    },
    render: function () {
        this.$el.html(this.template({}));
        this.$el.find('.thumbs-preview-stream').empty();
        this.collection.reset();
        this.$el.find('[data-role="button"]').button();

        return this;
    },
    fetch_photos: function () {

        var this_view = this,
            current_photo_ids = this.collection.map(function (photo) {
                return photo.get('id');
            });

        this_view.collection.fetch({
            data: this.search_options,
            success: function() {
                // Check to see if the photo's have changed. If all the ID's are the same don't re-render
                var photos_changed = this_view.collection.all(function (photo) {
                    return ($.inArray(photo.get('id'), current_photo_ids) === -1);
                });
                photos_changed && this_view.render_photos();
            }
        });
    },
    render_photos: function () {

        var $stream = this.$el.find('.thumbs-preview-stream').empty();
        this.collection.each(function (photo) {
            var stream_item = new nearby_photostream_item_view({
                model: photo
            });

            $stream.append( stream_item.el );
            stream_item.render();
        });
    },
    go_to_feed: function(){
        var params = _.clone(this.search_options);
        delete params.n;
        Backbone.history.navigate( "#/feed/?" + $.param(params) );
    }

});

var nearby_photostream_item_view = Backbone.View.extend({
    tagName: 'li',
    template: _.template( $('#nearby-photstream-item-template').html() ),
    render: function () {
        this.$el.html( this.template({
            photo: this.model
        }));
    }
});

return nearby_photostream_view;

});
