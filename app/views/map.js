/*global _  define require google */
define(['config', 'backbone', 'views/base/page', 'collections/thumb', 'collections/spot', 'mobiscroll', 'utils/geo', 'utils/map', 'auth', 'utils/local_storage', 'utils/string', 'utils/alerts'],
function(config, Backbone, page_view, thumb_collection, spot_collection, mobiscroll, geo, map, auth, local_storage, string_utils, alerts){

var map_view = page_view.extend({

    post_initialize: function(){
        _.bindAll(this);

        this.$el.on('pageshow', function (e) {
            // hack to set google map height
            $("#google-map").css("height", (window.innerHeight - 85) + "px");
        });

        // store what's currently on the map so old thumbs can be removed
        this.thumb_overlays = {};
        this.spot_overlays = {};

        this.thumb_template = _.template($('#thumb-template').html());
        this.flag_template = _.template($('#flag-template').html());
        this.location_template = _.template($('#location-template').html());

        this.thumb_collection = new thumb_collection();
        this.spot_collection = new spot_collection();
    },

    // ignore these params in the url when arriving via history
    // so when you press back you are where you left the map, not
    // where it was initially (where the params specify)
    history_ignore_params: ['zoom', 'lat', 'lng', 'photo_id', 'location'],

    events: {
        "click .x-current-location": "go_to_current_location",
        "click #map-disambituation-cancel": "hide_dis",
        "click .x-map-feed": "map_feed",
        "change #map-filter": "filter_update",
        "submit #map-keyword": "keyword_search",
        "blur #map-keyword": "keyword_search",
        "click #map-keyword .ui-input-clear": "keyword_search_clear",
        "click .map-time-btn": "map_time"
    },

    post_activate: function(options){
        this.change_page();

        // sort params into map(display) and photo/spot(api)

        var photo_params = {},
            spot_params = {},
            map_params = {};

        _.each(options.query, function(v, k){
            if(k.slice(0,5) == 'spot_'){
                spot_params[k.slice(5)] = v;
            }else if(_(['lat', 'lng', 'zoom', 'location']).contains(k)){
                map_params[k] = v;
            }else{
                photo_params[k] = v;
            }
        });

        // map diaplay params come from query, local_storage and config in that
        // order
        map_params = _.defaults( map_params,
            local_storage.get('map_params') || {},
            { zoom:config.get('zoom') }
        );


        // create backbone models to store the params. This lets us bind
        // functions to changes
        this.photo_query = new Backbone.Model(photo_params);
        this.photo_query.on( "change", this.hide_no_results_message );
        this.photo_query.on( "change", this.get_thumbs );
        this.photo_query.on( "change", this.map_time_update_display );

        this.spot_query = new Backbone.Model(spot_params);
        this.spot_query.on( "change", this.hide_no_results_message );
        this.spot_query.on( "change", this.get_spots );

        this.map_query = new Backbone.Model(map_params);
        this.map_query.on( "change", this.hide_no_results_message );
        this.map_query.on( "change", this.get_thumbs );
        this.map_query.on( "change", this.get_spots );
        this.map_query.on( "change", this.save_map_query );  // keep in local_storage


        // map filter <select>
        this.photo_query.on( "change", this.filter_set_options );  // update what's selected and enabled
        auth.on( "change", this.filter_set_options );  // update what's enabled
        this.filter_set_options();  // set initial state


        // location search
        if(this.map_query.get('location')){
            this.location_search(this.map_query.get('location'));
            // the above will call update_or_create_map
            return this;
        }


        // if center is available from query or local_storage
        if (this.map_query.get( "lat" ) && this.map_query.get( "lng" )){
            this.update_or_create_map();
        }else{
            var map_view = this;
            geo.get_location(
                // success
                function( location ){
                    map_view.map_query.set({
                        lat: location.coords.latitude,
                        lng: location.coords.longitude
                    }, {silent:true});
                    map_view.update_or_create_map();
                },
                // error
                function(){
                    // show world
                    map_view.map_query.set({
                        lat: 42,
                        lng: 12,
                        zoom: 2
                    }, {silent:true});
                    map_view.update_or_create_map();
                }
            );
        }

        this.map_time_render();

        return this;
    },

    update_or_create_map: function () {

        // update map...

        if(this.map){
            console.log('update map', this.map_query);
            if(this.map_query.get('area')){  // area is used by location search to specify viewport
                this.map.fitBounds(this.map_query.get('area'));
            }else{
                this.go_to({
                    latitude: this.map_query.get('lat'),
                    longitude: this.map_query.get('lng')
                }, this.map_query.get('zoom'));
            }
            return;
        }

        // or

        // create map...
        console.log('create map');

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
            }]
        };

        this.map = new google.maps.Map(document.getElementById("google-map"), map_settings);

        // update thumbs when map moves
        var map_view = this;
        google.maps.event.addListener( map_view.map, "idle", function(){
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

    save_map_query: function(){
        local_storage.set('map_params', _(this.map_query.attributes).pick(['lat', 'lng', 'zoom']));
    },

    remove_overlays: function(overlays){

        _.each( this.thumb_overlays, function(thumb){
            if(!overlays || _(overlays).contains(thumb.data.id)){
                thumb.setMap(null);
            }
        });

        _.each( this.spot_overlays, function( spot ){
            spot.setMap(null);
        });
    },

    get_thumbs: function(){
        this.$el.addClass('loading');

        var old_thumb_ids = this.thumb_collection.pluck("id");

        this.thumb_collection.data = _.clone(this.photo_query.attributes);
        this.thumb_collection.data.area = this.map.getBounds().toUrlValue(4);
        if(this.photo_query.has('photo_id')){
            this.thumb_collection.data.n=1;
        }

        var map_view = this;

        // we are about to look for new thumbs, abort any old requests, they will no longer be needed
        try{ this.thumb_collection.current_query.abort(); }catch(e){}

        this.thumb_collection.current_query = this.thumb_collection.fetch({
            success: function( collection ){
                map_view.$el.removeClass('loading');

                var new_thumb_ids = map_view.thumb_collection.pluck("id");

                map_view.toggle_no_results_message(!new_thumb_ids.length);

                // remove thumbs not in the new set
                map_view.remove_overlays(_(old_thumb_ids).difference(new_thumb_ids));

                // add thumbs not in the old set
                _(map_view.thumb_collection.models).each(function( photo ){
                    var id = photo.get('id');
                    if(!_(old_thumb_ids).contains(id)){
                        map_view.thumb_overlays[id] = new map.overlays.Base(
                            photo.attributes,
                            map_view.map,
                            map_view.thumb_template
                        );
                    }
                });

                // update time display if in 'just one' mode now we have the
                // photo and know its date
                if(map_view.photo_query.has('photo_id')){ map_view.map_time_update_display(); }
            },
            error: function( e ){
                console.warn( "error getting thumbs", e );
            }
        });
    },

    get_spots: function(){},

    toggle_no_results_message: function(show){
        if(show !== true){ show = false; }
        this.$el.find("#snaprmapalert").toggle(show);
    },

    // TODO move these
    hide_dis: function(){
        this.$el.find("#map-disambiguation").hide();
    },

    show_dis: function (){
        this.$el.find("#map-disambiguation").show();
    },

    location_search: function( search_query ){
        var map_view = this;
        map.geocoder.geocode({
            "address": search_query
        },
        function( results, status ){
            if (status == google.maps.GeocoderStatus.OK){
                //if there is more than one result, show list
                if (results.length > 1){
                    var dis_list = $("#map-disambiguation-list").empty();
                    _.each( results, function( result ){
                        var li = new map_disambiguation({
                            result: result,
                            parent_view: map_view
                        });

                        dis_list.append(li.render().el);
                    });

                    map_view.show_dis();
                    dis_list.listview().listview("refresh");
                }else{
                    map_view.hide_dis();
                    map_view.map_query.set({
                        area: results[ 0 ].geometry.bounds,
                        location: null
                    }, {silent:true});
                    map_view.update_or_create_map();
                }
            }else{
                var again = confirm("Sorry, your search returned no results. Would you like to search again?");

                if(again) {
                    Backbone.history.navigate("/search");
                }
            }
        });
    },

    place_current_location: function(){
        var map_view = this;
        geo.get_location(function(location){
            map_view.dot = new map.overlays.Base( {
                location: {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude
                }},
                map_view.map,
                map_view.location_template
            );
        });
    },

    go_to: function(location, zoom){
        this.map.setZoom(zoom || config.get('zoom'));
        this.map.panTo( new google.maps.LatLng( location.latitude, location.longitude) );
    },

    // TODO
    go_to_current_location: function(){
        this.map_query.unset( "username", {silent: true} );
        this.map_query.unset( "group", {silent: true} );
        this.map_query.unset( "photo_id", {silent: true} );
        this.map_query.set( {n: 10}, {silent: true} );

        // save a reference for this view to be passed to callback functions
        var map_view = this;

        var success_callback = function( position ){
            map_view.go_to(position.coords);
            map_view.place_current_location();
        };

        var error_callback = function( error ){
            console.warn( "error getting geolocation", error );
            if (error.message){
                alerts.notification('Error', error.message );
            }
        };
        if (this.map){
            geo.get_location( success_callback, error_callback );
        }else{
            console.warn("map not initialized");
        }
    },

    map_feed: function(){
        if (this.map_query){
            var urlParams = this.photo_query.attributes;

            if (urlParams.access_token){
                delete urlParams.access_token;
            }
            // if (urlParams.date && urlParams.photo_id){
            //     delete urlParams.date;
            // }

            Backbone.history.navigate( "#/feed/?" + $.param( urlParams ) );
        }else{
            console.warn("map not initialized", this);
        }
        return this;
    },

    filter_update: function( e ){
        var filter = $(e.currentTarget).val();
        switch(filter) {
            case 'all':
                this.photo_query.unset( "username", {silent: true});
                this.photo_query.unset( "group", {silent: true});
                this.photo_query.unset( "photo_id", {silent: true});

                this.photo_query.trigger('change');
                break;
            case 'following':
                this.photo_query.unset( "username", {silent: true});
                this.photo_query.unset( "photo_id", {silent: true});

                this.photo_query.set({ group: "following" });
                break;
            case 'just-me':
                this.photo_query.unset( "group", {silent: true});
                this.photo_query.unset( "photo_id", {silent: true});

                this.photo_query.set({ username: "." });
                break;
            }
    },

    filter_set_options: function(){
        this.$("#map-filter option[value='just-me']").attr("disabled", !auth.has("snapr_user"));
        this.$("#map-filter option[value='following']").attr("disabled", !auth.has("snapr_user"));
        this.$("#map-filter option[value='just-one']").attr("disabled", !this.photo_query.has("photo_id"));

        if (this.photo_query.has( "photo_id" )){
            $("#map-filter").val("just-one").selectmenu('refresh', true);
        }else if (!this.photo_query.has( "username" ) && this.photo_query.get( "group" ) == "following"){
            $("#map-filter").val("following").selectmenu('refresh', true);
        }else if (this.photo_query.get( "username" ) == "." && !this.photo_query.has( "group" )){
            $("#map-filter").val("just-me").selectmenu('refresh', true);
        }else{
            $("#map-filter").val("all").selectmenu('refresh', true);
        }
    },

    keyword_search: function( keywords ){
        var input = this.$('#map-keyword').find("input");
        if(!_.isString(keywords)){
            keywords = input.val();
        }else{
            input.val(keywords);
        }
        this.photo_query.set({keywords: keywords});

        return this;
    },

    keyword_search_clear: function(){
        this.$('#map-keyword').find("input").val("");
        this.photo_query.unset( "keywords" );

        return this;
    },

    map_time_render: function(){

        var map_view = this;
        this.$(".map-time-btn").scroller({
            'cancelText': 'Set to Now',
            'headerText': false ,
            'preset': 'datetime',
            'setText': 'Set Time',
            'showLabel': false ,
            'theme': 'jqm',
            'jqmBody': 'b',
            'jqmSet': 'e',
            'jqmCancel': 'd',
            'dateFormat': 'yy-mm-dd',
            'timeFormat': 'HH:ii:00',
            'onSelect': function(value){
                map_view.photo_query.set({'date': value});
            },
            'onCancel': function(value, scroller, c){
                scroller.setValue(new Date());
                map_view.map_time_reset();
            }
        });

        return this;
    },

    map_time_update_display: function(){
        var time;
        if (this.photo_query.has("photo_id")){
            var photo = this.thumb_collection.get_photo_by_id( this.photo_query.get( "photo_id" ) );
            if (photo){
                time = photo.get( "date" );
            }
        }else{
            time = this.photo_query.get('date');
        }

        if (time){
            this.$(".map-time-btn").scroller('setDate', string_utils.convert_snapr_date(time));
            this.$(".map-time").find(".ui-bar").text( string_utils.short_timestamp( time, true) || "Now" );
        }else{
            this.$(".map-time-btn").scroller('setDate', new Date());
            this.$(".map-time").find(".ui-bar").text( "Now" );
        }

        return this;
    },

    map_time_reset: function(){
        this.photo_query.unset( "photo_id", {silent: true} );
        this.photo_query.unset( "date", {silent: true} );
        this.photo_query.trigger( "change" );

        return this;
    },

    map_time: function(){
        this.$(".map-time-btn").scroller('show');
        return this;
    }

});

var map_disambiguation = Backbone.View.extend({

    tagName: "li",
    template: _.template($("#map-disambiguation-li-template").html()),

    events: {
        "click .map-link": "goto_map"
    },

    initialize: function(){
        this.location = this.options.result;
        this.parent_view = this.options.parent_view;
    },

    render: function(){
        console.log(this, this.template);
        this.$el.html( this.template( {location: this.location} ) );
        return this;
    },

    goto_map: function(){
        this.parent_view.map_query.set('area', this.location.geometry.viewport);
        this.parent_view.update_or_create_map();
        this.parent_view.hide_dis();
    }
});

return map_view;
});
