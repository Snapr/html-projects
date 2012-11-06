/*global _  define require */
define(['backbone', 'views/base/page', 'collections/foursquare_venue'], function(Backbone, page_view, foursquare_venue_collection){
var venues = page_view.extend({

    post_activate: function(options){
        if(!options.retry){
            this.$('.x-search-input').val('');
        }

        this.model = options.model;
        this.selected_id = options.query.foursquare_venue_id;

        this.query = options.query;

        this.$(".x-venue-list").empty();
        this.$el.addClass('x-loading');

        this.collection = new foursquare_venue_collection({
            ll: options.query.ll
        });

        this.change_page();

        this.collection.on('reset', this.render);
        this.collection.fetch();
    },

    events: {
        "submit form": "search",
        "click .ui-input-clear": "search",
        'click .x-venue': 'select_venue'
    },

    render: function(){
        var venue_list = this.$(".x-venue-list").empty();

        this.replace_from_template({
            selected_id: this.selected_id,
            venues: this.collection.models
        }, ['.x-venue-list']);

        venue_list.listview().listview("refresh");
        this.$el.removeClass('x-loading');
    },

    search: function(e){
        if(e){
            e.preventDefault();
        }
        var venues_view = this;

        var input = this.$('.x-search-input').blur();
        var keywords = input.val().toLowerCase();

        var doSearch;
        if (keywords.length > 0){
            if (this.timer) {
                // clear the previous timeout
                window.clearTimeout(this.timer);
            }
            // set up a new timeout function
            this.timer = window.setTimeout( function() {
                venues_view.timer = null;
                venues_view.$el.addClass('x-loading');
                venues_view.collection.data.query = keywords;
                venues_view.collection.fetch({complete:function(){
                    venues_view.$el.removeClass('x-loading');
                }});
            }, 300 );
        }else{
            if (this.collection.data.query){
                delete this.collection.data.query;
            }
            this.collection.fetch();
        }
        return false;

    },

    select_venue: function(e){
        var button = $(e.currentTarget);
        var venue = {
            foursquare_venue_id: button.data("id"),
            foursquare_venue_name: button.data("name")
        };

        var location = _.extend({}, this.model.get( "location" ), venue );

        this.model.set({
            'location': location
        });

        this.back();
    }
});

return venues;

});
