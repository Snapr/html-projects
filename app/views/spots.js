/*global _  define require - this has been duplicated from the people.js page.. redefine dependencies etc*/
define(['config', 'views/base/page', 'collections/spot', 'views/components/no_results', 'views/people_li', 'utils/geo', 'utils/local_storage'],
    function(config, page_view, spot_collection, no_results, people_li, geo, local_storage){
var spots_view =  page_view.extend({

    post_initialize: function() {
        var dialog = this;
        this.$el.live( "pageshow", function(){
            dialog.$('#venue-search').focus();
        });

        this.defaults = {
            n:20,
            spot_name: '',
            sort: 'nearby',
            full: true
        }

        this.collection = new spot_collection();
        this.collection.on('all', this.render, this);
    },

    post_activate: function(options) {

        var this_view = this,
            stored_search_options = JSON.parse(local_storage.get("sports-search"));
            

        this.search_options = (stored_search_options) ? stored_search_options : this.defaults;

        var success_callback = function( location ) {            
            this_view.search_options.latitude = location.coords.latitude;
            this_view.search_options.longitude = location.coords.longitude;
            this_view.search_options.nearby = true;
            this_view.search_options.radius = 50000;
            this_view.$el.find('form').submit();
        };

        var error_callback = function() {
            this_view.$el.find('form').submit();
        };
       
       geo.get_location( success_callback, error_callback );
       this.change_page();

    },

    events: {
        "keyup input": "search_event",
        "change select": "search_event",
        "click .ui-input-clear": "search_event",
        "submit form": "search_event"
    },

    render: function() {
        var spots_list = this.$el.find("ul.spots").empty(),
            results_header = this.$el.find('.spots-results-header');

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
            results_header.show();

        }
        else {
            //no_results.render('Oops.. Nobody here yet.', 'delete').$el.appendTo(this.$el);
            results_header.hide();
        }

        results_header.find("em").text(this.collection.length + " results");
        this.$el.removeClass('loading');
        spots_list.listview().listview("refresh");
    },

    reset_collection: function() {
        // this.display_collection = _.clone( this.collection.models );
        //         this.render();
    },

    search: function(options) {

        var this_view = this;

        this.timer && clearTimeout(this.timer);
        this.xhr && this.xhr.abort();

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


        local_storage.save("spots-search", options);
        this.search_options = options;

    },

    search_event: function(e) {

        e.preventDefault();
        this.$el.find('#spots-search').attr('class', '');

        var keywords = this.$el.find('#spot-search').val(),
            category = this.$el.find('#options-category').val(),
            sort = this.$el.find('#options-sort').val(),
            nearby = this.$el.find('#options-location').val() === 'nearby',
            this_view = this,
            data = this.defaults;


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

    },

});

var spots_item = Backbone.View.extend({
    tagName: 'li',
    className: 'spot-item',
    template: _.template( $("#spots-result-item").html() ),
    
    render: function () {
        this.$el.html( this.template({
            spot: this.model
        }));
    }
});

return spots_view;

});

