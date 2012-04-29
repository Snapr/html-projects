snapr.views.dash_add_person = snapr.views.dialog.extend({

    initialize: function()
    {
        snapr.views.dialog.prototype.initialize.call( this );

        this.$el.find("ul.people-list").empty();

        this.collection = new snapr.models.user_collection();

        var people_view = this;

        this.collection.bind( "reset", function()
        {
            people_view.render();
        });

        this.change_page( {
            transition: this.transition
        });

    },

    events: {
        "keyup input": "search",
        "click .x-back": "back"
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
