snapr.views.venues = Backbone.View.extend({

    initialize: function()
    {
        _.bindAll( this );

        this.el.live('pagehide', function( e )
        {
            $(e.target).undelegate();

            return true;
        });

        this.el.find("ul.venue-list").empty();

        this.collection = new snapr.models.foursquare_venue_collection({
            ll: this.options.query.ll
        });

        // a simple array of venues which will be filtered and displayed
        this.display_collection = [];

        this.collection.bind( "reset", this.reset_collection );

        // if we are coming from the map view do a flip, otherwise do a slide transition
        if ($.mobile.activePage.attr('id') == 'map' )
        {
            var transition = "flip";
        }
        else
        {
            var transition = "slide";
        }

        $.mobile.changePage( $("#venues"), {
            changeHash: false,
            transition: transition
        });

        this.collection.fetch();
    },

    events: {
        "keyup input": "search"
    },

    render: function()
    {
        var venue_list = this.el.find("ul.venue-list").empty();

        var venue_li_template = _.template( $("#venue-li-template").html() );

        _.each( this.display_collection, function( model )
        {
            var venue_li = new snapr.views.venue_li({
                template: venue_li_template,
                model: model
            });

            venue_list.append( venue_li.render().el );

        });

        venue_list.listview().listview("refresh");
    },

    reset_collection: function()
    {
        this.display_collection = _.clone( this.collection.models );
        this.el.find("input").val("")
        this.render();
    },

    search: function(e)
    {
        var keywords = e.target.value.toLowerCase();

        if (keywords.length > 0)
        {
            this.display_collection = _.filter( this.collection.models, function( venue )
            {
                return (venue.get( "name" ).toLowerCase().indexOf( keywords ) > -1);
            });
            this.render();
        }
        else
        {
            this.reset_collection();
        }
    }

});