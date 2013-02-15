/*global _  define require */
define(['views/base/view', 'views/base/page', 'backbone', 'collections/news_period', 'config', 'utils/string'],
    function(view, page_view, Backbone, news_period_collection, config, string_utils){

var activity_view=  page_view.extend({

    post_initialize: function(){
        this.collection = new news_period_collection();
        this.collection.bind( "reset", this.render );
        this.collection.data = {
            group_by: "day",
            n: config.get('activity_count')
        };
    },

    post_activate: function(){
        this.$(".x-activity-streams").empty();

        this.collection.fetch();

        this.change_page();
        $.mobile.showPageLoadingMsg();
    },

    get_override_tab: function(){ return 'me'; },

    render: function(){
        var $streams = this.$(".x-activity-streams").empty();

        var events = this.collection.filter( function( s ){
            return s.has("events") && s.get("events").length > 0;
        });

        if(events.length){

            if(!events[0].get("events").any(function(e){return e.has("photo");})){
                $streams.append( new activity_stream({
                    model: new Backbone.Model()
                }).render().el );
            }

            _.each( events, function( stream ){
                var stream_li = new activity_stream({
                    group_by: this.group_by,
                    model: stream
                }).render().el;

                $streams.append( stream_li );
            });

        }else{
            $streams.append( new activity_stream({
                model: new Backbone.Model({
                    type: "placeholder"
                })
            }).render().el );
        }

        $streams.trigger( "create" );
        $.mobile.hidePageLoadingMsg();

        return this;
    }

});

var activity_stream = view.extend({

    tagName: "li",

    className: "x-activity-stream",

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
                stream_summary += summary[ type ] + " " + T(type + string_utils.plural( summary[ type ] )) + " " ;
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
            photo_events: photo_events,
            events: this.model.get( "events" ) || []
        }));

        return this;
    }

});

return activity_view;
});
