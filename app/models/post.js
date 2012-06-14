/*global _  define require */
define(['backbone'], function(Backbone){
return  Backbone.Model.extend({

    initialize: function(options){
        this.provider = options.provider;
    },

    url: function( method ){
        if (method == 'create'){
            return snapr.api_base + '/linked_services/' + this.provider + '/share/';
        }
    }
});
});
