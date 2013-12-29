define(['views/map'], function(map_view){
    return map_view.extend({

   map_update_or_create: function () {

        if(this.map){
            // trigger a resize event so gmap doesn't think it has 0 width and height after being hidden in iphone
            google.maps.event.trigger(this.map, "resize");
            if(this.map_query.get('area')){  // area is used by location search to specify viewport
                this.map.fitBounds(this.map_query.get('area'));
            }else{
                this.go_to({
                    latitude: this.map_query.get('lat'),
                    longitude: this.map_query.get('lng')
                }, this.map_query.get('zoom'));
            }
            //this.current_location_go_to();
            return;
        }

        // or

        // create map...

        var map_settings = {
            zoom: this.map_query.get( "zoom" ),
            center: new google.maps.LatLng( this.map_query.get( "lat" ), this.map_query.get( "lng" ) ),
            streetViewControl: false,
            mapTypeControl: false,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            // hide local business markers
            styles: [{
                    featureType: "poi.business",
                    stylers: [
                        { visibility: "off" }
                    ]
                },
                {
                    featureType: "poi",
                    elementType: "labels",
                    stylers: [
                      { "visibility": "off" }
                    ]
                }
            ].concat(config.get('map_styles'))
        };

        this.map = new google.maps.Map($('.x-map')[0], map_settings);
        //this.current_location_go_to();

        // update thumbs when map moves
        var map_view = this;
        google.maps.event.addListener( map_view.map, "idle", function(){

            //don't bother if map is not visible
            if(map_view.hidden){ return; }

            var center = map_view.map.getCenter();
            map_view.map_query.set( {
                lat: center.lat(),
                lng: center.lng(),
                zoom: map_view.map.getZoom(),
                set: true  // this fires a change event the first time the map
                           // is idle even if the other attrs have not changed
                           // since the map was initialised
            });
        });
    },

    });
});
