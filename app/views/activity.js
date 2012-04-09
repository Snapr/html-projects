snapr.views.activity = Backbone.View.extend({

    el: $('#activity'),

    events: {
       // "click #popular-timeframe a":"update_list"
    },

    initialize: function()
    {
        _.bindAll( this );

        this.collection = new snapr.models.news_period_collection();

        this.collection.data = {
            group_by: "day",
            n: 50
        };

        this.collection.bind( "reset", this.render );

        this.collection.fetch();

        this.el.live('pagehide', function( e )
        {
            $(e.target).undelegate();

            return true;
        });

        $.mobile.changePage( $("#activity"), {
            changeHash: false
        });
    },

    render: function()
    {
        $streams = $(this.el).find(".activity-streams").empty();

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
