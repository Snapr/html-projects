/*global _  define require */
define(['config', 'backbone', 'collections/dash_stream', 'collections/dash_tumblr_feed'],
function(config, Backbone, dash_stream_collection, dash_tumblr_feed_collection){

return Backbone.Model.extend({

    // defaults: {
    //     featured_streams: new dash_stream(),
    //     streams: new dash_stream()/*,
    //     tumblr_feeds: new tumblr_feed_collection()*/
    // },

    url: function( method ){
        return config.get('api_base') + '/user/dashboard/';
    },

    parse: function( d, xhr ){
        if (d.success && d.response){
            return {
                competitions: d.response.dashboard.competitions,
                featured_streams: new dash_stream_collection(d.response.dashboard.featured_streams, {parse: true}),
                streams: new dash_stream_collection(d.response.dashboard.streams, {parse: true}),
                tumblr_feeds: new dash_tumblr_feed_collection(d.response.dashboard.tumblr_feeds, {parse: true})
            };
        }
    },

    // override fetch to catch the display attributes for the dash
    // in the returned data not just it's models (streams)
    fetch: function( options ){
        options = options ? _.clone(options) : {};
        var success = options.success;
        options.success = function( model, d ){
            model.display = d && d.response && d.response.dashboard && d.response.dashboard.display;
            if (success){ success( model, d );}
        };
        return Backbone.Model.prototype.fetch.call(this, options);
    }
});
});
