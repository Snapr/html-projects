snapr.views.people = Backbone.View.extend({
    
    initialize: function()
    {
        this.el.live('pagehide', function( e )
        {
            $(e.target).undelegate();
            
            return true;
        });
        
        this.el.find("ul.people-list").empty();
        
        this.collection = new snapr.models.user_collection();
        
        var people_view = this;
        
        this.collection.bind( "reset", function()
        {
            people_view.render();
        });

        // if we are coming from the map view do a flip, otherwise do a slide transition
        if ($.mobile.activePage.attr('id') == 'map' )
        {
            var transition = "flip";
        }
        else
        {
            var transition = "slide";
        }
        
        $.mobile.changePage( $("#people"), {
            changeHash: false,
            transition: transition
        });
        
        switch (this.options.follow){
            case "following":
                this.el.find("h1").text("Following");
                this.el.find("#people-search").val('').attr("placeholder", "Search users " + this.options.query.username + " is following…" );
                this.collection.get_following( this.options.query.username );
                break;
            case "followers":
                this.el.find("h1").text("Followers");
                this.el.find("#people-search").val('').attr("placeholder", "Search " + this.options.query.username + "'s followers…" );
                this.collection.get_followers( this.options.query.username );
                break;
            default:
                this.el.find("h1").text("Search");
                this.el.find("#people-search").val(this.options.query.username).attr("placeholder", "Search users…" );
                this.collection.user_search( this.options.query.username )
                break;
        }
        
    },
    
    events: {
        "keyup input": "search"
    },
    
    render: function()
    {
        var people_list = this.el.find("ul.people-list").empty();
        
        var people_li_template = _.template( $("#people-li-template").html() );
        
        _.each( this.collection.models, function( model )
        {
            var people_li = new snapr.views.people_li({
                template: people_li_template,
                model: model
            });
            
            people_list.append( people_li.render().el );
            
        });
        
        people_list.listview().listview("refresh");
    },
    
    search: function(e)
    {

        var keywords = $(e.target).val();
        
        if (keywords.length > 1)
        {
            switch (this.options.follow){
                case "following":
                    // need new api
                    break;
                case "followers":
                    // need new api
                    break;
                default:
                    console.warn( "keypress", e, keywords )
                    // this.collection.user_search( keywords )
                    break;
            }
        }
    }
    
});