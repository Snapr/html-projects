/*global _ Route define require */
define(['collections/photo', 'models/thumb'], function(photo_collection, thumb){
return photo_collection.extend({

    model: thumb,

    url: function( method ){
        return snapr.api_base + '/thumbs/';
    },

    comparator: function( model ){
        return - model.get("location").latitude;
    }
});
});
