/*global _  define require */
define(['views/base/page', 'backbone', 'collections/news_period', 'views/activity_stream', 'config'],
    function(page_view, Backbone, news_period_collection, activity_stream, config){
return page_view.extend({

    post_initialize: function(){
        this.collection = new news_period_collection();
        this.collection.bind( "reset", this.render );
        this.collection.data = {
            group_by: "day",
            n: config.get('activity_count')
        };
    },

    post_activate: function(){
        this.$el.find(".activity-streams").empty();

        this.collection.fetch();

        this.change_page();
        $.mobile.showPageLoadingMsg();
    },
    
    get_override_tab: function(){ return 'feed'; },
    
    

    render: function(){
        var $streams = this.$el.find(".activity-streams").empty();

        var events = this.collection.filter( function( s ){
            return s.has("events") && s.get("events").length > 0;
        });

        var first = events[0];

        // add "latest yellow topbar" if the first date doesn't have a photo event
        if (first && !first.get("events").any(function(e){return e.has("photo");})){
            $streams.append( new activity_stream({
                model: new Backbone.Model()
            }).render().el );
        }
        if (!first){
            $streams.append( new activity_stream({
                model: new Backbone.Model({
                    type: "placeholder"
                })
            }).render().el );
        }

        _.each( events, function( stream ){
            var stream_li = new activity_stream({
                group_by: this.group_by,
                model: stream
            }).render().el;

            $streams.append( stream_li );
        });

        $streams.trigger( "create" );
        $.mobile.hidePageLoadingMsg();

        return this;
    }

});
});
