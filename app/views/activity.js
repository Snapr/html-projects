snapr.views.activity = snapr.views.page.extend({

    initialize: function()
    {
        snapr.views.page.prototype.initialize.call( this );

        this.collection = new snapr.models.news_period_collection();

        this.collection.data = {
            group_by: "day",
            n: 50
        };

        this.collection.bind( "reset", this.render );
        this.$el.find(".activity-streams").empty();


        this.collection.fetch();

        this.change_page();
        $.mobile.showPageLoadingMsg();
    },

    render: function()
    {
        $streams = this.$el.find(".activity-streams").empty();

        var events = this.collection.filter( function( s )
        {
            return s.has("events") && s.get("events").length > 0;
        });

        var first = events[0];

        // add "latest yellow topbar" if the first date doesn't have a photo event
        if (first && first.get("events").first().has("photo") === false)
        {
            $streams.append( new snapr.views.activity_stream({
                model: new Backbone.Model()
            }).render().el );
        }
        if (!first)
        {
            $streams.append( new snapr.views.activity_stream({
                model: new Backbone.Model({
                    type: "placeholder"
                })
            }).render().el );
        }

        _.each( events, function( stream )
        {
            var stream_li = new snapr.views.activity_stream({
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
