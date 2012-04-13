snapr.views.dash_add_person = snapr.views.page.extend({

    initialize: function()
    {
        snapr.views.page.prototype.initialize.call( this );

        this.$el.find("ul.people-list").empty();

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
            var transition = "slideup";
        }

        this.change_page( {
            transition: transition
        });

    },

    events: {
        "keyup input": "search"
    },

    render: function()
    {
        var people_list = this.$el.find("ul.people-list").empty();

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
                    console.log( "keypress", e, keywords )
                    // this.collection.user_search( keywords )
                    break;
            }
        }
    }

});
