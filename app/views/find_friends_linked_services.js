// abstract base class for both twitter and facebook

snapr.views.find_friends_linked_services = snapr.views.dialog.extend({

    initialize: function()
    {
        snapr.views.dialog.prototype.initialize.call( this );

        this.$el.find("ul.people-list").empty();

        this.collection = new snapr.models.user_collection();
        this.collection.bind( "reset", this.reset_collection );
        this.display_collection = new snapr.models.user_collection();
        this.display_collection.bind( "reset", this.render );

        this.change_page( {
            transition: this.transition
        });

        this.service = this.options.service;

        if (this.service)
        {
            this.search();
        }
        else
        {
            console.warn( "find friends linked services called without a service" );
        }
    },

    events: {
        "keyup input": "filter",
        "vclick .ui-input-clear": "filter",
        "click .x-back": "back"
    },

    render: function()
    {
        var people_list = this.$el.find("ul.people-list").empty();

        var people_li_template = _.template( $("#people-li-template").html() );

        if(this.display_collection.length){
            _.each( this.display_collection.models, function( model )
            {
                var people_li = new snapr.views.people_li({
                    template: people_li_template,
                    model: model
                });

                people_list.append( people_li.render().el );
            });
        }else{
            snapr.no_results.render('Oops.. Nobody here yet.', 'delete').$el.appendTo(people_list);
        }

        people_list.listview().listview("refresh");
    },

    reset_collection: function()
    {
        this.display_collection.reset( this.collection.models );
    },

    search: function()
    {
        var this_view = this;

        this_view.$el.addClass('loading');
        this_view.collection.fetch({
            data:{
                n:20,
                detail:1
            },
            url: snapr.api_base + '/linked_services/' + this.service + '/find_friends/',
            success: function(collection, response){
                this_view.xhr = null;
                this_view.$el.removeClass('loading');
                if(response.error){
                    var next = window.location.href;
                    if(response.error.code == 30){
                        Route.navigate( '#/twitter-xauth/?redirect='+ escape( next ) );
                    }else if(response.error.code == 20){
                        Route.navigate( '#/facebook-xauth/?redirect='+ escape( next ) );
                    }
                }
            }
        });
    },

    filter: function( e )
    {
        var keywords = $(e.currentTarget).val();

        if (keywords)
        {
            this.display_collection.reset( this.collection.filter(function( person )
            {
                return person.has("display_username") && person.get("display_username").indexOf( keywords ) > -1;
            }));
        }
        else
        {
            this.reset_collection();
        }

    }
});
