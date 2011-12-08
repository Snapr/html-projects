tripmapper.views.people = Backbone.View.extend({
    
    initialize: function()
    {
        
        this.el.find("ul.people-list").empty();
        
        this.collection = new tripmapper.models.user_collection();
        
        var people_view = this;
        
        this.collection.bind( "all", function()
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
                this.collection.get_following( this.options.query.username );
                break;
            case "followers":
                this.el.find("h1").text("Followers");
                this.collection.get_followers( this.options.query.username );
                break;
            default:
                this.el.find("h1").text("Search");
                this.collection.user_search( this.options.query.username )
                break;
        }
        
    },
    
    render: function()
    {
        console.warn( "render", this.collection.models );

        c = this.collection;
        var people_list = this.el.find("ul.people-list").empty();
        
        var people_li_template = _.template( $("#people-li-template").html() );
        
        _.each( this.collection.models, function( model )
        {
            var people_li = new tripmapper.views.people_li({
                template: people_li_template,
                model: model
            });
            
            people_list.append( people_li.render().el );
            
        });
        
        people_list.listview().listview("refresh");
    }
    
});