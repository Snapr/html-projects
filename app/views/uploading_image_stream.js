snapr.views.uploading_image_stream = Backbone.View.extend({

    tagName: "li",

    className: "image-stream",

    initialize: function()
    {
        _.bindAll( this );

        this.template = _.template( $("#uploading-image-stream-template").html() );

        this.stream_type = this.options.stream_type;
        this.latitude = this.options.latitude;
        this.longitude = this.options.longitude;
        this.spot = this.options.spot;
        this.venue_name = this.options.venue_name;

        this.container = this.options.container;

        this.collection = new snapr.models.photo_collection();
        this.collection.url = snapr.api_base + "/search/";

        switch (this.stream_type)
        {
            case "popular-nearby":
                this.collection.data = {
                    latitude: this.latitude,
                    longitude: this.longitude,
                    radius: 5000,
                    sort: "favorite_count",
                    n: 6
                };
                break;
            case "recent-nearby":
                this.collection.data = {
                    latitude: this.latitude,
                    longitude: this.longitude,
                    radius: 5000,
                    n: 6
                };
                break;
            case "spot":
                this.collection.data = {
                    spot: this.spot,
                    n: 6
                };
                break;
        }

        this.collection.bind( "reset", this.render );
        this.collection.fetch();

    },

    render: function()
    {
        if (this.collection.length)
        {
            var first = this.collection.first();
            var param = _.clone(this.collection.data);
            delete param.access_token;
            if (first.attributes.location.foursquare_venue_name)
            {
                param.venue_name = first.attributes.location.foursquare_venue_name;
            }
            _.map( param, function( value, key )
            {
                param[key] = escape( value );
            });
            var query = $.param(param);
            var time = snapr.utils.short_timestamp( first.get("date") );
            var description = this.collection.first().get("description");
            this.$el.html( this.template({
                stream_type: this.stream_type,
                time: time,
                query: query,
                first: first.attributes
            }) );

            var $thumbs_grid = this.$el.find( ".thumbs-grid" );
            var thumb_template = _.template( $("#uploading-image-stream-image-template").html() );

            _.each( this.collection.models, function( photo )
            {
                var thumb = thumb_template({
                    photo: photo.attributes
                });
                $thumbs_grid.append( thumb );
            });

            $(this.container).append( this.el );
        }

        this.$el.trigger( "create" );

        return this;
    }
});