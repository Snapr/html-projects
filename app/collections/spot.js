/*global _  define require */
define(['config', 'backbone', 'models/spot'], function(config, Backbone, spot_model){

return Backbone.Collection.extend({
    model: spot_model,
    url: function( method ){
        return config.get('api_base') + '/spots/search/';
    },
    fetch: function(options){
        if(options.data && options.data.min_photo_rating === undefined && config.has('min_photo_rating')){
            options.data.min_photo_rating = config.get('min_photo_rating');
        }
        return Backbone.Collection.prototype.fetch.call(this, options);
    },
    parse: function( d, xhr ){
        if (d.response && d.response.spots){
            return d.response.spots;
        }else{
            return [];
        }
    }
});

});
