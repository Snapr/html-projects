snapr.views.map = snapr.views.page.extend({

    initialize: function()
    {
        snapr.views.page.prototype.initialize.call( this );

        var query = this.options.query || {};

        if (query.photo_id)
        {
            query.n = 1;
        }
        else{
          query.n = 10;
        }

        var map_view = this;
        this.$el.die('pageshow');
        this.$el.live('pageshow', function (e) {
            map_view.when_page_showen();
        });

        this.change_page({
            transition: 'flip'
        });

        this.thumb_template = _.template($('#thumb-template').html());

        this.flag_template = _.template($('#flag-template').html());

        this.location_template = _.template($('#location-template').html());

        this.thumb_collection = new snapr.models.thumb_collection();

        this.map_thumbs = [];
        this.map_flags = [];

        // create a backbone model to store the current map query
        // this lets us bind functions to changes and pass the query to subviews
        this.map_query = new Backbone.Model(query);
        this.map_query.bind( "change", this.hide_no_results_message );
        this.map_query.bind( "change", this.get_thumbs );

        // I doubt this could ever happen, isn't initialize only called when the object is created?
        // if(this.map){
        //     console.log("########### map exists ##########");
        //     if (this.map_query.get( "location" )){
        //         this.search_location( this.map_query.get( "location" ) );
        //     }else{
        //         this.go_to_current_location();
        //     }
        // }else{
        //     console.log("no map");
        // }
        this.load_maps_then();

        this.map_controls = new snapr.views.map_controls({
            el: this.$el.find(".v-map-controls")[0],
            model: this.map_query,
            collection: this.thumb_collection
        });
    },
    events: {
        "click .x-current-location": "go_to_current_location",
        "click #map-disambituation-cancel": "hide_dis",
        "click .x-map-feed": "map_feed"
    },
    load_maps_then: function(){

        // load maps libs if needed then callback to here
        if(!window.google || !window.google.maps){
            console.debug('no maps lib, loading it');
            window.gmap_script_loaded = _.bind(this.load_maps_then, this);
            // this loads the google loader script with the maps lib autoloaded with a callback to gmap_script_loaded
            // {"modules":[{"name":"maps","version":"3.x","callback":"gmap_script_loaded",'other_params':"sensor=false"}]}
            $(document.body).append($('<script src="https://www.google.com/jsapi?autoload=%7B%22modules%22%3A%5B%7B%22name%22%3A%22maps%22%2C%22version%22%3A%223.x%22%2C%22callback%22%3A%22gmap_script_loaded%22%2C\'other_params\'%3A%22sensor%3Dfalse%22%7D%5D%7D"></script>'));
            return;
        }
        console.debug('maps lib loaded');

        var map_view = this;

        // this will only run once.
        map_view.create_custom_overlays();

        map_view.map_settings = {
            zoom: map_view.map_query.get( "zoom" ) ||
                parseInt(snapr.utils.get_local_param('map_zoom')) ||
                snapr.constants.default_zoom,
            streetViewControl: false,
            mapTypeControl: false,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        if (map_view.map_query.get( "lat" ) && map_view.map_query.get( "lng" )){
            map_view.map_settings.center = new google.maps.LatLng( map_view.map_query.get( "lat" ), map_view.map_query.get( "lng" ) );
        }else if (snapr.utils.get_local_param('map_latitude') && snapr.utils.get_local_param('map_longitude')){
            map_view.map_settings.center = new google.maps.LatLng( snapr.utils.get_local_param('map_latitude'), snapr.utils.get_local_param('map_longitude') );
        }

        map_view.geocoder = new google.maps.Geocoder();

        // this might be ready to run now - it will decide for itself
        map_view.maps_loaded = true;
        map_view.when_page_showen_and_maps_loaded();

        map_view.$el.die('pagehide');
        map_view.$el.live('pagehide', function (e) {
            google.maps.event.clearListeners( map_view.map, "idle" );
            return true;
        });
    },
    when_page_showen: function(){
        this.page_shown = true;

        // hack to set google map height
        $("#google-map").css("height", (window.innerHeight - 85) + "px");

        // this might be ready to run now - it will decide for itself
        this.when_page_showen_and_maps_loaded();
    },
    when_page_showen_and_maps_loaded: function(){

        // don't run if not ready - anything becoming ready will re-call this function
        if(!this.maps_loaded || !this.page_shown){ return; }

        //only run once
        if(this.page_showen_and_maps_loaded){ return; }
        this.page_showen_and_maps_loaded = true;

        var map_view = this;

        if (map_view.map_settings.center === undefined){
            snapr.geo.get_location(
                // success
                function( location ){
                    map_view.map_settings.center = new google.maps.LatLng(location.coords.latitude, location.coords.longitude);
                    map_view.create_map(map_view.query && map_view.query.location);
                },
                // error
                function(){
                    map_view.map_settings.center = new google.maps.LatLng(42, 12);
                    map_view.map_settings.zoom = 2;
                    map_view.create_map(map_view.query && map_view.query.location);
                }
            );
        }else{
            map_view.create_map( map_view.map_query.get( "location" ) );
        }
    },

    create_map: function (location) {

        var map_view = this;

        this.map = new google.maps.Map(
            document.getElementById("google-map"), this.map_settings);

        snapr.geo.get_location(function(location){
            map_view.dot = new snapr.CurrentLocation( {
                location: {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude
                }},
                map_view.map );
        });

        this.map.snapr = {
            thumb_template: this.thumb_template,
            spot_template: this.spot_template,
            location_template: this.location_template
        };


        var idle = google.maps.event.addListener( map_view.map, "idle", function()
        {
            map_view.map_query.set( {
                area: map_view.map.getBounds().toUrlValue(4),
                zoom: map_view.map.getZoom()
            });
            // remember location
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

    // surely this isn't used, it looks like example code
    // place_pin: function( lat, lng )
    // {
    //     lat = lat || this.map_query.get( "lat" );
    //     lng = lng || this.map_query.get( "lng" );
    //     var marker = new google.maps.Marker({
    //         position: new google.maps.LatLng( lat, lng ),
    //         map: this.map,
    //         title: 'My workplace',
    //         clickable: false
    //     });
    // },

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
        this.$el.addClass('loading');
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
            success: function( collection )
            {
                map_view.$el.removeClass('loading');
                if (_.difference( map_view.thumb_collection.pluck("id"), old_thumb_ids ).length)
                {

                    map_view.remove_overlays();

                    if (map_view.thumb_collection.length)
                    {
                        map_view.hide_no_results_message();
                    }
                    else
                    {
                        map_view.show_no_results_message();
                    }
                    _.each(map_view.thumb_collection.models, function( thumb, i )
                    {
                        map_view.map_thumbs[ i ] = new snapr.SnapOverlay( 'photo', thumb.attributes, map_view.map, false );
                    });
                }
                else if (map_view.thumb_collection.length === 0)
                {
                    map_view.show_no_results_message();
                    map_view.remove_overlays();
                }
            },
            error: function( e )
            {
                console.log( "error getting thumbs", e );
            }
        });
    },

    show_no_results_message: function()
    {
        this.$el.find("#snaprmapalert").show();
    },

    hide_no_results_message: function()
    {
        this.$el.find("#snaprmapalert").hide();
    },

    hide_dis: function()
    {
        this.$el.find("#map-disambiguation").hide();
    },

    show_dis: function ()
    {
        this.$el.find("#map-disambiguation").show();
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
                    Route.navigate("/search");
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
            clickable: false
        });
        setTimeout( this.place_current_location, 30000 );
    },

    go_to_current_location: function()
    {
        this.map_query.unset( "username", {silent: true} );
        this.map_query.unset( "group", {silent: true} );
        this.map_query.unset( "photo_id", {silent: true} );
        this.map_query.set( {n: 10}, {silent: true} );

        // save a reference for this view to be passed to callback functions
        var map_view = this;

        var success_callback = function( position )
        {
            map_view.map.setZoom(snapr.constants.default_zoom);
            map_view.map.panTo( new google.maps.LatLng( position.coords.latitude, position.coords.longitude) );
            map_view.lat = position.coords.latitude;
            map_view.lng = position.coords.longitude;
            map_view.place_current_location();
        };

        var error_callback = function( error )
        {
            console.warn( "error getting geolocation", error );
            if (error.message)
            {
                alert( error.message );
            }
        };
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
            if (urlParams.zoom)
            {
                delete urlParams.zoom;
            }
            if (urlParams.lat)
            {
                delete urlParams.lat;
            }
            if (urlParams.lng)
            {
                delete urlParams.lng;
            }
            if (urlParams.date)
            {
                urlParams.date = escape(urlParams.date);
            }

            urlParams.back = "Map";
            Route.navigate( "#/feed/?" + $.param( urlParams ) );
        }
        else
        {
            console.warn("map not initialized", this);
        }
    },
    create_custom_overlays: function(){
        // no need to do this more than once:
        if( snapr.SnapOverlay ){ return; }

        snapr.SnapOverlay = function(type, data, map, extra_class)
        {
            // image as JS object in format the snapr api returns
            this.type_ = type;
            this.data_ = data;
            this.map_ = map;
            this.extra_class_ = extra_class;

            // We define a property to hold the image's
            // div. We'll actually create this div
            // upon receipt of the add() method so we'll
            // leave it null for now.
            this.div_ = null;

            // Explicitly call setMap() on this overlay
            this.setMap(map);
        };

        snapr.SnapOverlay.prototype = new google.maps.OverlayView();
        snapr.SnapOverlay.prototype.get_div = function(){
            var data_id = this.data_.id;

            if (this.type_ == 'photo') {
                return $(this.map.snapr.thumb_template({photo:this.data_})).show();
            } else {  //spot
                return $(this.map.snapr.spot_template({spot:this.data_})).show();
            }

        };
        snapr.SnapOverlay.prototype.onAdd = function()
        {
            this.added = true;  // google maps sometimes tries to draw a point that hasn't been added - keep track
            // Note: an overlay's receipt of onAdd() indicates that
            // the map's panes are now available for attaching
            // the overlay to the map via the DOM.

            var div = this.get_div();

            // Set the overlay's div_ property to this DIV
            this.div_ = div;

            // We add an overlay to a map via one of the map's panes.
            // We'll add this overlay to the overlayImage pane.
            var panes = this.getPanes();
            $(panes.floatPane).append(this.div_);
        };
        snapr.SnapOverlay.prototype.draw = function(){
            // google maps sometimes foolishly tries to draw a point that hasn't
            // been added - so add it before confinuing.
            if(!this.added){
                this.onAdd();
            }
            var overlayProjection = this.getProjection();
            var position = new google.maps.LatLng( this.data_.location.latitude, this.data_.location.longitude );
            var px = overlayProjection.fromLatLngToDivPixel( position );

            this.div_ = this.div_
                .css('position', 'absolute')
                .css('left', px.x + 'px')
                .css('top', px.y + 'px');
        };
        snapr.SnapOverlay.prototype.onRemove = function()
        {
            $(this.div_).remove();
            this.div_ = null;
        };
        snapr.SnapOverlay.prototype.hide = function()
        {
            if (this.div_)
            {
              this.div_.style.visibility = "hidden";
            }
        };
        snapr.SnapOverlay.prototype.show = function()
        {
            if (this.div_)
            {
              this.div_.style.visibility = "visible";
            }
        };
        snapr.SnapOverlay.prototype.toggle = function()
        {
            if (this.div_)
            {
              if (this.div_.style.visibility == "hidden")
              {
                this.show();
              }
              else
              {
                this.hide();
              }
            }
        };
        snapr.SnapOverlay.prototype.toggleDOM = function()
        {
            if (this.getMap())
            {
              this.setMap( null );
            }
            else
            {
              this.setMap( this.map_ );
            }
        };

        snapr.CurrentLocation = function(data, map){
            snapr.SnapOverlay.call(this, undefined, data, map);
        };
        snapr.CurrentLocation.prototype=_.clone(snapr.SnapOverlay.prototype);
        snapr.CurrentLocation.prototype.get_div = function()
        {
            return $(this.map.snapr.location_template()).show();
        };
    }
});
