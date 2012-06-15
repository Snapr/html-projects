/*global _  define require */
define(['config', 'backbone'], function(config, Backbone){
return  Backbone.Model.extend({

    initialize: function()
    {
        this.data = {linked_services: true}
    },

    //urlRoot: config.get('api_base') + '/linked_services/',

    url: function( method )
    {
        if (method)
        {
            switch (method)
            {
                case 'create':
                    return config.get('api_base') + '/linked_services/' + this.provider + '/';
                case 'update':
                    return config.get('api_base') + '/linked_services/' + this.provider + '/';
                case 'delete':
                    return config.get('api_base') + '/linked_services/' + this.provider + '/delete/';
                default:
                    return config.get('api_base') + '/user/settings/';
            }
        }
        else
        {
            return config.get('api_base') + '/linked_services/';
        }
    },

    parse: function( d, xhr )
    {
        if (d.response && d.response.linked_services[this.provider])
        {
            return d.response.linked_services[this.provider];
        }
        else
        {
            return {}
        }
    }
});
});
