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
        "click .ui-input-clear": "search"
    },

    render: function(){
        var venue_list = this.$(".x-venue-list").empty();

        var venue_li_template = this.get_template('components/foursquare_venue');

        var selected_id = this.selected_id;
        var back_query = this.query.back_query;
        var photo_model = this.model;
        var this_view = this;
        _.each( this.collection.models, function( model ){
            var li = new venue_li({
                template: venue_li_template,
                model: model,
                photo_model: photo_model,
                selected_id: selected_id
            });

            li.parent_view = this_view;

            venue_list.append( li.render().el );

        }, this);

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

    }
});

var venue_li = Backbone.View.extend({

    initialize: function(){
        _.bindAll( this );

        this.template = this.options.template;

        this.selected_id = this.options.selected_id;

        this.photo_model = this.options.photo_model;

        this.back_query = this.options.back_query;

        this.back_view = this.options.back_view;
    },

    tagName: 'li',

    events: {
        "click a": "select_venue"
    },

    render: function(){
        var icon = this.model.get( "categories" ).length &&
            this.model.get( "categories" )[0].icon ||
            'http://foursquare.com/img/categories/none_64.png';
        var selected = (this.model.get( "id" ) == this.selected_id);

        this.$el.html( this.template({
            venue: this.model,
            icon: icon,
            selected: selected
        }) );

        return this;
    },

    select_venue: function(){
        var venue = {
            foursquare_venue_id: this.model.get("id"),
            foursquare_venue_name: this.model.get("name")
        };

        var location = _.extend({}, this.parent_view.model.get( "location" ), venue );

        this.parent_view.model.set({
            'location': location
        });

        this.parent_view.back();
    }
});

return venues;

});
