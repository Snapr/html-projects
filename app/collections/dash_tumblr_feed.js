/*global _  define require */
define(['config', 'backbone', 'models/dash_tumblr_feed'], function(config, Backbone, dash_tumblr_feed){
return Backbone.Collection.extend({

    model: dash_tumblr_feed

});

});
