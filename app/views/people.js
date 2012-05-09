snapr.views.people = snapr.views.dialog.extend({

    initialize: function()
    {
        snapr.views.dialog.prototype.initialize.call( this );

        this.$el.find("ul.people-list").empty();

        // a simple array of people which will be filtered and displayed
        this.display_collection = [];

        this.collection = new snapr.models.user_collection();

        this.collection.bind( "reset", this.reset_collection );

        // if we are coming from the map view do a flip, otherwise do a slide transition
        if ($.mobile.activePage.attr('id') == 'map' )
        {
            var transition = "flip";
        }
        else
        {
            var transition = "slideup";
        }

        this.change_page({
            transition: transition
        });

        switch (this.options.follow){
            case "following":
                this.$el.find("h1").text("Following");
                this.$el.find("#people-search").val('').attr("placeholder", "Search users " + this.options.query.username + " is following…" );
                this.collection.get_following( this.options.query.username );
                break;
            case "followers":
                this.$el.find("h1").text("Followers");
                this.$el.find("#people-search").val('').attr("placeholder", "Search " + this.options.query.username + "'s followers…" );
                this.collection.get_followers( this.options.query.username );
                break;
            default:
                this.$el.find("h1").text("Search");
                this.$el.find("#people-search").val(this.options.query.username).attr("placeholder", "Search users…" );

                var this_view = this;
                this_view.$el.addClass('loading');
                this.collection.fetch({
                    data:{
                        username:this.options.query.username,
                        n:20,
                        detail:1
                    },
                    url: snapr.api_base + '/user/search/',
                    success: function(){
                        this_view.$el.removeClass('loading');
                    }
                });
                break;
        }

        var dialog = this;
        this.$el.live( "pageshow", function( e, ui ){
            dialog.$('#people-search').focus();
        });

    },

    events: {
        "keyup input": "search",
        "click .ui-input-clear": "search",
        "click .x-back": "back"
    },

    render: function()
    {
        var people_list = this.$el.find("ul.people-list").empty();

        var people_li_template = _.template( $("#people-li-template").html() );

        if(this.collection.length){
            console.log('results');
            snapr.no_results.$el.remove();  // use remove(), hide() keeps it hidden and requires show() later
            _.each( this.collection.models, function( model )
            {
                var people_li = new snapr.views.people_li({
                    template: people_li_template,
                    model: model,
                    parentView: this
                });

                people_list.append( people_li.render().el );

            });
        }else{
            snapr.no_results.render('Oops.. Nobody here yet.', 'delete').$el.appendTo(this.$el);
        }

        people_list.listview().listview("refresh");
    },

    reset_collection: function()
    {
        this.display_collection = _.clone( this.collection.models );
        this.render();
    },

    search: function(e)
    {

        var keywords = $(e.target).val();
        var this_view = this;

        this.timer && clearTimeout(this.timer);
        this.xhr && this.xhr.abort();

        if (keywords.length > 1){

            this.timer = setTimeout( function() {
                this_view.timer = null;
                this_view.$el.addClass('loading');
                this_view.xhr = this_view.collection.fetch({
                    data:{
                        username:keywords,
                        n:20,
                        detail:1
                    },
                    url: snapr.api_base + '/user/search/',
                    success: function(){
                        this_view.xhr = null;
                        this_view.$el.removeClass('loading');
                    }
                });
            }, 300 );

        }else{
            this_view.collection.reset();
        }
    }
});
