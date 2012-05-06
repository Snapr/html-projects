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

        this.collection.fetch();

        this.change_page();
    },

    render: function()
    {
        $streams = this.$el.find(".activity-streams").empty();

        var first = this.collection.first();

        // add "latest yellow topbar" if the first date doesn't have a photo event
        if (first && first.has("events") && first.get("events").length && first.get("events").photo == undefined)
        {
            $streams.append( new snapr.views.activity_stream({
                model: new Backbone.Model()
            }).render().el );
        }

        _.each( this.collection.models, function( stream )
        {
            if (stream.get( "events" ).length)
            {
                $streams.append( new snapr.views.activity_stream({
                    group_by: this.group_by,
                    model: stream
                }).render().el );
            }
        });

        $streams.trigger( "create" );

        return this;
    }

})
