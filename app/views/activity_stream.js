snapr.views.activity_stream = Backbone.View.extend({

    tagName: "li",

    className: "activity-stream",

    initialize: function()
    {
        _.bindAll( this );

        this.group_by = this.options.group_by;

        this.template = _.template( $("#activity-stream-template").html() );

    },

    render: function()
    {
        var stream_summary = "";

        var summary = this.model.has( "events" ) && this.model.get( "events" ).summary();

        var event_types = ["like", "comment", "follow", "comment-on-comment"];

        _.each( event_types, function(type)
        {
            if (summary[type])
            {
                stream_summary += summary[ type ] + " " + type + snapr.utils.plural( summary[ type ] ) + " " ;
            }
        })

        if (time_period = this.model.has( "min_date" ))
        {
            var time_period = snapr.utils.short_timestamp( this.model.get( "min_date" ), true )
            var photo_events = (summary["like"] || summary["comment"] || summary["comment-on-comment"]) ? true: false;
        }
        else
        {
            var time_period = "Latest";
            var photo_events = true;
        }

        this.$el.html( this.template({
            time_period: time_period,
            stream_summary: stream_summary,
            photo_events: photo_events
        }));

        this.model.has( "events" ) && this.model.get( "events" ).each( function( item )
        {
            var stream_item = new snapr.views.activity_stream_item({
                model: item,
                photo_events: photo_events
            });
            if (photo_events)
            {
                this.$el.find("ul.photo-activity").append( stream_item.render().el );
            }
            else
            {
                this.$el.find("ul.non-photo-activity").append( stream_item.render().el );
            }

        }, this);

        return this;
    }

})
