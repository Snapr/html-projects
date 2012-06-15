/*global _  define require */
define(['config', 'backbone'], function(config, Backbone){
return Backbone.Model.extend({
    urlRoot: function(){
        return config.get('api_base') + '/comment/';
    },
    url: function( method ){
        if (method)
        {
            switch( method )
            {
                case 'create':
                    return this.urlRoot();
                case 'update':
                    return this.urlRoot() + 'edit/';
                case 'delete':
                    return this.urlRoot() + 'delete/';
                default:
                    return this.urlRoot();
            }
        }
        else
        {
            return this.urlRoot();
        }
    }
});});
