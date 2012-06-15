/*global _  define require */
define(['config', 'backbone'], function(config, Backbone){
return  Backbone.Model.extend({

    initialize: function(options){
        this.provider = options.provider;
    },

    url: function( method ){
        if (method == 'create'){
            return config.get('api_base') + '/linked_services/' + this.provider + '/share/';
        }
    }
});
});
