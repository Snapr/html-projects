/*global _  define require */
define(['config', 'views/base/page', 'collections/user', 'views/components/no_results', 'views/leaderboard_li'],
    function(config, page_view, user_collection, no_results, leaderboard_li){
return page_view.extend({

    post_initialize: function(){
        var dialog = this;
        // undeligate events because the people el gets resued by other instances of this view
        this.$el.live( "pagehide", function(){
            dialog.undelegateEvents();
        });
    },

    post_activate: function(options){
        // because of the above fix (undeligate on pagehide) we must make sure
        // subsequent activations of the same view deligate events again.
        // TODO: do this more cleanly
        this.undelegateEvents();
        this.delegateEvents();

        this.$el.find("ul.people-list").empty();
        this.$el.addClass('loading');

        // a simple array of people which will be filtered and displayed
        this.display_collection = [];

        this.collection = new user_collection();

        this.collection.bind( "reset", _.bind(this.reset_collection, this) );

        this.change_page();

        var this_view = this;
        this_view.$el.addClass('loading');
        this.collection.fetch({
            data:{
                sort: "score",
                n:20,
                detail:1
            },
            url: config.get('api_base') + '/user/search/',
            success: function(){
                this_view.$el.removeClass('loading');
            }
        });

    },

    render: function()
    {
        var people_list = this.$el.find("ul.people-list").empty();

        var leaderboard_li_template = _.template( $("#leaderboard-li-template").html() );

        if(this.collection.length){
            no_results.$el.remove();  // use remove(), hide() keeps it hidden and requires show() later
            _.each( this.collection.models, function( model )
            {
                var li = new leaderboard_li({
                    template: leaderboard_li_template,
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
    }
});

});
