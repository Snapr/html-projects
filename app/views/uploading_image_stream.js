snapr.views.uploading_image_stream = snapr.views.side_scroll.extend({
    tagName: 'li',
    className: 'image-stream',
    template: _.template( $('#uploading-stream-template').html() ),
    thumbs_template: _.template( $('#uploading-stream-thumb-template').html() ),

    initialize: function()
    {
        //_.bindAll( this );

        this.details = {
            stream_type: this.options.stream_type,
            latitude: this.options.latitude,
            longitude: this.options.longitude,
            spot: this.options.spot,
            venue_name: this.options.venue_name
        };

        this.collection = new snapr.models.photo_collection();

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

        snapr.views.side_scroll.prototype.initialize.call(this);
    },

    // render: function()
    // {
    //     if (this.collection.length)
    //     {
    //         var first = this.collection.first();
    //         var param = _.clone(this.collection.data);
    //         delete param.access_token;
    //         if (first.attributes.location.foursquare_venue_name)
    //         {
    //             param.venue_name = first.attributes.location.foursquare_venue_name;
    //         }
    //         _.map( param, function( value, key )
    //         {
    //             param[key] = escape( value );
    //         });
    //         var query = $.param(param);
    //         var time = snapr.utils.short_timestamp( first.get("date") );
    //         var description = this.collection.first().get("description");
    //         this.$el.html( this.template({
    //             stream_type: this.stream_type,
    //             time: time,
    //             query: query,
    //             first: first.attributes
    //         }) );

    //         var $thumbs_grid = this.$el.find( ".thumbs-grid" );
    //         var thumb_template = _.template( $("#uploading-image-stream-image-template").html() );

    //         _.each( this.collection.models, function( photo )
    //         {
    //             var thumb = thumb_template({
    //                 photo: photo.attributes
    //             });
    //             $thumbs_grid.append( thumb );
    //         });

    //         $(this.container).append( this.el );
    //     }

    //     this.$el.trigger( "create" );

    //     return this;
    // }
});
