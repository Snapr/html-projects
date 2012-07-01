/*global _  define require */
define(['config', 'backbone', 'models/spot'], function(config, Backbone, spot_model){

return Backbone.Collection.extend({
    model: spot_model,
    url: function( method ){
        return config.get('api_base') + '/spots/search/';
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
