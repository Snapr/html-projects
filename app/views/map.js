snapr.views.map = Backbone.View.extend({

    el: $("#map"),

    events: {
        "click .x-current-location": "go_to_current_location",
        "change #map-filter": "update_filter",
        "click #map-disambituation-cancel": "hide_dis",
        "submit #map-keyword": "keyword_search",
        "blur #map-keyword": "keyword_search",
        "click #map-keyword .ui-input-clear": "clear_keyword_search",
        "click .x-map-feed": "map_feed"
    },

    initialize: function () {
        _.bindAll( this );

        this.el.live('pagehide', function (e) {
            $(e.target).undelegate();

            return true;
        });

        this.thumb_template = _.template($('#thumb-template').html());

        this.flag_template = _.template($('#flag-template').html());

        this.map_thumbs = [];
        this.map_flags = [];

        this.query = this.options.query;
        if(this.query.photo_id) {
            this.query.n = 1;
        }

        this.map_settings = {
            zoom: parseInt(snapr.utils.get_local_param('map_zoom')) || this.query.zoom || snapr.constants.default_zoom,
            streetViewControl: false,
            mapTypeControl: false,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        if (this.query.lat && this.query.lng){
            this.map_settings.center = new google.maps.LatLng( this.query.lat, this.query.lng );
        }
        else if (snapr.utils.get_local_param('map_latitude'))
        {
            this.map_settings.center = new google.maps.LatLng( snapr.utils.get_local_param('map_latitude'), snapr.utils.get_local_param('map_longitude') );
        }

        if (this.query.keywords)
        {
            $(this.el).find("#map-keyword input").val(this.query.keywords);
        }

        $.mobile.changePage("#map", {
            changeHash: false,
            // transition: 'flip'
        });

        this.geocoder = new google.maps.Geocoder();

        if(this.map)
        {
            if (this.query.location)
            {
                this.search_location(this.query.location);
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
                this.create_map( this.query.location );
            }
        }

        // this.render();
    },

    create_map: function (location) {
        this.map = new google.maps.Map(
            document.getElementById("google-map"), this.map_settings);

        this.map.snapr = {
            thumb_template: this.thumb_template,
            spot_template: this.spot_template
        };

        // hack to set google map height
        $("#google-map").css("height", (window.innerHeight - 150) + "px");

        var map_view = this;

        // if(this.query.photo_id && this.query.lat && this.query.lng){
        //     this.place_pin();
        // }
        // var b = google.maps.event.addListener(map_view.map, "bounds_changed", function () {
        //     console.log( 'bounds_changed' );
        // });
        // var z = google.maps.event.addListener(map_view.map, "zoom_changed", function () {
        //     console.log( 'zoom_changed' );
        // });
        console.log('listening');
        var idle = google.maps.event.addListener(map_view.map, "idle", function () {
            var query = map_view.thumb_collection && map_view.thumb_collection.data || false;
            console.log( 'idle get thumbs', query );
            map_view.get_thumbs(query);

            // remember location
            console.log('saving location');
            snapr.utils.save_local_param('map_zoom', map_view.map.getZoom());
            var ll = map_view.map.getCenter();
            snapr.utils.save_local_param('map_latitude', ll.lat());
            snapr.utils.save_local_param('map_longitude', ll.lng());
        });

        if(location) {
            this.search_location(location);
        }

    },

    place_pin: function (lat, lng) {
        lat = lat || this.query.lat;
        lng = lng || this.query.lng;
        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(lat, lng),
            map: this.map,
            title: 'My workplace',
            clickable: false
        });
    },

    remove_overlays: function () {
        _.each(this.map_thumbs, function (thumb) {
            thumb.setMap(null);
        });

        _.each(this.map_spots, function (spot) {
            spot.setMap(null);
        });

    },

    get_thumbs: function (query) {
        query = query || this.query;
        this.thumb_collection = this.thumb_collection || new snapr.models.thumb_collection();

        var old_thumb_ids = this.thumb_collection.pluck("id");

        if (this.query.location)
        {
            delete this.query.location;
        }
        this.thumb_collection.data = query || this.query;
        this.thumb_collection.data.area = this.map.getBounds().toUrlValue(4);
        var map_view = this;
        this.thumb_collection.fetch({
            success: function (s) {
                if (_.difference( map_view.thumb_collection.pluck("id"), old_thumb_ids ).length)
                {
                    map_view.remove_overlays();

                    _.each(map_view.thumb_collection.models, function (thumb, i) {
                        map_view.map_thumbs[i] = new snapr.SnapOverlay('photo', thumb.attributes, map_view.map, false);
                    });
                }
                else
                {
                    console.log("same thumbs")
                }

            },
            error: function (e) {
                console.log('error', e);
            }
        });
    },

    hide_dis: function () {
        this.el.find("#map-disambiguation").hide();
    },

    show_dis: function () {
        this.el.find("#map-disambiguation").show();
    },

    search_location: function (search_query) {

        var map_view = this;
        this.geocoder.geocode({
            "address": search_query
        }, function (results, status) {
            if(status == google.maps.GeocoderStatus.OK) {
                //if there is more than one result, show list
                if(results.length > 1) {
                    var li_template = _.template($("#map-disambiguation-li-template").html());
                    var dis_list = $("#map-disambiguation-list").empty();
                    _.each(results, function (result) {
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
                } else {
                    map_view.hide_dis();
                    map_view.map.fitBounds(results[0].geometry.bounds);
                }
            } else {
                var again = confirm("Sorry, your search returned no results. Would you like to search again?");

                if(again) {
                    Route.navigate("/search", true);
                }
            }
        });
    },

    update_filter: function () {
        var filter = $('#map-filter').val(),
            query;
        switch(filter) {
            case 'all':
                query = {
                    n: 10
                };
                break;
            case 'following':
                query = {
                    group: 'following',
                    n: 10
                };
                break;
            case 'just-me':
                query = {
                    username: '.',
                    n: 10
                };
                break;
            case 'just-one':
                query = {
                    n: 1
                };
                break;
            }

        this.get_thumbs(query);
    },

    place_current_location: function()
    {
        if(this.marker)
        {
            this.marker.setMap( null );
        }
        this.marker = new google.maps.Marker({
            position: new google.maps.LatLng(this.query.lat, this.query.lng),
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

    keyword_search: function( e )
    {
        if ($(e.currentTarget).find("input").val() != (this.query.keywords || ""))
        {
            if ($(e.currentTarget).find("input").val())
            {
                this.query.keywords = $(e.currentTarget).find("input").val();
                this.get_thumbs();
            }
            else
            {
                delete this.query.keywords;
                this.get_thumbs();
            }
        }
    },

    clear_keyword_search: function()
    {
        delete this.query.keywords;
        this.get_thumbs();
    },

    map_feed: function()
    {
        if (this.map)
        {
            var urlParams = _.clone( this.query );

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
