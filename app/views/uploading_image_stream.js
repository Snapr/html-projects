/*global _ Route define require */
define(['backbone', 'views/base/side_scroll', 'collections/photo'], function(Backbone, side_scroll, photo_collection){
return side_scroll.extend({
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

    }
});
});
