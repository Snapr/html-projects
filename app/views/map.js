/*global _  define require google */
define(['config', 'backbone', 'views/base/page', 'collections/thumb', 'collections/spot', 'mobiscroll', 'utils/geo', 'utils/map', 'auth', 'utils/local_storage', 'utils/string', 'utils/alerts'],
function(config, Backbone, page_view, thumb_collection, spot_collection, mobiscroll, geo, map, auth, local_storage, string_utils, alerts){

// TODO: set filter select to current options on actiavete

var map_view = page_view.extend({

    post_initialize: function(){

        _.bindAll(this);

        this.$el.on('pageshow', function (e) {
            // hack to set google map height
            $("#google-map").css("height", (window.innerHeight - 85) + "px");
        });

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

    post_activate: function(options){
        this.change_page();

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

        map_params = _.defaults( map_params,
            local_storage.get('map_params') || {},
            { zoom:config.get('zoom') }
        );

        // create a backbone model to store the current map query this
        // lets us bind functions to changes and pass the query to subviews
        this.photo_query = new Backbone.Model(photo_params);
        this.photo_query.bind( "change", this.hide_no_results_message );
        this.photo_query.bind( "change", this.get_thumbs );

        this.spot_query = new Backbone.Model(spot_params);
        this.spot_query.bind( "change", this.hide_no_results_message );
        this.spot_query.bind( "change", this.get_spots );

        this.map_query = new Backbone.Model(map_params);
        this.map_query.bind( "change", this.hide_no_results_message );
        this.map_query.bind( "change", this.get_thumbs );
        this.map_query.bind( "change", this.get_spots );
        this.map_query.bind( "change", this.save_map_query );

        if(this.map_query.get('location')){
            this.location_search(this.map_query.get('location'));
            // the above will call update_or_create_map
            return this;
        }

        // if center is available
        if (this.map_query.get( "lat" ) && this.map_query.get( "lng" )){
            this.update_or_create_map();
            return this;
        }

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
                });
                map_view.update_or_create_map();
            }
        );

        return this;
    },
    events: {
        "click .x-current-location": "go_to_current_location",
        "click #map-disambituation-cancel": "hide_dis",
        "click .x-map-feed": "map_feed",
        "change #map-filter": "update_filter",
        "submit #map-keyword": "keyword_search",
        "blur #map-keyword": "keyword_search",
        "click #map-keyword .ui-input-clear": "clear_keyword_search",
        "click .map-time-btn": "map_time"
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
            //this.get_thumbs();
            return;
        }

        // or

        // create map...
            console.log('create map');

        this.map_settings = {
            zoom: this.map_query.get( "zoom" ),
            center: new google.maps.LatLng( this.map_query.get( "lat" ), this.map_query.get( "lng" ) ),
            streetViewControl: false,
            mapTypeControl: false,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            styles: [{
                featureType: "poi.business",
                stylers: [
                    { visibility: "off" }
                ]
            }]
        };

        this.map = new google.maps.Map(document.getElementById("google-map"), this.map_settings);

        this.map.overlay_templates = {
            thumb: this.thumb_template,
            spot: this.spot_template,
            location: this.location_template
        };

        //this.get_thumbs();

        var map_view = this;
        geo.get_location(function(location){
            map_view.dot = new map.overlays.CurrentLocation( {
                location: {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude
                }},
                map_view.map );
        });

        var idle = google.maps.event.addListener( map_view.map, "idle", function(){
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
            if(!overlays || _(overlays).contains(thumb.data_.id)){
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
        if(this.photo_query.get('photo_id')){
            this.thumb_collection.data.n=1;
        }

        var map_view = this;

        // we are about to look for new thumbs, abort any old requests, they will no longer be needed
        try{ this.thumb_collection.current_query.abort(); }catch(e){}

        this.thumb_collection.current_query = this.thumb_collection.fetch({
            success: function( collection ){
                map_view.$el.removeClass('loading');

                var new_thumb_ids = map_view.thumb_collection.pluck("id");

                if (new_thumb_ids.length){
                    map_view.hide_no_results_message();
                }else{
                    map_view.show_no_results_message();
                }

                // remove thumbs not in the new set
                map_view.remove_overlays(_(old_thumb_ids).difference(new_thumb_ids));

                // add thumbs not in the old set
                _(map_view.thumb_collection.models).each(function( photo ){
                    var id = photo.get('id');
                    if(!_(old_thumb_ids).contains(id)){
                        map_view.thumb_overlays[id] = new map.overlays.Thumb( photo.attributes, map_view.map );
                    }
                });
            },
            error: function( e ){
                console.warn( "error getting thumbs", e );
            }
        });
    },


    get_spots: function(){},

    show_no_results_message: function(){
        this.$el.find("#snaprmapalert").show();
    },

    hide_no_results_message: function(){
        this.$el.find("#snaprmapalert").hide();
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
        if (this.marker){
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

    go_to: function(location, zoom){
        this.map.setZoom(zoom || config.get('zoom'));
        this.map.panTo( new google.maps.LatLng( location.latitude, location.longitude) );
    },

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

    clear_keyword_search: function(){
        this.map_query.unset( "keywords" );
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
    },

    update_filter: function( e ){
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
                this.photo_query.set({
                    group: "following"
                });
                break;
            case 'just-me':
                this.photo_query.unset( "group", {silent: true});
                this.photo_query.unset( "photo_id", {silent: true});
                this.photo_query.set({
                    username: "."
                });
                break;
            }
    },

    keyword_search: function( keywords ){
        var input = this.$('#map-keyword').find("input");
        if(!_.isString(keywords)){
            keywords = input.val();
        }else{
            input.val(keywords);
        }
        if (keywords != (this.model.get( "keywords" ))){
            if (keywords){
                local_storage.set('map_keywords', keywords);
                this.model.set({keywords: keywords});
            }else{
                local_storage['delete']('map_keywords');
                this.model.unset( "keywords" );
            }
        }
    },

/*
    clear_keyword_search: function(){
        this.$('#map-keyword').find("input").val("");
        this.model.unset( "keywords" );
    },

    render: function(){
        this.$el.find("#map-filter option[value='just-me']").attr("disabled", !auth.has("snapr_user"));
        this.$el.find("#map-filter option[value='following']").attr("disabled", !auth.has("snapr_user"));
        this.$el.find("#map-filter option[value='just-one']").attr("disabled", !this.model.has("photo_id"));


        var map_controls = this;
        this.$el.find(".map-time-btn").scroller({
            'cancelText': 'Set to Now', //  String  'Cancel'     Text for Cancel button
            //'delay': , //   Integer 300  Specifies the speed in milliseconds to change values in clickpick mode with tap & hold
            //'disabled': , //    Boolean false    Disables (true) or enables (false) the scroller. Can be set when initialising the scroller
            //'display': , // String  'modal'  Use 'inline' for inline display, or 'modal' for modal popup
            'headerText': false , //  String  '{value}'    Specifies a custom string which appears in the popup header. If the string contains '{value}' substring, it is replaced with the formatted value of the scroller. If it's set to false, the header is hidden.
            //'height': , //  Number  40   Height in pixels of one row on the wheel
            //'mode': , //    String  'scroller'   Option to choose between modes. Possible modes: 'scroller' - standard behaviour, 'clickpick' - '+' and '-' buttons
            'preset': 'datetime', //  String  'date'   Preset configurations for date, time and datetime pickers, possible values: 'date', 'time', 'datetime'
            //'rows': , //    Number  3    Number of visible rows on the wheel
            'setText': 'Set Time', // String  'Set'    Text for Set button
            'showLabel': false , //   Boolean true     Show/hide labels above wheels
            //'showOnFocus': , // Boolean true     Pops up the scroller on input focus
            'theme': 'jqm', //   String  ''   Sets the scroller's visual appearance. Supplied themes: 'android', 'android-ics', 'android-ics light', 'sense-ui', 'ios', 'jqm'. It's possible to create custom themes in css by prefixing any css class used in the scroller markup with the theme name, e.g.: .my-theme .dww { / My CSS / }, and set the theme option to 'my-theme'
            'jqmBody': 'b',
            //jqmHeader:'b',
            //jqmWheel: 'd',
            //jqmClickPick: 'c',
            'jqmSet': 'e',
            'jqmCancel': 'd',
            //'wheels': , //  Object  null     Wheels configuration. Example: [ { 'Label 1': { x: 'x', y: 'y', z: 'z' }, 'Label 2': { a: 'a', b: 'b' } }, { 'Label 3': { 1: '1', 2: '2' }, 'Label 4': { 4: '4', 5: '5' } } ]
            //'width': , //   Number  80   Minimum width in pixels of the wheels, expand to fit values and labels
            //'ampm': , //    Boolean true     12/24 hour format on timepicker
            //'ampmText': , //    String  ''   Label for AM/PM wheel
            'dateFormat': 'yy-mm-dd', //  String  'mm/dd/yy'   The format for parsed and displayed dates (m - month of year (no leading zero), mm - month of year (two digit), M - month name short, MM - month name long, d - day of month (no leading zero), dd - day of month (two digit), y - year (two digit), yy - year (four digit)
            'dateOrder': 'ddMyy' , //   String  'mmddy'  Display order and formating for month/day/year wheels. (m - month of year (no leading zero), mm - month of year (two digit), M - month name short, MM - month name long, d - day of month (no leading zero), dd - day of month (two digit), y - year (two digit), yy - year (four digit). The options also controls if a specific wheel should appear or not, e.g. use 'mmyy' to display month and year wheels only
            //'dayNames': , //    Array   ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']   The list of long day names, starting from Sunday, for use as requested via the dateFormat setting
            //'dayNamesShort': , //   Array   ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']    The list of abbreviated day names, starting from Sunday, for use as requested via the dateFormat setting
            //'dayText': , // String  'Day'    Label for Day wheel
            'endYear': new Date().getFullYear(), // Number  currYear + 10    Last displayed year on year wheel
            //'hourText': , //    String  'Hours'  Label for hours wheel
            //'maxDate': , // Date    null     Maximum date that can be selected
            //'minDate': , // Date    null     Minimum date that can be selected
            //'minuteText': , //  String  'Minutes'    Label for minutes wheel
            //'monthNames': , //  Array   ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']   The list of full month names, for use as requested via the dateFormat setting
            //'monthNamesShort': , // Array   ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']     The list of abbreviated month names, for use as requested via the dateFormat setting
            //'monthText': , //   String  'Month'  Label for month wheel
            //'seconds': , // Boolean false    Show seconds on timepicker
            //'secText': , // String  'Seconds'    Label for seconds wheel
            //'startYear': , //   Number  currYear - 10    First displayed year on year wheel
            //'stepHour': , //    Number   1   Steps between hours on timepicker
            //'stepMinute': , //  Number   1   Steps between minutes on timepicker
            //'stepSecond': , //  Number   1   Steps between seconds on timepicker
            'timeFormat': 'HH:ii:00', //  String  'hh:ii A'    The format for parsed and displayed dates (h - 12 hour format (no leading zero), hh - 12 hour format (leading zero), H - 24 hour format (no leading zero), HH - 24 hour format (leading zero), i - minutes (no leading zero), ii - minutes (leading zero), s - seconds (no leading zero), ss - seconds (leading zero), a - lowercase am/pm, A - uppercase AM/PM)
            //'yearText': , //    String  'Year'   Label for year wheel
            'onSelect': function(value){
                map_controls.model.set({'date': value});
                //map_controls.show_map_time(value);
            },
            'onCancel': function(value, scroller, c){
                scroller.setValue(new Date());
                map_controls.reset_map_time();
            }
        });

        if (this.model.has( "photo_id" ) && this.model.get( "n" ) == 1){
            $("#map-filter").val("just-one").selectmenu('refresh', true);
        }else if (!this.model.has( "username" ) && this.model.get( "group" ) == "following"){
            $("#map-filter").val("following").selectmenu('refresh', true);
        }else if (this.model.get( "username" ) == "." && !this.model.has( "group" )){
            $("#map-filter").val("just-me").selectmenu('refresh', true);
        }else{
            var filter = local_storage.get('map_filter');
            $("#map-filter").val(filter || "all").selectmenu('refresh', true);
        }

        if (this.model.has( "photo_id" ) &&
            this.model.get( "n" ) == 1 &&
            this.collection.get_photo_by_id( this.model.get( "photo_id" ) ) ){
            var thumb = this.collection.get_photo_by_id( this.model.get( "photo_id" ) );
            if (thumb){
                this.show_map_time( thumb.get( "date" ) );
                this.model.set({date: thumb.get( "date" )}, {silent: true});
            }
        }else{
            this.show_map_time(this.model.get( "date" ));
            // this.model.unset("date", {silent: true});
        }

        this.$el.find("#map-keyword input").val( this.model.get("keywords") || "" );

        return this;
    },

    */

    show_map_time: function( time ){
        if (time){
            this.$el.find(".map-time-btn").scroller('setDate', string_utils.convert_snapr_date(time));
            this.$el.find(".map-time").find(".ui-bar").text( string_utils.short_timestamp( time, true) || "Now" );
        }else{
            this.$el.find(".map-time").find(".ui-bar").text( "Now" );
        }
    },

    reset_map_time: function(){
        this.model.unset( "photo_id", {silent: true} );
        this.model.unset( "n", {silent: true} );
        this.model.unset( "date" );
        this.show_map_time();
    },

    map_time: function(){
        this.$el.find(".map-time-btn").scroller('show');
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
