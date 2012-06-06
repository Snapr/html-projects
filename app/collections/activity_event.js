snapr.models.activity_event_collection = Backbone.Collection.extend({

    model: snapr.models.activity_event,

    url: function( method )
    {
        return snapr.api_base + '/user/activity/';
    },

    parse: function( d, xhr )
    {
        if (d.response && d.response.news && d.response.news[0])
        {
            return d.response.news[0].events;
        }
        else
        {
            return [];
        }
    },

    summary: function()
    {
        var event_types = this.groupBy(function( event ){
            return event.get( "type" )
        });

        summary_object = {};

        if (event_types["photo-activity"])
        {
            var total_comments_array = _.map( event_types["photo-activity"], function( item ){
                return item.get( "total_comments" )
            });

            summary_object.comment = _.reduce( total_comments_array, function( memo, num ){
                return memo + num;
            }, 0);

            var total_comments_on_comments_array = _.map( event_types["photo-activity"], function( item ){
                return item.get( "total_comment-on-comments" )
            });

            summary_object.comment_on_comment = _.reduce( total_comments_on_comments_array, function( memo, num ){
                return memo + num;
            }, 0);

            var total_favorites_array = _.map( event_types["photo-activity"], function( item ){
                return item.get( "total_favorites" )
            });

            summary_object.like = _.reduce( total_favorites_array, function( memo, num ){
                return memo + num;
            }, 0);
        }

        _.map( event_types, function( value, key ){
            if (key != "photo-activity")
            {
                summary_object[key] = value.length;
            }
        });

        return summary_object;
    }

});
