/*global _  define require */
define(['config', 'views/base/page', 'collections/user', 'views/components/no_results', 'views/people_li'],
    function(config, page_view, user_collection, no_results, people_li){
return page_view.extend({

    post_initialize: function(){
        var dialog = this;
        this.$el.live( "pageshow", function(){
            dialog.$('#people-search').focus();
        });
        // undeligate events because the people el gets resued by other instances of this view
        this.$el.live( "pagehide", function(){
            dialog.undelegateEvents();
        });
    },

    post_activate: function(options){

        this.$el.find("ul.people-list").empty();
        this.$el.addClass('loading');

        // a simple array of people which will be filtered and displayed
        this.display_collection = [];

        this.collection = new user_collection();

        this.collection.bind( "reset", _.bind(this.reset_collection, this) );

        this.change_page();

        switch (options.follow){
            case "following":
                this.$el.find("h1").text("Following");
                this.$el.find("#people-search").val('').attr("placeholder", "Search users " + options.query.username + " is following\u2026" );
                this.collection.get_following( options.query.username );
                break;
            case "followers":
                this.$el.find("h1").text("Followers");
                this.$el.find("#people-search").val('').attr("placeholder", "Search " + options.query.username + "'s followers\u2026" );
                this.collection.get_followers( options.query.username );
                break;
            default:
                this.$el.find("h1").text("Search");
                this.$el.find("#people-search").val(options.query.username).attr("placeholder", "Search users\u2026" );

                var this_view = this;
                this_view.$el.addClass('loading');
                this.collection.fetch({
                    data:{
                        username:options.query.username,
                        n:20,
                        detail:1
                    },
                    url: config.get('api_base') + '/user/search/',
                    success: function(){
                        this_view.$el.removeClass('loading');
                    }
                });
                break;
        }

    },

    events: {
        "keyup input": "search",
        "click .ui-input-clear": "search"
    },

    render: function()
    {
        var people_list = this.$el.find("ul.people-list").empty();

        var people_li_template = _.template( $("#people-li-template").html() );

        if(this.collection.length){
            no_results.$el.remove();  // use remove(), hide() keeps it hidden and requires show() later
            _.each( this.collection.models, function( model )
            {
                var li = new people_li({
                    template: people_li_template,
                    model: model,
                    parentView: this
                });

                people_list.append( li.render().el );

            });
        }else{
            no_results.render('Oops.. Nobody here yet.', 'delete').$el.appendTo(this.$el);
        }

        this.$el.removeClass('loading');
        people_list.listview().listview("refresh");
    },

    reset_collection: function(){
        this.display_collection = _.clone( this.collection.models );
        this.render();
    },

    search: function(e)
    {

        var keywords = $(e.target).val();
        var this_view = this;

        this.timer && clearTimeout(this.timer);
        this.xhr && this.xhr.abort();

        var data = {
            n:20,
            detail:1
        };

        switch (this.options.follow){
            case "following":
                data.followed_by = this.options.query.username;
                data.username = keywords;
                break;
            case "followers":
                data.following = this.options.query.username;
                data.username = keywords;
                break;
            default:
                if (keywords.length > 1){
                    data.username = keywords;
                }
        }

        if(data.username || data.followed_by || data.following){

            this.timer = setTimeout( function() {
                this_view.timer = null;
                this_view.$el.addClass('loading');
                this_view.xhr = this_view.collection.fetch({
                    data: data,
                    url: config.get('api_base') + '/user/search/',
                    success: function(){
                        this_view.xhr = null;
                        this_view.$el.removeClass('loading');
                    }
                });
            }, 300 );

        }else{
            this_view.collection.reset();
        }
    },

    transition: "slideup"
});

});
