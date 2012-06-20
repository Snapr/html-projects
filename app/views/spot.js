/*global _  define require */
define(['backbone', 'views/base/page', 'views/upload_progress_li',
    'models/photo', 'views/base/side_scroll', 'collections/photo', 'utils/local_storage', 'utils/alerts', 'native', 'config'],
function(Backbone, page_view, upload_progress_li, photo_model, side_scroll, photo_collection, local_storage, alerts, native, config){

var spot = page_view.extend({

    post_activate: function(){

        this.change_page();

    },

    events: {
    },

    render: function(){

    },
});

var uploading_image_stream = side_scroll.extend({
    //leftover code from uploading.js page.. needs to be edited
    tagName: 'li',
    className: 'image-stream',
    template: _.template( $('#uploading-stream-template').html() ),
    thumbs_template: _.template( $('#uploading-stream-thumb-template').html() ),

    post_initialize: function(){

        this.details = {
            stream_type: this.options.stream_type,
            latitude: this.options.latitude,
            longitude: this.options.longitude,
            spot: this.options.spot,
            venue_name: this.options.venue_name
        };

        switch (this.details.stream_type)
        {
            case "popular-nearby":
                this.collection.data = {
                    latitude: this.details.latitude,
                    longitude: this.details.longitude,
                    radius: 5000,
                    sort: "favorite_count"
                };
                break;
            case "recent-nearby":
                this.collection.data = {
                    latitude: this.details.latitude,
                    longitude: this.details.longitude,
                    radius: 5000
                };
                break;
            case "spot":
                this.collection.data = {
                    spot: this.details.spot
                };
                break;
        }
        this.collection.data.n = config.get('side_scroll_initial');

    }
});

return spot;

});
