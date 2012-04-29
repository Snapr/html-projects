snapr.views.venues = snapr.views.dialog.extend({

    initialize: function()
    {
        snapr.views.dialog.prototype.initialize.call( this );

        this.selected_id = this.options.query.foursquare_venue_id;

        this.query = this.options.query;

        this.$el.find("ul.venue-list").empty();

        this.collection = new snapr.models.foursquare_venue_collection({
            ll: this.options.query.ll
        });

        // a simple array of venues which will be filtered and displayed
        this.display_collection = [];

        this.collection.bind( "reset", this.reset_collection );

        // if we are coming from the map view do a flip, otherwise do a slide transition
        if ($.mobile.activePage.attr('id') == 'map' )
        {
            this.transition = "flip";
        }
        else
        {
            this.transition = "slideup";
        }

        this.change_page({
            transition: this.transition
        });

        this.collection.fetch();
    },

    events: {
        "keyup input": "search",
        "click .ui-input-clear": "search",
        "click .x-back": "back"
    },

    render: function()
    {
        var venue_list = this.$el.find("ul.venue-list").empty();

        var venue_li_template = _.template( $("#venue-li-template").html() );

        var selected_id = this.selected_id;
        var back_query = this.query.back_query;
        var photo_model = this.model;
        _.each( this.display_collection, function( model )
        {
            var venue_li = new snapr.views.venue_li({
                template: venue_li_template,
                model: model,
                photo_model: photo_model,
                selected_id: selected_id,
                back_query: back_query,
                back_view: this.back_view
            });

            venue_list.append( venue_li.render().el );

        }, this);

        venue_list.listview().listview("refresh");
    },

    reset_collection: function()
    {
        this.display_collection = _.clone( this.collection.models );
        this.render();
    },

    search: function( e )
    {
        var venues_view = this;

        var keywords = e.target && e.target.value && e.target.value.toLowerCase() || "";

        if (keywords.length > 0)
        {
            this.display_collection = _.filter( this.collection.models, function( venue )
            {
                return (venue.get( "name" ).toLowerCase().indexOf( keywords ) > -1);
            });
            this.render();
            var doSearch = function()
            {
                venues_view.collection.data.query = keywords;
                venues_view.collection.fetch();
            }
        }
        else
        {
            var doSearch = null;

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

        if (doSearch)
        {
            // set up a new timeout function
            this.timer = window.setTimeout( function() {
                venues_view.timer = null;
                doSearch();
            }, 300 );
        }

    }
});