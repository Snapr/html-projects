/*global _  define require */
define(['config', 'backbone'], function(config, Backbone){
return  Backbone.Model.extend({
    initialize: function( init_options ){
        if (init_options.latitude && init_options.longitude){
            this.data = {
                latitude: init_options.latitude,
                longitude: init_options.longitude
            };
        }
    },
    url: function( method ){
        return config.get('api_base') + '/utils/reverse_geocode/';
    },
    parse: function( d, xhr ){
        if (d.response && d.response.location){
            return d.response;
        }
    }
});
});
