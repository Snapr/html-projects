/*global _  define require */
define(['backbone', 'utils/string'], function(Backbone, string_utils){
var activity_stream = Backbone.View.extend({

    tagName: "li",

    className: "activity-stream",

    initialize: function(){
        _.bindAll( this );

        this.group_by = this.options.group_by;

        this.template = _.template( $("#activity-stream-template").html() );

    },

    render: function(){
        var stream_summary = "";

        var summary = this.model.has( "events" ) && this.model.get( "events" ).summary();

        var event_types = ["like", "comment_on_comment", "comment", "follow"];

        var comment_count = 0;

        _.each( event_types, function(type){
            if (type == "comment_on_comment"){
                comment_count += summary[type];
                summary[type] = 0;
            }else if(type == "comment"){
                summary[type] += comment_count;
            }

            if (summary[type]){
                stream_summary += summary[ type ] + " " + type + string_utils.plural( summary[ type ] ) + " " ;
            }
        });

        var time_period,
            photo_events;
        if (this.model.has( "min_date" )){
            time_period = string_utils.short_timestamp( this.model.get( "min_date" ), true );
            photo_events = summary && (summary.like || summary.comment || summary.comment_on_comment) ? true: false;
        }else{
            time_period = "Latest";
            photo_events = true;
        }

        this.$el.html( this.template({
            time_period: time_period,
            stream_summary: stream_summary,
            photo_events: photo_events
        }));


        if (this.model.has( "events" )){
            this.model.get( "events" ).each( function( item ){
                var stream_item = new activity_stream_item({
                    model: item,
                    photo_events: photo_events
                });
                if (photo_events){
                    this.$el.find("ul.photo-activity").append( stream_item.render().el );
                }else{
                    this.$el.find("ul.non-photo-activity").append( stream_item.render().el );
                }

            }, this);
        }else{
            var stream_item = new activity_stream_item({
                model: this.model
            });

            this.$el.find("ul").append( stream_item.render().el );
        }

        return this;
    }

});

var activity_stream_item = Backbone.View.extend({

    tagName: "li",

    className: "activity-item",

    initialize: function(){
        _.bindAll( this );

        this.photo_events = this.options.photo_events;
        this.template = _.template( $("#activity-stream-item-template").html() );
    },

    render: function(){
        var likes_list = _.map( this.model.get("favorites"), function(f){ return f.user.username; });

        this.$el.html( this.template({
            item: this.model,
            photo_events: this.photo_events,
            likes_list: likes_list
        }));

        switch (this.model.get("type")){
            case "photo-activity":
                this.$el.addClass("activity-image-item");
                break;
            case "follow":
                this.$el.addClass("activity-follow-item");
                break;
        }
        return this;
    }

});

return activity_stream;
});
