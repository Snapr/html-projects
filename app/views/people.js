/*global _  define require T */
define(['config', 'views/base/page', 'collections/user', 'views/components/no_results', 'views/people_li'],
    function(config, page_view, user_collection, no_results, people_li){
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

        this.$(".x-people-list").empty();
        this.$el.addClass('x-loading');

        // a simple array of people which will be filtered and displayed
        this.display_collection = [];

        this.collection = new user_collection();

        this.collection.bind( "reset", _.bind(this.reset_collection, this) );

        this.change_page();

        switch (options.follow){
            case "following":
                this.$("h1").text(T("Following"));
                this.$(".x-search-field").val('').attr("placeholder", T("Search users")+" " + options.query.username + " "+T("is following")+"\u2026" );
                this.collection.get_following( options.query.username );
                break;
            case "followers":
                this.$("h1").text(T("Followers"));
                this.$(".x-search-field").val('').attr("placeholder", T("Search")+" " + options.query.username + "'s "+T("followers")+"\u2026" );
                this.collection.get_followers( options.query.username );
                break;
            default:
                this.$("h1").text(T("Search"));
                this.$(".x-search-field").val(options.query.username).attr("placeholder", T("Search users")+"\u2026" );

                var this_view = this;
                this_view.$el.addClass('x-loading');
                this.collection.fetch({
                    data:{
                        username:options.query.username,
                        n:20,
                        detail:1,
                        sort: config.get('get_user_points') ? 'score' : ''
                    },
                    url: config.get('api_base') + '/user/search/',
                    success: function(){
                        this_view.$el.removeClass('x-loading');
                    }
                });
                break;
        }

    },

    events: {
        "keyup input": "search",
        "click .ui-input-clear": "search"
    },

    render: function(){
        var people_list = this.$(".x-people-list").empty();

        var people_li_template = this.get_template('components/person');

        if(this.collection.length){
            no_results.$el.remove();  // use remove(), hide() keeps it hidden and requires show() later
            _.each( this.collection.models, function( model ){
                var li = new people_li({
                    template: people_li_template,
                    model: model,
                    parentView: this
                });

                people_list.append( li.render().el );

            });
        }else{
            no_results.render(T('Oops.. Nobody here yet.'), 'delete').$el.insertBefore(people_list);
        }

        this.$el.removeClass('x-loading');
        people_list.listview().listview("refresh");
    },

    reset_collection: function(){
        this.display_collection = _.clone( this.collection.models );
        this.render();
    },

    search: function(e){

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
                this_view.$el.addClass('x-loading');
                this_view.xhr = this_view.collection.fetch({
                    data: data,
                    url: config.get('api_base') + '/user/search/',
                    success: function(){
                        this_view.xhr = null;
                        this_view.$el.removeClass('x-loading');
                    }
                });
            }, 300 );

        }else{
            this_view.collection.reset();
        }
    }
});

});
