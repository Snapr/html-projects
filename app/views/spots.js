/*global _  define require */
define(['views/base/view', 'views/base/page', 'collections/spot', 'utils/geo', 'utils/local_storage'],
    function(view, page_view, spot_collection, geo, local_storage){
var spots_view =  page_view.extend({

    post_initialize: function() {
        var dialog = this;
        this.$el.live( "pageshow", function(){
            dialog.$('.x-search-field').focus();
        });

        this.defaults = {
            n:20,
            spot_name: '',
            sort: 'weighted_score',
            full: true
        };

        this.collection = new spot_collection();
        this.collection.on('all', this.render, this);
    },

    post_activate: function(options) {

        var this_view = this,
            stored_search_options = local_storage.get("spots-search"),
            search_options;

        search_options = (stored_search_options) ? _.clone(stored_search_options) : _.clone(this.defaults);

        var success_callback = function( location ) {
            this_view.latitude = location.coords.latitude;
            this_view.longitude = location.coords.longitude;
            search_options.latitude = this_view.latitude;
            search_options.longitude = this_view.longitude;
            if (search_options.nearby) {
                search_options.nearby = true;
                search_options.radius = 50000;
            }
            this_view.search(search_options);
        };

        var error_callback = function() {
            this.$('.x-location-needed').attr('disabled', true);
            this_view.search(search_options);
        };

        geo.get_location( success_callback, error_callback );

        this.change_page();
        $.mobile.showPageLoadingMsg();

        // reset values
        if(!search_options.nearby){
            this.$('select.x-location').val('anywhere').selectmenu('refresh');
        }
        this.$('.x-search-field').val(search_options.spot_name);
        this.$('select.x-category').val(search_options.category).selectmenu("refresh");
        this.$('select.x-sort').val(search_options.sort).selectmenu("refresh");
        this.$('form').attr('class', '').addClass(search_options.category || 'all-categories');
    },

    events: {
        "keyup input": "search_event",
        "change select": "search_event",
        "click .ui-input-clear": "search_event",
        "submit form": "search_event"
    },

    get_override_tab: function(){ return 'spots'; },


    render: function() {
        var spots_list = this.$(".x-spots-list, .x-header").empty();

        this.replace_from_template(
            {
                spots: this.collection,
                params: this.build_map_params()
            }, [
                '.x-spots-list',
                '.x-header'
            ]
        ).find('[data-role="button"]').button();

        this.$el.removeClass('x-loading');
        spots_list.listview().listview("refresh");
    },

    build_map_params: function () {
        var params = {},
            options = this.search_options;

        _.each(options, function (v, k) {
            params['spot_' + k] = v ;
        });
        params.show_spots = true;

        // handle setting the center of the map
        // - nearby search
        if (options.latitude && options.longitude) {
            params.zoom = 8;
            params.lat = options.latitude;
            params.lng = options.longitude;
        }
        // - anywhere search
        else {
            params.lat = 42;
            params.lng = 12;
            params.zoom = 1;
        }

        return $.param(params);
    },

    search: function(options) {

        var this_view = this;

        this.timer && clearTimeout(this.timer);
        this.xhr && this.xhr.abort();

        this.search_options = options;

        this.timer = setTimeout( function() {
            this_view.timer = null;
            this_view.$el.addClass('x-loading');
            this_view.xhr = this_view.collection.fetch({
                data: options,
                success: function () {
                    this_view.xhr = null;
                    this_view.$el.removeClass('x-loading');
                    $.mobile.hidePageLoadingMsg();
                }
            });
        }, 300 );


        local_storage.set("spots-search", options);
    },

    search_event: function(e) {

        e.preventDefault();
        this.$('form').attr('class', '');

        var keywords = this.$('input.x-search-field').val(),
            category = this.$('select.x-category').val(),
            sort = this.$('.x-sort').val(),
            nearby = this.$('select.x-location').val(),
            this_view = this,
            data = _.clone(this.defaults);


        if (category !== 'all')  {
            data.category = category;
            this.$('form').addClass('x-' + category);
        }
        else {
            this.$('form').addClass('x-all-categories');
        }

        this.$('form').addClass('distance-'+nearby);

        data.spot_name = keywords;

        data.sort = sort;

        data.latitude = this.latitude;
        data.longitude = this.longitude;

        if (this.latitude && this.longitude && nearby !== 'anywhere') {
            data.radius = nearby;
        }

        if (category !== 'all') {
            data.category = category;
        }

        this.search(data);
    }

});

return spots_view;

});

