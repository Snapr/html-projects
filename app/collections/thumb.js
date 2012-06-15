/*global _  define require */
define(['config', 'collections/photo', 'models/thumb'], function(config, photo_collection, thumb){
return photo_collection.extend({

    model: thumb,

    url: function( method ){
        return config.get('api_base') + '/thumbs/';
    },

    comparator: function( model ){
        return - model.get("location").latitude;
    }
});
});
