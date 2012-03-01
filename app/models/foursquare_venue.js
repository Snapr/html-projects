snapr.models.foursquare_venue = Backbone.Model.extend({

    url: function( method )
    {
        return snapr.api_base + '/linked_services/foursquare/venues/';
    },

    parse: function( d, xhr )
    {
        if (d.response &&
            d.response.foursquare_response &&
            d.response.foursquare_response.response &&
            d.response.foursquare_response.response.venues)
        {
            return d.response.foursquare_response.response.venues;
        }
        else
        {
            return [];
        }
    }

});
