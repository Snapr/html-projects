/*global _  define require */
define(['views/base/view', 'views/base/page', 'collections/spot', 'utils/geo', 'utils/local_storage'],
    function(view, page_view, spot_collection, geo, local_storage){
var spots_view =  page_view.extend({

    post_initialize: function() {
        var dialog = this;
        this.$el.live( "pageshow", function(){
            dialog.$('#venue-search').focus();
        });

        this.defaults = {
            n:20,
            spot_name: '',
            sort: 'weighted_score',
            full: true
        };

        this.collection = new spot_collection();
        this.collection.on('all', this.render, this);
        this.spot_results_header = new spot_results_header_view();
        this.$el.find('ul.spots').before(this.spot_results_header.el);
    },

    post_activate: function(options) {

        var this_view = this,
            stored_search_options = local_storage.get("spots-search"),
            search_options;

        search_options = (stored_search_options) ? _.clone(stored_search_options) : _.clone(this.defaults);

        var success_callback = function( location ) {
            this_view.latitude = location.coords.latitude;
            this_view.longitude = location.coords.longitude;
            if (search_options.nearby) {
                search_options.latitude = this_view.latitude;
                search_options.longitude = this_view.longitude;
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

        search_options.nearby || this.$el.find('#options-location').val('anywhere').selectmenu('refresh'); //ugh dirty
        this.$el.find('#spot-search').val(search_options.spot_name);
        this.$el.find('#options-category').val(search_options.category).selectmenu("refresh");
        this.$el.find('#options-sort').val(search_options.sort).selectmenu("refresh");
        this.$el.find('#spots-search').attr('class', '').addClass(search_options.category || 'all-categories');


    },

    events: {
        "keyup input": "search_event",
        "change select": "search_event",
        "click .ui-input-clear": "search_event",
        "submit form": "search_event"
    },

    get_override_tab: function(){ return 'spots'; },


    render: function() {
        var spots_list = this.$el.find("ul.spots").empty();

        if(this.collection.length){
            //no_results.$el.remove();  // use remove(), hide() keeps it hidden and requires show() later
            _.each( this.collection.models, function( model ) {
                var li = new spots_item({
                    model: model,
                    parentView: this
                });

                spots_list.append( li.el );
                li.render();
            });
            this.spot_results_header.show();

        }

        var params = this.build_map_params();

        this.spot_results_header.render(this.collection.length, params);
        this.$el.removeClass('loading');
        spots_list.listview().listview("refresh");
    },

    reset_collection: function() {
        // this.display_collection = _.clone( this.collection.models );
        //         this.render();
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
            this_view.$el.addClass('loading');
            this_view.xhr = this_view.collection.fetch({
                data: options,
                success: function () {
                    this_view.xhr = null;
                    this_view.$el.removeClass('loading');
                }
            });
        }, 300 );


        local_storage.set("spots-search", options);
    },

    search_event: function(e) {

        e.preventDefault();
        this.$el.find('#spots-search').attr('class', '');

        var keywords = this.$el.find('#spot-search').val(),
            category = this.$el.find('#options-category').val(),
            sort = this.$el.find('#options-sort').val(),
            nearby = this.$el.find('#options-location').val() === 'nearby',
            this_view = this,
            data = _.clone(this.defaults);


        if (category !== 'all')  {
            data.category = category;
            this.$el.find('#spots-search').addClass(category);
        }
        else {
            this.$el.find('#spots-search').addClass('all-categories');
        }

        data.spot_name = keywords;

        data.sort = sort;

        if (this.latitude && this.longitude && nearby) {
            data.latitude = this.latitude;
            data.longitude = this.longitude;
            data.nearby = true;
            data.radius = 50000;
        }

        if (category !== 'all') {
            data.category = category;
        }

        this.search(data);
    }

});

var spots_item = view.extend({
    tagName: 'li',
    className: 'spot-item',

    initialize: function () {
        this.template = this.get_template('components/spots/results_item');
    },

    render: function () {
        this.$el.html( this.template({
            spot: this.model
        }));
    }
});

var spot_results_header_view = view.extend({
    initialize: function () {
        this.template = this.get_template('components/spots/results_header');
    },

    render: function (results, param) {
        this.$el.html( this.template({
            results: results,
            param: param
        }));
        this.$el.find('[data-role="button"]').button();
    },
    hide: function () {
        this.$el.hide();
    },
    show: function () {
        this.$el.show();
    }
});

return spots_view;

});

