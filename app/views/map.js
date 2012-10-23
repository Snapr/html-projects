/*global _  define require google */
define(['config', 'backbone', 'views/base/view', 'views/base/page', 'collections/thumb', 'collections/spot', 'models/spot', 'mobiscroll', 'utils/geo', 'utils/map', 'auth', 'utils/local_storage', 'utils/string', 'utils/alerts'],
function(config, Backbone, view, page_view, thumb_collection, spot_collection, spot_model, mobiscroll, geo, map, auth, local_storage, string_utils, alerts){

var map_view = page_view.extend({

    post_initialize: function(){
        _.bindAll(this);

        var map_view = this;
        this.$el.on('pageshow', function (e) {
            map_view.hidden=false;
            // hack to set google map height
            $(".x-map").css("height", (window.innerHeight - 85) + "px");
        });

        this.$el.on('pagehide', function (e) {
            map_view.hidden=true;
        });

        // store what's currently on the map so old thumbs can be removed
        this.thumb_overlays = {};
        this.spot_overlays = {};

        this.thumb_template = this.get_template('components/map/image');
        this.flag_template = this.get_template('components/map/flag');
        this.location_template = this.get_template('components/map/location');
        this.spot_template = this.get_template('components/map/spot');

        this.thumb_collection = new thumb_collection();
        this.spot_collection = new spot_collection();
    },

    // ignore these params in the url when arriving via history
    // so when you press back you are where you left the map, not
    // where it was initially (where the params specify)
    history_ignore_params: ['zoom', 'lat', 'lng', 'photo_id', 'location'],

    events: {
        "click .x-current-location": "current_location_go_to",
        "click .x-disambituation-cancel": "location_search_toggle_disambiguation",
        "click .x-map-feed": "map_feed",
        "change .x-filter": "filter_update",
        "change .x-show-photos, .x-show-spots": "layers_update",
        "submit .x-search": "keyword_search",
        "blur .x-search": "keyword_search",
        "click .x-search .ui-input-clear": "keyword_search_clear",
        "click .x-time-btn": "map_time",
        "click .x-venue-pin" : "toggle_spot_label"
    },

    post_activate: function(options){
        this.change_page();
        $.mobile.showPageLoadingMsg();

        // sort params into map(display) and photo/spot(api)

        var photo_params = {},
            spot_params = {},
            map_params = {};

        _.each(options.query, function(v, k){
            if(k.slice(0,5) == 'spot_'){
                spot_params[k.slice(5)] = v;
            }else if(_(['lat', 'lng', 'zoom', 'location', 'show_spots', 'show_photos']).contains(k)){
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

        // photo_params may have been saved in local_storage
        photo_params = _.defaults( photo_params,
            local_storage.get('map_photo_params') || {},
            { n:config.get('map_count') }
        );

        // if neither are set default to photos
        if (!map_params.show_photos && !map_params.show_spots) {
            map_params.show_photos = true;
        }

        // Single mode
        if (photo_params.photo_id) {
            map_params.show_spots = false;
            map_params.show_photos = true;
        }
        if (spot_params.id) {
            map_params.show_photos = false;
            map_params.show_spots = true;
        }

        // create backbone models to store the params. This lets us bind
        // functions to changes
        this.photo_query = new Backbone.Model(photo_params);
        this.photo_query.on( "change", this.no_results_message_toggle );
        this.photo_query.on( "change", this.thumbs_get );
        this.photo_query.on( "change", this.map_time_update_display );
        this.photo_query.on( "change", this.photo_query_save );  // keep in local_storage

        this.spot_query = new Backbone.Model(spot_params);
        this.spot_query.on( "change", this.no_results_message_toggle );
        this.spot_query.on( "change", this.spots_get );
        this.spot_query.on( "change", this.spot_query_save );  // keep in local_storage

        this.map_query = new Backbone.Model(map_params);
        this.map_query.on( "change", this.no_results_message_toggle );
        this.map_query.on( "change", this.thumbs_get );
        this.map_query.on( "change", this.spots_get );
        this.map_query.on( "change", this.layers_set ); // update the layer toggle in header
        this.map_query.on( "change", this.map_query_save );  // keep in local_storage


        // map filter <select>
        this.photo_query.on( "change", this.filter_set_options );  // update what's selected and enabled
        auth.on( "change", this.filter_set_options );  // update what's enabled
        this.filter_set_options();  // set initial state
        this.layers_set();
        this.spot_query_save(); // save the spot query params


        // location search
        if(this.map_query.get('location')){
            this.location_search(this.map_query.get('location'));
            // the above will call map_update_or_create
            return this;
        }

        // if we are going directly to a spot
        if(this.spot_query.id){
            this.spot = new spot_model(_.clone(this.spot_query.attributes));
            var map_view = this;

            // if lat lng supplied, get straight to it
            if(options.query.lat && options.query.lng){
                map_view.map_update_or_create();
                this.spot.fetch();
            }else{
                this.spot.fetch({success: function(spot){
                    map_view.map_query.set({
                        lat: spot.get('location').latitude,
                        lng: spot.get('location').longitude,
                        z: 15
                    }, {silent:true});
                    map_view.map_update_or_create();
                }});
            }

        // if center is available from query or local_storage
        }else if (this.map_query.get( "lat" ) && this.map_query.get( "lng" )){
            this.map_update_or_create();

        }else{
            var map_view = this;
            geo.get_location(
                // success
                function( location ){
                    map_view.map_query.set({
                        lat: location.coords.latitude,
                        lng: location.coords.longitude
                    }, {silent:true});
                    map_view.map_update_or_create();
                },
                // error
                function(){
                    // show world
                    map_view.map_query.set({
                        lat: 42,
                        lng: 12,
                        zoom: 2
                    }, {silent:true});
                    map_view.map_update_or_create();
                }
            );
        }

        this.map_time_render();
        if(this.photo_query.has('keywords')){
            this.keyword_search(this.photo_query.get('keywords'));
        }

        return this;
    },

    map_update_or_create: function () {

        // update map...

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
            ]
        };

        this.map = new google.maps.Map($('.x-map')[0], map_settings);

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

    map_query_save: function(){
        local_storage.set('map_params', _(this.map_query.attributes).pick(['lat', 'lng', 'zoom', 'show_spots', 'show_photos']));
    },

    photo_query_save: function(){
        local_storage.set('map_photo_params', _(this.photo_query.attributes).pick(['date', 'keywords', 'username', 'group']));
    },

    spot_query_save: function(){
        local_storage.set('map_spot_params', _(this.spot_query.attributes).pick(['spot_name', 'sort', 'category', 'n']));
    },

    overlays_remove: function(overlays){

        _.each( this.thumb_overlays, function(thumb){
            if(!overlays || _(overlays).contains(thumb.data.id)){
                thumb.setMap(null);
            }
        });

        _.each( this.spot_overlays, function( spot ){
            if(!overlays || _(overlays).contains(spot.data.id)){
                spot.setMap(null);
            }
        });
    },

    thumbs_get: function(){

        var map_view = this,
            old_thumb_ids = this.thumb_collection.pluck("id");

        if (this.map_query.get('show_photos')) {

            this.$el.addClass('x-loading');

            this.thumb_collection.data = _.clone(this.photo_query.attributes);
            this.thumb_collection.data.area = this.map.getBounds().toUrlValue(4);
            if(this.photo_query.has('photo_id')){
                this.thumb_collection.data.n=1;
            }

            // we are about to look for new thumbs, abort any old requests, they will no longer be needed
            try{ this.thumb_collection.current_query.abort(); }catch(e){}

            this.thumb_collection.current_query = this.thumb_collection.fetch({
                success: function( collection ){
                    $.mobile.hidePageLoadingMsg();
                    map_view.$el.removeClass('x-loading');

                    var new_thumb_ids = map_view.thumb_collection.pluck("id");

                    map_view.no_results_message_toggle(!new_thumb_ids.length);

                    // remove thumbs not in the new set
                    map_view.overlays_remove(_(old_thumb_ids).difference(new_thumb_ids));

                    // add thumbs not in the old set
                    _.chain(map_view.thumb_collection.models).sortBy(function(model){ return -model.get('location').latitude; }).each(function( photo ){
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
        }
        else {
            map_view.overlays_remove(old_thumb_ids);
            this.thumb_collection.reset();
        }
    },

    spots_get: function(){

        var map_view = this,
            old_spot_ids = this.spot_collection.pluck("id");


        if (this.map_query.get('show_spots')) {
            this.$el.addClass('x-loading');

            this.spot_collection.data = _.clone(this.spot_query.attributes);

            this.spot_collection.data.area = this.map.getBounds().toUrlValue(4);

            if(this.spot_query.has('spot_id')){
                this.spot_collection.data.n=1;
            }

            // we are about to look for new thumbs, abort any old requests, they will no longer be needed
            try{ this.spot_collection.current_query.abort(); }catch(e){}

            this.spot_collection.current_query = this.spot_collection.fetch({
                success: function( collection ){
                    $.mobile.hidePageLoadingMsg();
                    map_view.$el.removeClass('x-loading');

                    var new_spot_ids = map_view.spot_collection.pluck("id");

                    map_view.no_results_message_toggle(!new_spot_ids.length);

                    // remove thumbs not in the new set
                    map_view.overlays_remove(_(old_spot_ids).difference(new_spot_ids));

                    // add thumbs not in the old set
                    _.chain(map_view.spot_collection.models).sortBy(function(model){ return -model.get('location').latitude; }).each(function( spot ){
                        var id = spot.get('id');
                        if(!_(old_spot_ids).contains(id)){
                            map_view.thumb_overlays[id] = new map.overlays.Base(
                                _.extend({active: spot.id == map_view.spot_query.get('id')}, spot.attributes),
                                map_view.map,
                                map_view.spot_template
                            );
                        }
                    });

                    // update time display if in 'just one' mode now we have the
                    // photo and know its date
                    if(map_view.spot_query.has('spot_id')){ map_view.map_time_update_display(); }
                },
                error: function( e ){
                    console.warn( "error getting spots", e );
                }
            });
        }
        else {
            map_view.overlays_remove(old_spot_ids);
            this.spot_collection.reset();
        }
    },

    toggle_spot_label: function (event) {
        var pin = this.$(event.currentTarget).parent();
        if(pin.hasClass('active')){
            pin.removeClass('x-active');
        }else{
            this.$('.x-venue.x-active').removeClass('x-active');
            pin.addClass('x-active');
        }
    },

    no_results_message_toggle: function(show){
        if(show !== true){ show = false; }
        this.$(".x-map-alert").toggle(!!show);
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
                    var dis_list = $(".x-disambiguation-list").empty();
                    _.each( results, function( result ){
                        var li = new map_disambiguation({
                            result: result,
                            parent_view: map_view
                        });

                        dis_list.append(li.render().el);
                    });

                    map_view.location_search_toggle_disambiguation(true);
                    dis_list.listview().listview("refresh");
                }else{
                    map_view.location_search_toggle_disambiguation(false);
                    map_view.map_query.set({
                        area: results[ 0 ].geometry.bounds,
                        location: null
                    }, {silent:true});
                    map_view.map_update_or_create();
                }
            }else{
                var again = confirm("Sorry, your search returned no results. Would you like to search again?");

                if(again) {
                    Backbone.history.navigate("/search");
                }
            }
        });
    },

    location_search_toggle_disambiguation: function(show){
        if(show !== true){ show = false; }
        this.$(".x-disambiguation").toggle(show);
    },

    go_to: function(location, zoom){
        var center = new google.maps.LatLng( location.latitude, location.longitude),
            old_center = this.map.getCenter(),
            old_zoom = this.map.getZoom();

        // check to see if we're actually moving
        // because if we don't the idle event wont fire
        // so the pageloadmessage wont disappear
        if (old_center.equals(center) && old_zoom == zoom) {
            google.maps.event.trigger(this.map, 'idle');
        }
        else {
            this.map.setZoom(zoom || config.get('zoom'));
            this.map.panTo( center );
        }
    },

    current_location_place: function(known_location){
        var map_view = this;
        var callback = function(location){
            if(map_view.dot){
                map_view.dot.setMap(null);
            }
            map_view.dot = new map.overlays.Base( {
                location: {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude
                }},
                map_view.map,
                map_view.location_template
            );
        };
        if(known_location){
            callback(known_location);
        }else{
            geo.get_location(callback);
        }
    },

    current_location_go_to: function(){
        // exit "just one" mode
        this.map_query.unset( "photo_id", {silent: true} );

        if (this.map){
            var map_view = this;
            geo.get_location(
                function( position ){
                    map_view.go_to(position.coords);
                    map_view.photo_query.unset('photo_id');
                    map_view.current_location_place(position);
                },
                function( error ){
                    console.warn( "error getting geolocation", error );
                    if (error.message){
                        alerts.notification('Error', error.message );
                    }
                }
            );
        }else{
            console.warn("map not initialized");
        }
    },

    map_feed: function(){
        if (this.map_query){
            var params = this.photo_query.attributes;
            params.area = this.map.getBounds().toUrlValue(4);
            Backbone.history.navigate( "#/feed/?" + $.param(params) );
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
        this.$(".x-filter option[value='just-me']").attr("disabled", !auth.has("snapr_user"));
        this.$(".x-filter option[value='following']").attr("disabled", !auth.has("snapr_user"));
        this.$(".x-filter option[value='just-one']").attr("disabled", !this.photo_query.has("photo_id"));

        if (this.photo_query.has( "photo_id" )){
            this.$(".x-filter").val("just-one").selectmenu('refresh', true);
        }else if (!this.photo_query.has( "username" ) && this.photo_query.get( "group" ) == "following"){
            this.$(".x-filter").val("following").selectmenu('refresh', true);
        }else if (this.photo_query.get( "username" ) == "." && !this.photo_query.has( "group" )){
            this.$(".x-filter").val("just-me").selectmenu('refresh', true);
        }else{
            this.$(".x-filter").val("all").selectmenu('refresh', true);
        }
    },

    layers_update: function(e) {
        var layer = $(e.currentTarget).val(),
            checked = $(e.currentTarget).attr('checked') === "checked";

        this.map_query.set('show_' + layer, checked);
    },


    layers_set: function (){
        this.$(".x-show-spots").attr("checked", !!this.map_query.get("show_spots")).checkboxradio("refresh");
        this.$(".x-show-photos").attr("checked", !!this.map_query.get("show_photos")).checkboxradio("refresh");
    },

    keyword_search: function( keywords ){
        var input = this.$('.x-search').find("input");
        if(!_.isString(keywords)){
            keywords = input.val();
        }else{
            input.val(keywords);
        }
        if(keywords === ''){
            this.photo_query.unset('keywords');
            this.spot_query.unset('spot_name');
        }else{
            this.photo_query.set({keywords: keywords});
            this.spot_query.set({spot_name: keywords});
        }

        return this;
    },

    keyword_search_clear: function(){
        this.$('.x-search').find("input").val("");
        this.photo_query.unset( "keywords" );

        return this;
    },

    map_time_render: function(){

        var map_view = this;
        this.$(".x-time-btn").scroller({
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
            'dateOrder': 'ddMyy',
            'endYear': new Date().getFullYear(),
            'timeFormat': 'HH:ii:00',
            'onSelect': function(value){
                map_view.photo_query.set({'date': value}, {silent: true});
                map_view.photo_query.unset('photo_id', {silent: true});
                map_view.photo_query.trigger( "change" );
            },
            'onCancel': function(value, scroller, c){
                scroller.setValue(new Date());
                map_view.map_time_reset();
            }
        });

        this.map_time_update_display();

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
            this.$(".x-time-btn").scroller('setDate', string_utils.convert_snapr_date(time));
            this.$(".x-time").find(".ui-bar").text( string_utils.short_timestamp( time, true) || "Now" );
        }else{
            this.$(".x-time-btn").scroller('setDate', new Date());
            this.$(".x-time").find(".ui-bar").text( "Now" );
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
        this.$(".x-time-btn").scroller('show');
        return this;
    }

});

var map_disambiguation = view.extend({

    tagName: "li",

    events: {
        "click .x-map-link": "goto_map"
    },

    initialize: function(){
        this.template = this.get_template('components/map/disambiguation');
        this.location = this.options.result;
        this.parent_view = this.options.parent_view;
    },

    render: function(){
        this.$el.html( this.template( {location: this.location} ) );
        return this;
    },

    goto_map: function(){
        this.parent_view.map_query.set('area', this.location.geometry.viewport);
        this.parent_view.map_update_or_create();
        this.parent_view.location_search_toggle_disambiguation(false);
    }
});

return map_view;
});
