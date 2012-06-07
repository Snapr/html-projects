/*global _ Route define require */
define(['backbone', 'models/dash_stream'],
function(Backbone,   dash_stream_model){

return Backbone.Collection.extend({

    model: dash_stream_model,

    url: function( method )
    {
        return snapr.api_base + '/user/dashboard/';
    },

    parse: function( d, xhr )
    {
        if (d.success && d.response)
        {
            return d.response.dashboard.streams;
        }
    },

    // override fetch to catch the display attributes for the dash
    // in the returned data not just it's models (streams)
    fetch: function( options )
    {
        options = options ? _.clone(options) : {};
        var success = options.success;
        options.success = function( collection, d )
        {
            collection.display = d && d.response && d.response.dashboard && d.response.dashboard.display;
            if (success){ success( collection, d );}
        };
        return Backbone.Collection.prototype.fetch.call(this, options);
    }
});
});
