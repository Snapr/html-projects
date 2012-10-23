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

        this.$(".x-people-list").empty();

        this.collection = new user_collection();

        this.collection.bind( "reset", _.bind(this.reset_collection, this) );

        this.change_page();

        var this_view = this;
        this_view.$el.addClass('x-loading');
        this.collection.fetch({
            data:{
                sort: "score",
                n:20
            },
            url: config.get('api_base') + '/user/search/',
            success: function(){
                this_view.$el.removeClass('x-loading');
            }
        });

        $.mobile.showPageLoadingMsg();

    },

    render: function()
    {
        var people_list = this.$(".x-people-list").empty();

        var leaderboard_li_template = this.get_template('components/leaderboard_item');

        if(this.collection.length){
            no_results.$el.remove();  // use remove(), hide() keeps it hidden and requires show() later
            _.each( this.collection.models, function( model, index ){
                var li = new leaderboard_li({
                    template: leaderboard_li_template,
                    model: model,
                    parentView: this,
                    rank: index+1
                });

                people_list.append( li.render().el );

            });
        }else{
            no_results.render('Oops.. Nobody here yet.', 'delete').$el.appendTo(this.$el);
        }

        people_list.listview().listview("refresh");
        $.mobile.hidePageLoadingMsg();
    },

    reset_collection: function(){
        this.render();
    }
});

});
