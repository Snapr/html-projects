/*global _  define require */
define(['config', 'backbone', 'models/comp'], function(config, Backbone, comp_model){

return Backbone.Collection.extend({
    model: comp_model,
    url: function( method ){
        return config.get('api_base') + '/comps/search/';
    },
    parse: function( d, xhr ){
        if (d.response && d.response.comp){
            return d.response.comp;
        }else{
            return [];
        }
    }
});

});
