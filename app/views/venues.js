/*global _ Route define require */
define(['backbone', 'views/base/page', 'collections/foursquare_venue'], function(Backbone, page_view, foursquare_venue_collection){
var venues = page_view.extend({

    post_activate: function(){
        this.selected_id = this.options.query.foursquare_venue_id;

        this.query = this.options.query;

        this.$el.find("ul.venue-list").empty();

        this.collection = new foursquare_venue_collection({
            ll: this.options.query.ll
        });

        // a simple array of venues which will be filtered and displayed
        this.display_collection = [];

        this.collection.bind( "reset", _.bind(this.reset_collection, this) );

        // if we are coming from the map view do a flip, otherwise do a slide transition
        var transition = ($.mobile.activePage.attr('id') == 'map') ? "flip" : "slideup";
        this.change_page({
            transition: this.transition
        });

        this.collection.fetch();
    },

    events: {
        "keyup input": "search",
        "click .ui-input-clear": "search"
    },

    render: function(){
        var venue_list = this.$el.find("ul.venue-list").empty();

        var venue_li_template = _.template( $("#venue-li-template").html() );

        var selected_id = this.selected_id;
        var back_query = this.query.back_query;
        var photo_model = this.model;
        _.each( this.display_collection, function( model )
        {
            var li = new venue_li({
                template: venue_li_template,
                model: model,
                photo_model: photo_model,
                selected_id: selected_id,
                back_query: back_query,
                back_view: this.back_view
            });

            venue_list.append( li.render().el );

        }, this);

        venue_list.listview().listview("refresh");
    },

    reset_collection: function(){
        this.display_collection = _.clone( this.collection.models );
        this.render();
    },

    search: function( e ){
        var venues_view = this;

        var keywords = e.target && e.target.value && e.target.value.toLowerCase() || "";

        var doSearch;
        if (keywords.length > 0){
            this.display_collection = _.filter( this.collection.models, function( venue ){
                return (venue.get( "name" ).toLowerCase().indexOf( keywords ) > -1);
            });
            this.render();
            doSearch = function(){
                venues_view.collection.data.query = keywords;
                venues_view.collection.fetch();
            };
        }else{
            doSearch = null;

            this.display_collection = this.collection.models;
            this.render();

            if (this.collection.data.query)
            {
                delete this.collection.data.query;
            }
            this.collection.fetch();
        }

        if (this.timer) {
            // clear the previous timeout
            window.clearTimeout(this.timer);
        }

        if (doSearch){
            // set up a new timeout function
            this.timer = window.setTimeout( function() {
                venues_view.timer = null;
                doSearch();
            }, 300 );
        }

    }
});

var venue_li = Backbone.View.extend({

    initialize: function()
    {
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

    render: function()
    {
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

    select_venue: function()
    {
        var venue = {
            foursquare_venue_id: this.model.get("id"),
            foursquare_venue_name: this.model.get("name")
        };

        var location = _.extend( this.photo_model.get( "location" ), venue );

        this.photo_model.set({
            location: location
        });

        this.back_view.initialize.call({
            query: this.back_query,
            model: this.photo_model,
            el: $("#share-photo")[0]
        });
        snapr.info.current_view = this.back_view;
    }
});

return venues;

});
