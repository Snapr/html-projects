/*global _  define require google */
define(['config', 'backbone', 'views/base/page', 'collections/thumb', 'mobiscroll', 'utils/geo', 'auth', 'utils/local_storage', 'utils/string'],
function(config, Backbone, page_view, thumb_collection, mobiscroll, geo, auth, local_storage, string_utils){
var SnapOverlay, CurrentLocation;

var map_view = page_view.extend({

    post_initialize: function(){

        var map_view = this;
        this.$el.live('pageshow', function (e) {
            map_view.when_page_showen();
        });

        this.thumb_template = _.template($('#thumb-template').html());

        this.flag_template = _.template($('#flag-template').html());

        this.location_template = _.template($('#location-template').html());

    },

    post_activate: function(){
        this.thumb_collection = new thumb_collection();

        this.page_shown = false;
        this.maps_loaded = false;
        this.page_showen_and_maps_loaded = false;

        var query = this.options.query || {};

        query.n = query.photo_id ? 1 : 10;

        this.change_page();

        this.map_thumbs = [];
        this.map_flags = [];

        // create a backbone model to store the current map query
        // this lets us bind functions to changes and pass the query to subviews
        this.map_query = new Backbone.Model(query);
        this.map_query.bind( "change", this.hide_no_results_message );
        this.map_query.bind( "change", this.get_thumbs );

        this.load_maps_then();

        this.map_controls = new map_controls({
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
            window.gmap_script_loaded = _.bind(this.load_maps_then, this);
            // this loads the google loader script with the maps lib autoloaded with a callback to gmap_script_loaded
            // {"modules":[{"name":"maps","version":"3.x","callback":"gmap_script_loaded",'other_params':"sensor=false"}]}
            $(document.body).append($('<script src="https://www.google.com/jsapi?autoload=%7B%22modules%22%3A%5B%7B%22name%22%3A%22maps%22%2C%22version%22%3A%223.x%22%2C%22callback%22%3A%22gmap_script_loaded%22%2C\'other_params\'%3A%22sensor%3Dfalse%22%7D%5D%7D"></script>'));
            return;
        }

        var map_view = this;

        // this will only run once.
        map_view.create_custom_overlays();

        map_view.map_settings = {
            zoom: map_view.map_query.get( "zoom" ) ||
                parseInt(local_storage.get('map_zoom'), 10) ||
                config.get('zoom'),
            streetViewControl: false,
            mapTypeControl: false,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        if (map_view.map_query.get( "lat" ) && map_view.map_query.get( "lng" )){
            map_view.map_settings.center = new google.maps.LatLng( map_view.map_query.get( "lat" ), map_view.map_query.get( "lng" ) );
        }else if (local_storage.get('map_latitude') && local_storage.get('map_longitude')){
            map_view.map_settings.center = new google.maps.LatLng( local_storage.get('map_latitude'), local_storage.get('map_longitude') );
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
            geo.get_location(
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

        geo.get_location(function(location){
            map_view.dot = new CurrentLocation( {
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

        var idle = google.maps.event.addListener( map_view.map, "idle", function(){
            map_view.map_query.set( {
                area: map_view.map.getBounds().toUrlValue(4),
                zoom: map_view.map.getZoom()
            });
            // remember location
            local_storage.save('map_zoom', map_view.map.getZoom());
            var ll = map_view.map.getCenter();
            local_storage.save('map_latitude', ll.lat());
            local_storage.save('map_longitude', ll.lng());
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
                        map_view.map_thumbs[ i ] = new SnapOverlay( 'photo', thumb.attributes, map_view.map, false );
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
                        var li = new map_disambiguation({
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
                    Backbone.history.navigate("/search");
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
            map_view.map.setZoom(config.get('zoom'));
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
            geo.get_location( success_callback, error_callback );
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

            if (urlParams.access_token){
                delete urlParams.access_token;
            }
            if (urlParams.zoom){
                delete urlParams.zoom;
            }
            if (urlParams.lat){
                delete urlParams.lat;
            }
            if (urlParams.lng){
                delete urlParams.lng;
            }
            if (urlParams.date && urlParams.photo_id){
                delete urlParams.date;
            }

            Backbone.history.navigate( "#/feed/?" + $.param( urlParams ) );
        }
        else
        {
            console.warn("map not initialized", this);
        }
    },
    create_custom_overlays: function(){
        // no need to do this more than once:
        if( SnapOverlay ){ return; }

        SnapOverlay = function(type, data, map, extra_class)
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

        SnapOverlay.prototype = new google.maps.OverlayView();
        SnapOverlay.prototype.get_div = function(){
            var data_id = this.data_.id;

            if (this.type_ == 'photo') {
                return $(this.map.snapr.thumb_template({photo:this.data_})).show();
            } else {  //spot
                return $(this.map.snapr.spot_template({spot:this.data_})).show();
            }

        };
        SnapOverlay.prototype.onAdd = function()
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
        SnapOverlay.prototype.draw = function(){
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
        SnapOverlay.prototype.onRemove = function()
        {
            $(this.div_).remove();
            this.div_ = null;
        };
        SnapOverlay.prototype.hide = function()
        {
            if (this.div_)
            {
              this.div_.style.visibility = "hidden";
            }
        };
        SnapOverlay.prototype.show = function()
        {
            if (this.div_)
            {
              this.div_.style.visibility = "visible";
            }
        };
        SnapOverlay.prototype.toggle = function()
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
        SnapOverlay.prototype.toggleDOM = function()
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

        CurrentLocation = function(data, map){
            SnapOverlay.call(this, undefined, data, map);
        };
        CurrentLocation.prototype=_.clone(SnapOverlay.prototype);
        CurrentLocation.prototype.get_div = function()
        {
            return $(this.map.snapr.location_template()).show();
        };
    }
});

var map_controls = Backbone.View.extend({

    initialize: function()
    {
        _.bindAll( this );
        $(this.options.el).undelegate();
        this.setElement( this.options.el );
        this.model.bind( "change", this.render );
        this.collection.bind( "reset", this.render );
    },

    events: {
        "change #map-filter": "update_filter",
        "submit #map-keyword": "keyword_search",
        "blur #map-keyword": "keyword_search",
        "click #map-keyword .ui-input-clear": "clear_keyword_search",
        "click .map-time-btn": "map_time"
    },

    update_filter: function( e )
    {
        var filter = $(e.currentTarget).val();
        switch(filter) {
            case 'all':
                this.model.unset( "username", {silent: true});
                this.model.unset( "group", {silent: true});
                this.model.unset( "photo_id", {silent: true});
                this.model.set({
                    n: 10
                });
                break;
            case 'following':
                this.model.unset( "username", {silent: true});
                this.model.unset( "group", {silent: true});
                this.model.unset( "photo_id", {silent: true});
                this.model.set({
                    group: "following",
                    n: 10
                });
                break;
            case 'just-me':
                this.model.unset( "group", {silent: true});
                this.model.unset( "photo_id", {silent: true});
                this.model.set({
                    username: ".",
                    n: 10
                });
                break;
            case 'just-one':
                this.model.unset( "username", {silent: true});
                this.model.unset( "group", {silent: true});
                this.model.set({
                    n: 1
                });
                break;
            }
    },

    keyword_search: function( e )
    {
        var keywords = $(e.currentTarget).find("input").val();
        if (keywords != (this.model.get( "keywords" )))
        {
            if (keywords)
            {
                this.model.set({keywords: $(e.currentTarget).find("input").val()});
            }
            else
            {
                this.model.unset( "keywords" );
            }
        }
    },

    clear_keyword_search: function()
    {
        this.model.unset( "keywords" );
    },

    render: function()
    {
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

        if (this.model.has( "photo_id" ) && this.model.get( "n" ) == 1)
        {
            $("#map-filter").val("just-one").selectmenu('refresh', true);
        }
        else if (!this.model.has( "username" ) && this.model.get( "group" ) == "following")
        {
            $("#map-filter").val("following").selectmenu('refresh', true);
        }
        else if (this.model.get( "username" ) == "." && !this.model.has( "group" ))
        {
            $("#map-filter").val("just-me").selectmenu('refresh', true);
        }
        else
        {
            $("#map-filter").val("all").selectmenu('refresh', true);
        }

        if (this.model.has( "photo_id" ) &&
            this.model.get( "n" ) == 1 &&
            this.collection.get_photo_by_id( this.model.get( "photo_id" ) ) )
        {
            var thumb = this.collection.get_photo_by_id( this.model.get( "photo_id" ) );
            if (thumb)
            {
                this.show_map_time( thumb.get( "date" ) );
                this.model.set({date: thumb.get( "date" )}, {silent: true});
            }
        }
        else
        {
            this.show_map_time(this.model.get( "date" ));
            // this.model.unset("date", {silent: true});
        }

        this.$el.find("#map-keyword input").val( this.model.get("keywords") || "" );

        return this;
    },

    show_map_time: function( time ){
        if (time){
            this.$el.find(".map-time-btn").scroller('setDate', string_utils.convert_snapr_date(time));
            this.$el.find(".map-time").find(".ui-bar").text( string_utils.short_timestamp( time, true) || "Now" );
        }
        else{
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

    events: {
        "click .map-link": "goto_map"
    },

    initialize: function(){
        this.template = this.options.template;
        this.location = this.options.result;
        this.map = this.options.map;
        this.parent_view = this.options.parent_view;
    },

    render: function(){
        this.$el.html( this.template( {location: this.location} ) );

        return this;
    },

    goto_map: function(){
        this.map.fitBounds( this.location.geometry.viewport );
        this.parent_view.hide_dis();
    }
});

return map_view;
});
