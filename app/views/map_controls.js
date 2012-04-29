snapr.views.map_controls = Backbone.View.extend({

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
        this.$el.find("#map-filter option[value='just-me']").attr("disabled", !snapr.auth.has("snapr_user"));
        this.$el.find("#map-filter option[value='following']").attr("disabled", !snapr.auth.has("snapr_user"));
        this.$el.find("#map-filter option[value='just-one']").attr("disabled", !this.model.has("photo_id"));

        var map_controls = this;
        this.$el.find(".map-time-btn").scroller({
            'cancelText': 'now', //  String  'Cancel'     Text for Cancel button
            //'delay': , //   Integer 300  Specifies the speed in milliseconds to change values in clickpick mode with tap & hold
            //'disabled': , //    Boolean false    Disables (true) or enables (false) the scroller. Can be set when initialising the scroller
            //'display': , // String  'modal'  Use 'inline' for inline display, or 'modal' for modal popup
            //'headerText': , //  String  '{value}'    Specifies a custom string which appears in the popup header. If the string contains '{value}' substring, it is replaced with the formatted value of the scroller. If it's set to false, the header is hidden.
            //'height': , //  Number  40   Height in pixels of one row on the wheel
            //'mode': , //    String  'scroller'   Option to choose between modes. Possible modes: 'scroller' - standard behaviour, 'clickpick' - '+' and '-' buttons
            'preset': 'datetime', //  String  'date'   Preset configurations for date, time and datetime pickers, possible values: 'date', 'time', 'datetime'
            //'rows': , //    Number  3    Number of visible rows on the wheel
            //'setText': , // String  'Set'    Text for Set button
            //'showLabel': , //   Boolean true     Show/hide labels above wheels
            //'showOnFocus': , // Boolean true     Pops up the scroller on input focus
            'theme': 'android-ics', //   String  ''   Sets the scroller's visual appearance. Supplied themes: 'android', 'android-ics', 'android-ics light', 'sense-ui', 'ios', 'jqm'. It's possible to create custom themes in css by prefixing any css class used in the scroller markup with the theme name, e.g.: .my-theme .dww { / My CSS / }, and set the theme option to 'my-theme'
            //'wheels': , //  Object  null     Wheels configuration. Example: [ { 'Label 1': { x: 'x', y: 'y', z: 'z' }, 'Label 2': { a: 'a', b: 'b' } }, { 'Label 3': { 1: '1', 2: '2' }, 'Label 4': { 4: '4', 5: '5' } } ]
            //'width': , //   Number  80   Minimum width in pixels of the wheels, expand to fit values and labels
            //'ampm': , //    Boolean true     12/24 hour format on timepicker
            //'ampmText': , //    String  ''   Label for AM/PM wheel
            'dateFormat': 'yy-mm-dd', //  String  'mm/dd/yy'   The format for parsed and displayed dates (m - month of year (no leading zero), mm - month of year (two digit), M - month name short, MM - month name long, d - day of month (no leading zero), dd - day of month (two digit), y - year (two digit), yy - year (four digit)
            //'dateOrder': , //   String  'mmddy'  Display order and formating for month/day/year wheels. (m - month of year (no leading zero), mm - month of year (two digit), M - month name short, MM - month name long, d - day of month (no leading zero), dd - day of month (two digit), y - year (two digit), yy - year (four digit). The options also controls if a specific wheel should appear or not, e.g. use 'mmyy' to display month and year wheels only
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
                console.log(value);
                map_controls.model.set({'date': value});
                //map_controls.show_map_time(value);
            },
            'onCancel': function(valeu, scroller){
                scroller.setDate(new Date());
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
            console.log('setting date to', time ,snapr.utils.convert_snapr_date(time));
            this.$el.find(".map-time-btn").scroller('setDate', snapr.utils.convert_snapr_date(time));
            this.$el.find(".map-time").find(".ui-bar").text( snapr.utils.short_timestamp( time, true) || "Now" );
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
