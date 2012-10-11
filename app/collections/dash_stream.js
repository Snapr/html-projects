/*global _  define require */
define(['config', 'backbone', 'models/dash_stream'], function(config, Backbone, dash_stream_model){
    return Backbone.Collection.extend({
        model: dash_stream_model
    });
});
