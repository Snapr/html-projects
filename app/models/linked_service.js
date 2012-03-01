snapr.models.linked_service = Backbone.Model.extend({

    initialize: function()
    {
        this.data = {linked_services: true}
    },

    //urlRoot: snapr.api_base + '/linked_services/',

    url: function( method )
    {
        if (method)
        {
            switch (method)
            {
                case 'create':
                    return snapr.api_base + '/linked_services/' + this.provider + '/';
                case 'update':
                    return snapr.api_base + '/linked_services/' + this.provider + '/';
                case 'delete':
                    return snapr.api_base + '/linked_services/' + this.provider + '/delete/';
                default:
                    return snapr.api_base + '/user/settings/';
            }
        }
        else
        {
            return snapr.api_base + '/linked_services/';
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
