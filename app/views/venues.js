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


        // switch (this.options.follow){
        //     case "following":
        //         this.el.find("h1").text("Following");
        //         this.el.find("#people-search").val('').attr("placeholder", "Search users " + this.options.query.username + " is following…" );
        //         this.collection.get_following( this.options.query.username );
        //         break;
        //     case "followers":
        //         this.el.find("h1").text("Followers");
        //         this.el.find("#people-search").val('').attr("placeholder", "Search " + this.options.query.username + "'s followers…" );
        //         this.collection.get_followers( this.options.query.username );
        //         break;
        //     default:
        //         this.el.find("h1").text("Search");
        //         this.el.find("#people-search").val(this.options.query.username).attr("placeholder", "Search users…" );
        //         this.collection.user_search( this.options.query.username )
        //         break;
        // }

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