/*global _  define require */
define(['config', 'backbone'], function(config, Backbone){
return Backbone.Model.extend({
    urlRoot: function(){
        return config.get('api_base') + '/comps/';
    },
    url: function( method ){
        return this.urlRoot();
    },
    parse: function( d, xhr ){
        // handle cases where we're parsing response from a direct server request
        if (d.response && d.response.comp){
            return d.response.comp;
        }
        // handle cases where we're parsing a response from a collection
        else if (d.id){
            return d;
        }else{
            return {};
        }
    }
});});
