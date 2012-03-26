snapr.views.map = Backbone.View.extend({

    el: $("#map"),

    events: {
        "click .x-current-location": "go_to_current_location",
        "click #map-disambituation-cancel": "hide_dis",
        "click .x-map-feed": "map_feed"
    },

    initialize: function () {
        _.bindAll( this );

        $.mobile.changePage("#map", {
            changeHash: false,
            transition: 'flip'
        });

        this.thumb_template = _.template($('#thumb-template').html());

        this.flag_template = _.template($('#flag-template').html());

        this.thumb_collection = new snapr.models.thumb_collection();

        this.map_thumbs = [];
        this.map_flags = [];

        var query = this.options.query;
        if (query.photo_id) {
            query.n = 1;
        }

        // create a backbone model to store the current map query
        // this lets us bind functions to changes and pass the query to subviews
        this.map_query = new Backbone.Model(query);
        this.map_query.bind( "change", this.get_thumbs )

        this.map_settings = {
            zoom: this.map_query.get( "zoom" ) ||
                parseInt(snapr.utils.get_local_param('map_zoom')) ||
                snapr.constants.default_zoom,
            streetViewControl: false,
            mapTypeControl: false,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        if (this.map_query.get( "lat" ) && this.map_query.get( "lng" )){
            this.map_settings.center = new google.maps.LatLng( this.map_query.get( "lat" ), this.map_query.get( "lng" ) );
        }
        else if (snapr.utils.get_local_param('map_latitude') && snapr.utils.get_local_param('map_longitude'))
        {
            this.map_settings.center = new google.maps.LatLng( snapr.utils.get_local_param('map_latitude'), snapr.utils.get_local_param('map_longitude') );
        }

        // todo set this in subview
        // if (this.query.keywords)
        // {
        //     $(this.el).find("#map-keyword input").val(this.query.keywords);
        // }

        this.geocoder = new google.maps.Geocoder();

        if(this.map)
        {
            if (this.map_query.get( "location" ))
            {
                this.search_location( this.map_query.get( "location" ) );
            }
            else
            {
                this.go_to_current_location();
            }
        }
        else
        {
            var map_view = this;
            var success_callback = function(location){
                map_view.map_settings.center = new google.maps.LatLng(location.coords.latitude, location.coords.longitude);
                map_view.create_map(map_view.query.location);
            };
            var error_callback = function(){
                map_view.map_settings.center = new google.maps.LatLng(42, 12);
                map_view.create_map(map_view.query.location);
            };

            if(this.map_settings.center === undefined){
                snapr.geo.get_location( success_callback, error_callback );
            }else{
                this.create_map( this.map_query.get( "location" ) );
            }
        }

        this.map_controls = new snapr.views.map_controls({
            el: $(this.el).find(".v-map-controls"),
            model: this.map_query,
            collection: this.thumb_collection
        })

        var map_view = this;

        this.el.live('pagehide', function (e) {
            google.maps.event.clearListeners( map_view.map, "idle" );
            $(e.target).undelegate();
            return true;
        });

    },

    create_map: function (location) {
        this.map = new google.maps.Map(
            document.getElementById("google-map"), this.map_settings);

        this.map.snapr = {
            thumb_template: this.thumb_template,
            spot_template: this.spot_template
        };

        // hack to set google map height
        $("#google-map").css("height", (window.innerHeight - 85) + "px");

        var map_view = this;

        console.log('listening');
        var idle = google.maps.event.addListener( map_view.map, "idle", function()
        {
            map_view.map_query.set( {
                area: map_view.map.getBounds().toUrlValue(4),
                zoom: map_view.map.getZoom()
            });
            // remember location
            console.log('saving location');
            snapr.utils.save_local_param('map_zoom', map_view.map.getZoom());
            var ll = map_view.map.getCenter();
            snapr.utils.save_local_param('map_latitude', ll.lat());
            snapr.utils.save_local_param('map_longitude', ll.lng());
        });

        if (location)
        {
            this.search_location( location );
        }
    },

    place_pin: function( lat, lng )
    {
        lat = lat || this.map_query.get( "lat" );
        lng = lng || this.map_query.get( "lng" );
        var marker = new google.maps.Marker({
            position: new google.maps.LatLng( lat, lng ),
            map: this.map,
            title: 'My workplace',
            clickable: false
        });
    },

    remove_overlays: function()
    {
        _.each( this.map_thumbs, function( thumb )
        {
            thumb.setMap(null);
        });

        _.each( this.map_spots, function( spot )
        {
            spot.setMap( null );
        });
    },

    get_thumbs: function( query_model )
    {
        var query = query_model && query_model.attributes || this.map_query.attributes;

        var old_thumb_ids = this.thumb_collection.pluck("id");

        if (query.location)
        {
            delete query.location;
        }
        this.thumb_collection.data = query;
        this.thumb_collection.data.area = this.map.getBounds().toUrlValue(4);
        var map_view = this;
        this.thumb_collection.fetch({
            success: function( s )
            {
                if (_.difference( map_view.thumb_collection.pluck("id"), old_thumb_ids ).length)
                {
                    map_view.remove_overlays();

                    _.each(map_view.thumb_collection.models, function( thumb, i )
                    {
                        map_view.map_thumbs[ i ] = new snapr.SnapOverlay( 'photo', thumb.attributes, map_view.map, false );
                    });
                }
                else if (map_view.thumb_collection.length == 0)
                {
                    map_view.remove_overlays();
                }
                else
                {
                    console.log( "same thumbs" )
                }
            },
            error: function( e )
            {
                console.log( "error getting thumbs", e );
            }
        });
    },

    hide_dis: function() {
        this.el.find("#map-disambiguation").hide();
    },

    show_dis: function () {
        this.el.find("#map-disambiguation").show();
    },

    search_location: function( search_query )
    {
        var map_view = this;
        this.geocoder.geocode({
            "address": search_query
        },
        function( results, status )
        {
            if (status == google.maps.GeocoderStatus.OK)
            {
                //if there is more than one result, show list
                if (results.length > 1)
                {
                    var li_template = _.template($("#map-disambiguation-li-template").html());
                    var dis_list = $("#map-disambiguation-list").empty();
                    _.each( results, function( result )
                    {
                        var li = new snapr.views.map_disambiguation_li({
                            result: result,
                            template: li_template,
                            map: map_view.map,
                            parent_view: map_view
                        });

                        dis_list.append(li.render().el);
                    });

                    map_view.show_dis();
                    dis_list.listview().listview("refresh");
                }
                else
                {
                    map_view.hide_dis();
                    map_view.map.fitBounds( results[ 0 ].geometry.bounds );
                }
            }
            else
            {
                var again = confirm("Sorry, your search returned no results. Would you like to search again?");

                if(again) {
                    Route.navigate("/search", true);
                }
            }
        });
    },

    place_current_location: function()
    {
        if (this.marker)
        {
            this.marker.setMap( null );
        }
        this.marker = new google.maps.Marker({
            position: new google.maps.LatLng( this.map_query.get( "lat" ), this.map_query.get( "lng" )),
            map: this.map,
            title: 'Current location',
            clickable: false,
            icon: './gfx/map-current-location-marker.png'
        });
        setTimeout( this.place_current_location, 30000 );
    },

    go_to_current_location: function()
    {
        // save a reference for this view to be passed to callback functions
        var map_view = this;

        var success_callback = function( position )
        {
            map_view.map.setZoom(snapr.constants.default_zoom);
            map_view.map.panTo( new google.maps.LatLng( position.coords.latitude, position.coords.longitude) );
            map_view.lat = position.coords.latitude;
            map_view.lng = position.coords.longitude;
            map_view.place_current_location();
        }

        var error_callback = function( error )
        {
            console.warn( "error getting geolocation", error );
            alert( error.message )
        }
        if (this.map)
        {
            snapr.geo.get_location( success_callback, error_callback );
        }
        else
        {
            console.warn("map not initialized");
        }
    },

    clear_keyword_search: function()
    {
        this.map_query.unset( "keywords" );
    },

    map_feed: function()
    {
        if (this.map_query)
        {
            var urlParams = this.map_query.attributes;

            if (urlParams.access_token)
            {
                delete urlParams.access_token;
            }
            Route.navigate( "#/feed/?" + $.param(urlParams), true );
        }
        else
        {
            console.warn("map not initialized", this);
        }
    }
});
