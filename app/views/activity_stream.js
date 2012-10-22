/*global _  define require */
define(['views/base/view', 'utils/string'], function(view, string_utils){
var activity_stream = view.extend({

    tagName: "li",

    className: "activity-stream",

    initialize: function(){
        _.bindAll( this );

        this.group_by = this.options.group_by;

        this.load_template('components/activity_stream');
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
            time_period = string_utils.short_timestamp( this.model.get( "min_date" ), !!'relative', 'day' );
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
                    this.$(".x-photo-activity").append( stream_item.render().el );
                }else{
                    this.$(".x-non-photo-activity").append( stream_item.render().el );
                }

            }, this);
        }else{
            var stream_item = new activity_stream_item({
                model: this.model
            });

            this.$("x-activity").append( stream_item.render().el );
        }

        return this;
    }

});

var activity_stream_item = view.extend({

    tagName: "li",

    className: "activity-item",

    initialize: function(){
        _.bindAll( this );

        this.photo_events = this.options.photo_events;
        this.load_template('components/activity_item');
    },

    render: function(){
        var likes_list = _.map( this.model.get("favorites"), function(f){ return f.user.username; });

        this.$el.html( this.template({
            item: this.model,
            photo_events: this.photo_events,
            likes_list: this.model.get("favorites")
        }));

        return this;
    }

});

return activity_stream;
});
