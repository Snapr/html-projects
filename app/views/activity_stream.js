define(['backbone'], function(Backbone){
return Backbone.View.extend({

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

        var event_types = ["like", "comment_on_comment", "comment", "follow"];

        var comment_count = 0;

        _.each( event_types, function(type)
        {
            if (type == "comment_on_comment")
            {
                comment_count += summary[type];
                summary[type] = 0;
            }
            else if(type == "comment")
            {
                summary[type] += comment_count;
            }

            if (summary[type])
            {
                stream_summary += summary[ type ] + " " + type + snapr.utils.plural( summary[ type ] ) + " " ;
            }
        });

        if (time_period = this.model.has( "min_date" ))
        {
            var time_period = snapr.utils.short_timestamp( this.model.get( "min_date" ), true )
            var photo_events = summary && (summary["like"] || summary["comment"] || summary["comment_on_comment"]) ? true: false;
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

        if (!this.model.has( "events" ))
        {
            var stream_item = new snapr.views.activity_stream_item({
                model: this.model
            });

            this.$el.find("ul").append( stream_item.render().el );
        }

        return this;
    }

})
});
