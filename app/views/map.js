tripmapper.views.map = Backbone.View.extend({

    el: $("#map"),

    events: {
        "change #map-filter": "update_filter",
        "click #map-disambituation-cancel": "hide_dis"
    },

    initialize: function( init_options )
    {
        
        this.thumb_template = _.template( $('#thumb-template').html() );

        this.flag_template = _.template( $('#flag-template').html() );
        
        this.map_thumbs = [];
        this.map_flags = [];

        this.query = init_options.query;
        if (this.query.photo_id)
        {
            this.query.n = 1;
        }
        
        var center = new google.maps.LatLng(
            this.query.lat || 0,
            this.query.lng ||0
        );
        
        this.map_settings = {
            zoom: this.query.zoom||tripmapper.constants.default_zoom,
            center: center,
            streetViewControl: false,
            mapTypeControl: false,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        }

        $.mobile.changePage( "#map", {
            changeHash: false, 
            transition: 'flip'
        } );

        this.geocoder = new google.maps.Geocoder();


        if (this.map)
        {
            console.warn( "map already" );
            this.search_location( this.query.location );
        }
        else
        {
            console.warn( "create map" );
            this.create_map( this.query.location );
        }

        // this.render();
    },
    
    create_map: function( location )
    {
        this.map = new google.maps.Map(
            document.getElementById("google-map"),
            this.map_settings
        );
        
        this.map.snapr = {
            thumb_template: this.thumb_template,
            spot_template: this.spot_template
        }
        
        var map_view = this;
        
        // if(this.query.photo_id && this.query.lat && this.query.lng){
        //     this.place_pin();
        // }
        
        var b = google.maps.event.addListener( map_view.map, "bounds_changed", function()
        {
            // console.warn( 'bounds_changed' );
        });
        var z = google.maps.event.addListener( map_view.map, "zoom_changed", function()
        {
            // console.warn( 'zoom_changed' );
        });
        var idle = google.maps.event.addListener( map_view.map,"idle", function()
        {
            var query = map_view.thumb_collection && map_view.thumb_collection.data || false;
            // console.warn( 'idle get thumbs', query );
            map_view.get_thumbs( query );
        });
        
        if (location)
        {
            this.search_location( location );
        }

    },
    
    place_pin: function( lat, lng )
    {
        lat = lat || this.query.lat;
        lng = lng || this.query.lng;
        var marker = new google.maps.Marker({  
            position: new google.maps.LatLng(lat, lng),
            map: this.map,
            title: 'My workplace',
            clickable: false
        });
    },
    
    remove_overlays: function()
    {
        _.each( this.map_thumbs, function(thumb)
        {
            thumb.setMap(null);
        });

        _.each( this.map_spots, function(spot)
        {
            spot.setMap(null);
        });

    },
    
    get_thumbs: function( query )
    {
        this.thumb_collection = new tripmapper.models.thumb_collection;
        this.thumb_collection.data = query || this.query;
        this.thumb_collection.data.area = this.map.getBounds().toUrlValue(4);
        // if(!query){
        //     var query = this.query;
        // }
        var map_view = this;
        this.thumb_collection.fetch({
            success: function(s)
            {
                map_view.remove_overlays();
                
                _.each( map_view.thumb_collection.models , function(thumb, i)
                {
                    map_view.map_thumbs[i] = new tripmapper.SnapOverlay('photo', thumb.attributes, map_view.map, false);
                });
            },
            error:function(e)
            {
                console.warn('error',e);
            }
        });
    },
    
    hide_dis: function()
    {
        this.el.find("#map-disambiguation").hide();
    },
    
    show_dis: function()
    {
        this.el.find("#map-disambiguation").show();
    },
    
    search_location: function( search_query )
    {

        var map_view = this;
        this.geocoder.geocode({"address": search_query}, function( results, status )
        {
            if (status == google.maps.GeocoderStatus.OK)
            {
                //if there is more than one result, show list
                if (results.length > 1)
                {
                    var li_template = _.template( $("#map-disambiguation-li-template").html() );
                    var dis_list = $("#map-disambiguation-list").empty();
                    _.each( results, function( result )
                    {
                        var li = new tripmapper.views.map_disambiguation_li({
                            result: result,
                            template: li_template,
                            map: map_view.map,
                            parent_view: map_view
                        });

                        dis_list.append( li.render().el );
                    });
                    
                    map_view.show_dis();
                    dis_list.listview().listview("refresh");
                }
                else
                {
                    map_view.hide_dis();
                    map_view.map.fitBounds(results[0].geometry.bounds);
                }
            }
            else
            {
                var again = confirm( "Sorry, your search returned no results. Would you like to search again?");

                if (again)
                {
                    Route.navigate( "/search", true);
                }
            }
        });
    },
    
    update_filter: function()
    {
        var filter = $('#map-filter').val();
        switch (filter)
        {
            case 'all':
                var query = {
                    n: 10
                };
                break;
            case 'following':
                var query = {
                    group: 'following',
                    n: 10
                };
                break;
            case 'just-me':
                var query = {
                    username: '.',
                    n: 10
                };
                break;
            case 'just-one':
                var query = {
                    n: 1
                };
                break;
        }
        
        this.get_thumbs( query );
    }
})