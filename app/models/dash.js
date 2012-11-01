/*global _  define require */
define(['config', 'backbone', 'collections/dash_stream'],
function(config, Backbone, dash_stream_collection){

return Backbone.Model.extend({

    // collections exist initially and are populated with reset() so that
    // events can be bound to them before the dash is fetched.
    streams: new dash_stream_collection(),
    featured_streams: new dash_stream_collection(),

    url: function( method ){
        return config.get('api_base') + '/user/dashboard/';
    },

    // override fetch to catch the display attributes for the dash
    // in the returned data not just it's models (streams)
    fetch: function( options ){
        options = options ? _.clone(options) : {};
        var success = options.success;
        options.success = function( model, d ){
            if(d && d.response && d.response.dashboard){

                // Dash attributes
                model.display = d.response.dashboard.display;

                // Streams
                model.streams.reset(d.response.dashboard.streams, {parse: true});
                model.featured_streams.reset(d.response.dashboard.featured_streams, {parse: true});

                // Extras - not collections because not dynamic
                model.competitions = d.response.dashboard.competitions;
                model.tumblr_feeds = d.response.dashboard.tumblr_feeds;
            }
            if (success){ success( model, d );}
        };
        return Backbone.Model.prototype.fetch.call(this, options);
    },

    // we don't atctally want to set any of the data as attributes
    parse: function(){return {};}
});
});
