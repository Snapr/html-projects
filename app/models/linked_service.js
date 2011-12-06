tripmapper.models.linked_service = Backbone.Model.extend({

    initialize: function()
    {
        this.data = {linked_services: true}
    },
    
    urlRoot: tripmapper.api_base + '/linked_services/',
    
    url: function( method )
    {
        if (method)
        {
            switch (method)
            {
                case 'create':
                    return this.urlRoot + this.provider + '/';
                case 'update':
                    return this.urlRoot + this.provider + '/';
                case 'delete':
                    return this.urlRoot + this.provider + '/delete/';
                default:
                    return tripmapper.api_base + '/user/settings/';
            }
        }
        else
        {
            return this.urlRoot;
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