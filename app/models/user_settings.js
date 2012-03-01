snapr.models.user_settings = Backbone.Model.extend({

    //urlRoot: snapr.api_base + '/user/',

    url: function( method )
    {
        if (method)
        {
            switch (method)
            {
                case 'create':
                    return snapr.api_base + '/user/signup/';
                case 'update':
                    return snapr.api_base + '/user/settings/';
                default:
                    this.data = _.extend( this.data || {}, {linked_services: true } );
                    return snapr.api_base + '/user/settings/';
            }
        }
        else
        {
            return snapr.api_base + '/user/';
        }
    },

    parse: function( d, xhr )
    {
        if (d.success && d.response)
        {
            return d.response;
        }
        else if (d.success)
        {
            // for new signups just return an empty object
            return {};
        }
    },

    linked_services_setup: function()
    {
        console.warn("linked_services_setup");

        var linked_services = this.get('linked_services');
        var ls = [];
        _.each( linked_services, function( service, key )
        {
            // create a new linked_service model for each linked service
            var linked = new snapr.models.linked_service( service );
            // set the provider so we know which url to hit if we want to make changes
            linked.provider = key;
            // remove the 'lined_services' data added above as we no longer need it
            delete linked.data;
            ls.push( linked );
        });
        // remove the linked_services object and replace it with our new models
        this.unset('linked_services');
        this.set({
            linked_services: ls
        });
    }
});
